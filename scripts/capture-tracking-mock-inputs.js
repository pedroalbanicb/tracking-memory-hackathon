#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const DEFAULT_SKU_FILE = path.resolve(__dirname, "..", "docs", "db_oferta_disponibilidade.DisponibilidadeSkuListaRegiao.json");
const DEFAULT_OUTPUT = path.resolve(__dirname, "output", "tracking-mock-inputs.json");

const GRAPHQL_QUERY = `
query GetMercadorias($skip: Int!, $take: Int!, $sku: Long) {
  mercadorias(
    skip: $skip
    take: $take
    order: { id: ASC }
    where: {
      and: [
        {
          or: [
            { dePara: { idSkuLoja: { eq: $sku } } }
            { dePara: { idSkuOn: { eq: $sku } } }
            { dePara: { idKitLoja: { eq: $sku } } }
          ]
        }
        { tipoMercadoria: { nome: { neq: "Conjunto" } } }
      ]
    }
  ) {
    items {
      id
      nome
      dePara { idSkuLoja idSkuOn idKitLoja }
      tipoMercadoria { nome }
      situacaoCadastral { tipoSituacaoCadastral { nome } }
    }
  }
}
`;

const MONGO_QUERY_PATHS = [
  "IdSku",
  "idSku",
  "idSkuSite",
  "sku",
  "skuSite",
  "dePara.idSkuOn",
  "mercadorias.idSkuSite",
  "skus.idSkuSite",
  "variacoes.idSkuSite"
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    skuFile: process.env.TRACKING_SKU_FILE || DEFAULT_SKU_FILE,
    outFile: process.env.TRACKING_MOCK_INPUTS_OUT || DEFAULT_OUTPUT,
    limit: Number(process.env.TRACKING_MOCK_LIMIT || 100),
    graphqlUrl: process.env.GRAPHQL_URL || "",
    graphqlKey: process.env.GRAPHQL_KEY || "",
    ofertaBaseUrl: process.env.OFERTA_BASE_URL || "",
    ofertaToken: process.env.OFERTA_TOKEN || "",
    mongoUri: process.env.MONGO_URI || "",
    mongoDb: process.env.MONGO_DB || "db_prd_casasbahia",
    mongoCollection: process.env.MONGO_COLLECTION || "produto"
  };

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    const next = args[index + 1];

    if (current === "--sku-file" && next) {
      options.skuFile = path.resolve(next);
      index += 1;
    } else if (current === "--out" && next) {
      options.outFile = path.resolve(next);
      index += 1;
    } else if (current === "--limit" && next) {
      options.limit = Number(next);
      index += 1;
    } else if (current === "--graphql-url" && next) {
      options.graphqlUrl = next;
      index += 1;
    } else if (current === "--graphql-key" && next) {
      options.graphqlKey = next;
      index += 1;
    } else if (current === "--oferta-base-url" && next) {
      options.ofertaBaseUrl = next;
      index += 1;
    } else if (current === "--oferta-token" && next) {
      options.ofertaToken = next;
      index += 1;
    } else if (current === "--uri" && next) {
      options.mongoUri = next;
      index += 1;
    } else if (current === "--db" && next) {
      options.mongoDb = next;
      index += 1;
    } else if (current === "--collection" && next) {
      options.mongoCollection = next;
      index += 1;
    }
  }

  return options;
}

function readSourceSkus(filePath, limit) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const seen = new Set();
  const items = [];

  parsed.forEach((entry) => {
    const sku = String(entry.IdSku && entry.IdSku.$numberLong ? entry.IdSku.$numberLong : entry.IdSku);
    if (!sku || seen.has(sku) || items.length >= limit) {
      return;
    }

    seen.add(sku);
    items.push({
      skuOn: sku,
      disponibilidade: {
        nacional: Boolean(entry.Nacional),
        totalRegioes: Array.isArray(entry.Regioes) ? entry.Regioes.length : 0,
        totalRegioesRetira: Array.isArray(entry.RegioesRetira) ? entry.RegioesRetira.length : 0,
        atualizadoEm: entry.DataAlteracaoSku && entry.DataAlteracaoSku.$date ? entry.DataAlteracaoSku.$date : null
      }
    });
  });

  return items;
}

async function fetchGraphQLSku(graphqlUrl, graphqlKey, sku) {
  if (!graphqlUrl) {
    return null;
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(graphqlKey ? { "x-consumer-username": graphqlKey } : {})
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: {
        skip: 0,
        take: 5,
        sku: Number(sku)
      }
    })
  });

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    return {
      ok: false,
      error: payload.errors || payload
    };
  }

  const item = payload.data && payload.data.mercadorias && payload.data.mercadorias.items
    ? payload.data.mercadorias.items[0]
    : null;

  return item
    ? {
        ok: true,
        id: item.id,
        nome: item.nome,
        skuOff: item.dePara ? item.dePara.idSkuLoja : null,
        skuOn: item.dePara ? item.dePara.idSkuOn : null,
        tipoMercadoria: item.tipoMercadoria ? item.tipoMercadoria.nome : null,
        situacaoCadastral: item.situacaoCadastral && item.situacaoCadastral.tipoSituacaoCadastral
          ? item.situacaoCadastral.tipoSituacaoCadastral.nome
          : null
      }
    : { ok: true, notFound: true };
}

async function fetchOfertaSku(ofertaBaseUrl, ofertaToken, sku) {
  if (!ofertaBaseUrl) {
    return null;
  }

  const url = `${ofertaBaseUrl.replace(/\/$/, "")}/v1/Preco/Sku/PrecoVenda?IdsSku=${encodeURIComponent(sku)}`;
  const response = await fetch(url, {
    headers: {
      accept: "text/plain",
      ...(ofertaToken ? { Authorization: `Bearer ${ofertaToken}` } : {})
    }
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: payload
    };
  }

  const precoSku = payload && Array.isArray(payload.PrecoSkus) ? payload.PrecoSkus[0] : null;
  return {
    ok: true,
    temEstoque: Boolean(precoSku && precoSku.PrecoVenda && precoSku.PrecoVenda.DisponibilidadeEstoque),
    precificadoSite: Boolean(payload && payload.Valido),
    payload
  };
}

function normalizeMongoCandidates(root, accumulator = [], currentPath = "") {
  if (root === null || root === undefined) {
    return accumulator;
  }

  if (Array.isArray(root)) {
    root.forEach((item, index) => normalizeMongoCandidates(item, accumulator, `${currentPath}[${index}]`));
    return accumulator;
  }

  if (typeof root !== "object") {
    return accumulator;
  }

  const skuValue = root.IdSku || root.idSku || root.idSkuSite || root.sku || root.skuSite || null;
  const descricao = root.descricaoSku || root.nome || root.descricao || root.title || null;

  if (skuValue || descricao) {
    accumulator.push({
      path: currentPath || "$root",
      sku: skuValue === null || skuValue === undefined ? null : String(skuValue),
      descricao
    });
  }

  Object.entries(root).forEach(([key, value]) => {
    const nextPath = currentPath ? `${currentPath}.${key}` : key;
    normalizeMongoCandidates(value, accumulator, nextPath);
  });

  return accumulator;
}

async function fetchMongoSku(collection, sku) {
  if (!collection) {
    return null;
  }

  const numericSku = Number(sku);
  const orFilters = MONGO_QUERY_PATHS.flatMap((field) => ([
    { [field]: sku },
    { [field]: numericSku }
  ]));

  const documents = await collection.find({ $or: orFilters }, { limit: 5 }).toArray();
  const candidates = documents.flatMap((document) => normalizeMongoCandidates(document));
  const exactMatches = candidates.filter((candidate) => candidate.sku === String(sku));
  const descricao = exactMatches.find((candidate) => candidate.descricao)?.descricao || null;

  return {
    ok: true,
    totalDocuments: documents.length,
    descricao,
    candidatePaths: exactMatches.slice(0, 5)
  };
}

function ensureOutputDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function main() {
  const options = parseArgs();
  const sourceItems = readSourceSkus(options.skuFile, options.limit);

  let client = null;
  let collection = null;

  if (options.mongoUri) {
    client = new MongoClient(options.mongoUri, { appName: "tracking-mock-capture" });
    await client.connect();
    collection = client.db(options.mongoDb).collection(options.mongoCollection);
  }

  try {
    const items = [];

    for (const sourceItem of sourceItems) {
      const [graphql, oferta, mongo] = await Promise.all([
        fetchGraphQLSku(options.graphqlUrl, options.graphqlKey, sourceItem.skuOn),
        fetchOfertaSku(options.ofertaBaseUrl, options.ofertaToken, sourceItem.skuOn),
        fetchMongoSku(collection, sourceItem.skuOn)
      ]);

      items.push({
        skuOn: sourceItem.skuOn,
        skuOff: graphql && graphql.ok ? graphql.skuOff : null,
        mercadoria: mongo && mongo.descricao ? mongo.descricao : graphql && graphql.ok ? graphql.nome : null,
        disponibilidade: sourceItem.disponibilidade,
        graphql,
        oferta,
        mongo
      });
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      source: {
        skuFile: options.skuFile,
        totalSkus: items.length
      },
      integrations: {
        graphqlEnabled: Boolean(options.graphqlUrl),
        ofertaEnabled: Boolean(options.ofertaBaseUrl),
        mongoEnabled: Boolean(options.mongoUri)
      },
      items
    };

    ensureOutputDirectory(options.outFile);
    fs.writeFileSync(options.outFile, JSON.stringify(payload, null, 2));
    console.log(`Snapshot gerado em ${options.outFile} com ${items.length} SKU(s).`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});