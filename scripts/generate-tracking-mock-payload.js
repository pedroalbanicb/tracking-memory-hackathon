#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT = path.resolve(__dirname, "output", "tracking-mock-inputs.json");
const DEFAULT_OUTPUT = path.resolve(__dirname, "output", "tracking-large-mock.generated.json");

const SCENARIOS = [
  {
    key: "full-happy-path",
    stageValues: {
      cadastro: true,
      validacaoFiscal: true,
      propostaComercial: true,
      agendamento: true,
      estoque: true,
      produzidoSite: true,
      produzidoLf: true,
      ativacaoPricing: true,
      exibicaoSite: true
    }
  },
  {
    key: "fiscal-blocked",
    stageValues: {
      cadastro: true,
      validacaoFiscal: false,
      propostaComercial: null,
      agendamento: null,
      estoque: false,
      produzidoSite: false,
      produzidoLf: false,
      ativacaoPricing: false,
      exibicaoSite: false
    }
  },
  {
    key: "pricing-disabled",
    stageValues: {
      cadastro: true,
      validacaoFiscal: true,
      propostaComercial: true,
      agendamento: true,
      estoque: true,
      produzidoSite: true,
      produzidoLf: true,
      ativacaoPricing: false,
      exibicaoSite: false
    }
  },
  {
    key: "stockout",
    stageValues: {
      cadastro: true,
      validacaoFiscal: true,
      propostaComercial: true,
      agendamento: true,
      estoque: false,
      produzidoSite: true,
      produzidoLf: true,
      ativacaoPricing: true,
      exibicaoSite: false
    }
  },
  {
    key: "unknown-downstream",
    stageValues: {
      cadastro: true,
      validacaoFiscal: true,
      propostaComercial: true,
      agendamento: null,
      estoque: true,
      produzidoSite: null,
      produzidoLf: null,
      ativacaoPricing: true,
      exibicaoSite: null
    }
  }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: process.env.TRACKING_MOCK_INPUTS_FILE || DEFAULT_INPUT,
    outputFile: process.env.TRACKING_MOCK_OUTPUT || DEFAULT_OUTPUT,
    count: Number(process.env.TRACKING_MOCK_COUNT || 300)
  };

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    const next = args[index + 1];

    if (current === "--input" && next) {
      options.inputFile = path.resolve(next);
      index += 1;
    } else if (current === "--out" && next) {
      options.outputFile = path.resolve(next);
      index += 1;
    } else if (current === "--count" && next) {
      options.count = Number(next);
      index += 1;
    }
  }

  return options;
}

function loadSnapshot(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const payload = JSON.parse(raw);
  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error("Arquivo de snapshot sem items. Rode capture-tracking-mock-inputs.js antes.");
  }
  return payload;
}

function scenarioFor(index) {
  return SCENARIOS[index % SCENARIOS.length];
}

function buildRecord(sourceItem, index) {
  const scenario = scenarioFor(index);
  const baseSkuOn = Number(sourceItem.skuOn);
  const syntheticSkuOn = Number.isFinite(baseSkuOn) ? String(baseSkuOn + index * 1000) : `${sourceItem.skuOn}-${index}`;
  const syntheticSkuOff = sourceItem.skuOff ? String(Number(sourceItem.skuOff) + index * 1000) : null;

  return {
    id: `${index + 1}`,
    skuOn: syntheticSkuOn,
    skuOff: syntheticSkuOff,
    mercadoria: sourceItem.mercadoria || `SKU MOCK ${sourceItem.skuOn}`,
    tipoNegociacao: sourceItem.graphql?.tipoMercadoria ? String(sourceItem.graphql.tipoMercadoria).toUpperCase() : "NORMAL",
    mockControl: {
      scenario: scenario.key,
      sourceSkuOn: sourceItem.skuOn,
      generatedIndex: index,
      enabledByFlag: "TRACKING_PRESENTATION_MOCK_ENABLED"
    },
    ...scenario.stageValues,
    disponibilidade: sourceItem.disponibilidade,
    origemReal: {
      graphql: sourceItem.graphql ? { ok: sourceItem.graphql.ok !== false } : null,
      oferta: sourceItem.oferta ? { ok: sourceItem.oferta.ok !== false } : null,
      mongo: sourceItem.mongo ? { ok: sourceItem.mongo.ok !== false, descricao: sourceItem.mongo.descricao } : null
    }
  };
}

function ensureOutputDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function main() {
  const options = parseArgs();
  const snapshot = loadSnapshot(options.inputFile);
  const items = [];

  for (let index = 0; index < options.count; index += 1) {
    const sourceItem = snapshot.items[index % snapshot.items.length];
    items.push(buildRecord(sourceItem, index));
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    purpose: "Dataset auxiliar para mock temporario de apresentacao no tracking",
    featureFlags: {
      enabledFlag: "TRACKING_PRESENTATION_MOCK_ENABLED",
      defaults: {
        TRACKING_PRESENTATION_MOCK_ENABLED: false
      }
    },
    safeguards: {
      defaultBehavior: "real-service",
      note: "Sem a flag ativa, o consumidor futuro deve continuar chamando os servicos reais sem alteracao de comportamento."
    },
    servicesToMock: [
      "POST /api/v1/tracking/skus/listar",
      "GET /api/v1/tracking/oferta/{idSku}"
    ],
    total: items.length,
    items
  };

  ensureOutputDirectory(options.outputFile);
  fs.writeFileSync(options.outputFile, JSON.stringify(payload, null, 2));
  console.log(`Mock dataset gerado em ${options.outputFile} com ${items.length} registros.`);
}

main();