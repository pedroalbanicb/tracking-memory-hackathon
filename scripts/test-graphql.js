#!/usr/bin/env node

/**
 * GraphQL validator for Tracking ADR-002 using real Hub Catalog endpoint
 *
 * O que faz:
 * - Executa a query real de mercadorias (mesmo formato do curl enviado)
 * - Valida estrutura minima do retorno
 * - Opcionalmente tenta introspection para listar o que o schema expoe
 *
 * Uso:
 *   node scripts/test-graphql.js
 *   node scripts/test-graphql.js --sku 55072185 --take 5
 *   node scripts/test-graphql.js --out scripts/graphql-response.json
 *   node scripts/test-graphql.js --introspection
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_URL = "https://gestaoproduto-hub-catalogo-dev.viavarejo.com.br/graphql/";
const DEFAULT_ORIGIN = "https://go-sit.via.com.br";
const DEFAULT_REFERER = "https://go-sit.via.com.br/";
const DEFAULT_CONSUMER = "teste";

const MERCADORIAS_QUERY = `
query GetMercadorias($skip: Int!, $take: Int!, $sku: Long, $search: String, $operation: String) {
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
    pageInfo { hasNextPage hasPreviousPage }
    items {
      id
      nome
      dePara { idSkuLoja idSkuOn idKitLoja }
      tipoMercadoria { id nome }
      situacaoCompra { id nome ativo }
      estruturaGerencial { categoria { id nome } }
      situacaoCadastral {
        tipoSituacaoCadastral { nome }
        flagCompraSuspensa
        flagCompraProibida
      }
      preVenda { data }
    }
  }
}
`;

const MERCADORIAS_QUERY_COMPAT = `
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
    pageInfo { hasNextPage hasPreviousPage }
    items {
      id
      nome
      dePara { idSkuLoja idSkuOn idKitLoja }
      tipoMercadoria { id nome }
      situacaoCompra { id nome ativo }
      estruturaGerencial { categoria { id nome } }
      situacaoCadastral {
        tipoSituacaoCadastral { nome }
        flagCompraSuspensa
        flagCompraProibida
      }
      preVenda { data }
    }
  }
}
`;

const INTROSPECTION_QUERY = `
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    types {
      kind
      name
      fields(includeDeprecated: true) {
        name
        type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
    }
  }
}
`;

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    url: process.env.GRAPHQL_URL || DEFAULT_URL,
    token: process.env.GRAPHQL_TOKEN || "",
    outFile: process.env.GRAPHQL_OUT || "",
    sku: Number(process.env.GRAPHQL_SKU || 55072185),
    skip: Number(process.env.GRAPHQL_SKIP || 0),
    take: Number(process.env.GRAPHQL_TAKE || 5),
    search: process.env.GRAPHQL_SEARCH || "",
    operation: process.env.GRAPHQL_OPERATION || "or",
    consumer: process.env.GRAPHQL_CONSUMER || DEFAULT_CONSUMER,
    tryIntrospection: false
  };

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--url" && args[i + 1]) {
      out.url = args[i + 1];
      i += 1;
    } else if (args[i] === "--token" && args[i + 1]) {
      out.token = args[i + 1];
      i += 1;
    } else if (args[i] === "--out" && args[i + 1]) {
      out.outFile = args[i + 1];
      i += 1;
    } else if (args[i] === "--sku" && args[i + 1]) {
      out.sku = Number(args[i + 1]);
      i += 1;
    } else if (args[i] === "--skip" && args[i + 1]) {
      out.skip = Number(args[i + 1]);
      i += 1;
    } else if (args[i] === "--take" && args[i + 1]) {
      out.take = Number(args[i + 1]);
      i += 1;
    } else if (args[i] === "--consumer" && args[i + 1]) {
      out.consumer = args[i + 1];
      i += 1;
    } else if (args[i] === "--introspection") {
      out.tryIntrospection = true;
    }
  }

  return out;
}

async function postGraphQL(url, token, query, variables = {}) {
  const headers = {
    accept: "application/json",
    "accept-language": "pt-BR,pt;q=0.9",
    "content-type": "application/json",
    origin: DEFAULT_ORIGIN,
    referer: DEFAULT_REFERER,
    "x-consumer-username": variables.__consumer || DEFAULT_CONSUMER
  };

  delete variables.__consumer;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables })
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Resposta nao-JSON (${response.status}): ${text.slice(0, 250)}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(payload).slice(0, 300)}`);
  }

  if (payload.errors && payload.errors.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(payload.errors).slice(0, 600)}`);
  }

  return payload.data;
}

function validateMercadoriasData(data) {
  const failures = [];
  const result = data && data.mercadorias;

  if (!result) {
    failures.push("data.mercadorias ausente");
    return { ok: false, failures, itemCount: 0 };
  }

  if (!result.pageInfo) {
    failures.push("mercadorias.pageInfo ausente");
  }

  if (!Array.isArray(result.items)) {
    failures.push("mercadorias.items nao e lista");
    return { ok: false, failures, itemCount: 0 };
  }

  if (result.items.length > 0) {
    const item = result.items[0];
    const expected = [
      "id",
      "nome",
      "dePara",
      "tipoMercadoria",
      "situacaoCompra",
      "estruturaGerencial",
      "situacaoCadastral",
      "preVenda"
    ];

    expected.forEach((f) => {
      if (!(f in item)) {
        failures.push(`campo ausente no item: ${f}`);
      }
    });
  }

  return { ok: failures.length === 0, failures, itemCount: result.items.length };
}

async function main() {
  const opts = parseArgs();

  console.log("=== GraphQL Validator (ADR-002) ===\n");
  console.log(`[INFO] Endpoint: ${opts.url}`);
  console.log(`[INFO] sku=${opts.sku} skip=${opts.skip} take=${opts.take}`);

  try {
    let queryData;
    try {
      queryData = await postGraphQL(opts.url, opts.token, MERCADORIAS_QUERY, {
        skip: opts.skip,
        take: opts.take,
        sku: opts.sku,
        search: opts.search,
        operation: opts.operation,
        __consumer: opts.consumer
      });
      console.log("[INFO] Query executada no modo legado (com search/operation).");
    } catch (firstErr) {
      const msg = String(firstErr.message || "");
      if (!msg.includes("variables were not used")) {
        throw firstErr;
      }

      console.log("[WARN] Endpoint rejeitou variaveis nao usadas (search/operation). Aplicando fallback compativel.");
      queryData = await postGraphQL(opts.url, opts.token, MERCADORIAS_QUERY_COMPAT, {
        skip: opts.skip,
        take: opts.take,
        sku: opts.sku,
        __consumer: opts.consumer
      });
      console.log("[INFO] Query executada no modo compativel (sem search/operation).");
    }

    const validation = validateMercadoriasData(queryData);
    if (!validation.ok) {
      console.log("\n[FAIL] Retorno da query fora do esperado:");
      validation.failures.forEach((f) => console.log(`- ${f}`));
      process.exitCode = 1;
    } else {
      console.log(`\n[OK] Query executada com sucesso. items retornados: ${validation.itemCount}`);
      if (validation.itemCount > 0) {
        const item = queryData.mercadorias.items[0];
        console.log("[INFO] Preview do primeiro item:");
        console.log(JSON.stringify(item, null, 2));
      }
      process.exitCode = 0;
    }

    if (opts.outFile) {
      const target = path.resolve(process.cwd(), opts.outFile);
      fs.writeFileSync(target, JSON.stringify(queryData, null, 2), "utf8");
      console.log(`[INFO] Resposta da query salva em: ${target}`);
    }

    if (opts.tryIntrospection) {
      try {
        const iData = await postGraphQL(opts.url, opts.token, INTROSPECTION_QUERY, {
          __consumer: opts.consumer
        });
        const schema = iData.__schema;
        const qName = schema.queryType?.name || "(none)";
        const mName = schema.mutationType?.name || "(none)";
        console.log("\n[OK] Introspection habilitada no endpoint");
        console.log(`[INFO] queryType: ${qName}`);
        console.log(`[INFO] mutationType: ${mName}`);

        if (opts.outFile) {
          const schemaPath = path.resolve(process.cwd(), opts.outFile.replace(/\.json$/i, "") + ".schema.json");
          fs.writeFileSync(schemaPath, JSON.stringify(iData, null, 2), "utf8");
          console.log(`[INFO] Schema salvo em: ${schemaPath}`);
        }
      } catch (err) {
        console.log(`\n[WARN] Introspection nao disponivel: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`\n[FAIL] Nao foi possivel executar query GraphQL: ${err.message}`);
    process.exitCode = 1;
  }
}

main();
