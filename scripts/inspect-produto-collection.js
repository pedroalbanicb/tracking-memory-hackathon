#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    uri: process.env.MONGO_URI || "",
    db: process.env.MONGO_DB || "db_prd_casasbahia",
    collection: process.env.MONGO_COLLECTION || "produto",
    limit: Number(process.env.MONGO_SAMPLE_LIMIT || 3),
    outFile: process.env.MONGO_INSPECT_OUT || ""
  };

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    const next = args[index + 1];

    if (current === "--uri" && next) {
      options.uri = next;
      index += 1;
    } else if (current === "--db" && next) {
      options.db = next;
      index += 1;
    } else if (current === "--collection" && next) {
      options.collection = next;
      index += 1;
    } else if (current === "--limit" && next) {
      options.limit = Number(next);
      index += 1;
    } else if (current === "--out" && next) {
      options.outFile = next;
      index += 1;
    }
  }

  return options;
}

function ensureOutputDirectory(filePath) {
  if (!filePath) {
    return;
  }

  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function visitPaths(node, currentPath, accumulator, depth) {
  if (node === null || node === undefined || depth > 6) {
    return;
  }

  if (Array.isArray(node)) {
    accumulator.add(`${currentPath}[]`);
    node.slice(0, 3).forEach((item) => visitPaths(item, `${currentPath}[]`, accumulator, depth + 1));
    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  Object.entries(node).forEach(([key, value]) => {
    const nextPath = currentPath ? `${currentPath}.${key}` : key;
    accumulator.add(nextPath);
    visitPaths(value, nextPath, accumulator, depth + 1);
  });
}

function scorePaths(paths, keywords) {
  return Array.from(paths)
    .filter((entry) => keywords.some((keyword) => entry.toLowerCase().includes(keyword)))
    .sort();
}

async function main() {
  const options = parseArgs();

  if (!options.uri) {
    throw new Error("Informe --uri ou defina MONGO_URI para inspecionar a collection produto.");
  }

  const client = new MongoClient(options.uri, { appName: "tracking-mock-inspector" });

  try {
    await client.connect();
    const collection = client.db(options.db).collection(options.collection);
    const documents = await collection.find({}, { limit: options.limit }).toArray();
    const paths = new Set();

    documents.forEach((document) => visitPaths(document, "", paths, 0));

    const report = {
      generatedAt: new Date().toISOString(),
      database: options.db,
      collection: options.collection,
      sampleSize: documents.length,
      candidateSkuPaths: scorePaths(paths, ["sku", "idsku", "idskuon", "idskuloja"]),
      candidateDescriptionPaths: scorePaths(paths, ["descr", "nome", "title"]),
      sampleDocuments: documents.slice(0, 2)
    };

    if (options.outFile) {
      ensureOutputDirectory(options.outFile);
      fs.writeFileSync(path.resolve(options.outFile), JSON.stringify(report, null, 2));
    }

    console.log(JSON.stringify(report, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});