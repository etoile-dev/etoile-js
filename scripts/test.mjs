/**
 * Integration test for the @etoile-dev/client SDK.
 *
 *   npm test
 *   node --test scripts/test.mjs
 *
 * Requires ETOILE_SECRET_KEY to be set (or present in .env.local).
 */

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Etoile } from "../dist/index.js";

// ── Config ──────────────────────────────────────────────────────────

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.+)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch { }
}
loadEnv();

const KEY = process.env.ETOILE_SECRET_KEY;
const COLLECTION = "__test_sdk";
const DOC_ID = "test-sdk-001";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Unit tests (no API key required) ─────────────────────────────────

describe("new Etoile()", () => {
  it("throws on missing config", () => {
    assert.throws(() => new Etoile(), { code: "INVALID_INPUT" });
  });

  it("throws on empty apiKey", () => {
    assert.throws(() => new Etoile({ apiKey: "" }), { code: "INVALID_INPUT" });
  });
});

describe("etoile.index() — input validation", () => {
  const etoile = new Etoile({ apiKey: "dummy" });

  it("throws on empty id", async () => {
    await assert.rejects(
      () => etoile.index({ id: "", collection: "x", title: "x", content: "x" }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on empty collection", async () => {
    await assert.rejects(
      () => etoile.index({ id: "x", collection: "", title: "x", content: "x" }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on empty content", async () => {
    await assert.rejects(
      () => etoile.index({ id: "x", collection: "x", title: "x", content: "" }),
      { code: "INVALID_INPUT" },
    );
  });
});

describe("etoile.search() — input validation", () => {
  const etoile = new Etoile({ apiKey: "dummy" });

  it("throws on empty query", async () => {
    await assert.rejects(
      () => etoile.search({ query: "", collections: ["x"] }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on empty collections", async () => {
    await assert.rejects(
      () => etoile.search({ query: "x", collections: [] }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on invalid limit", async () => {
    await assert.rejects(
      () => etoile.search({ query: "x", collections: ["x"], limit: -1 }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on negative offset", async () => {
    await assert.rejects(
      () => etoile.search({ query: "x", collections: ["x"], offset: -1 }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws when filters and autoFilters are both set", async () => {
    await assert.rejects(
      () => etoile.search({
        query: "x",
        collections: ["x"],
        filters: [{ key: "k", operator: "eq", value: "v" }],
        autoFilters: true,
      }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on empty filters array", async () => {
    await assert.rejects(
      () => etoile.search({ query: "x", collections: ["x"], filters: [] }),
      { code: "INVALID_INPUT" },
    );
  });
});

describe("etoile.delete() — input validation", () => {
  const etoile = new Etoile({ apiKey: "dummy" });

  it("throws on empty id", async () => {
    await assert.rejects(
      () => etoile.delete(""),
      { code: "INVALID_INPUT" },
    );
  });
});

describe("etoile.patch() — input validation", () => {
  const etoile = new Etoile({ apiKey: "dummy" });

  it("throws on empty id", async () => {
    await assert.rejects(
      () => etoile.patch({ id: "", metadata: {} }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on missing metadata", async () => {
    await assert.rejects(
      () => etoile.patch({ id: "x", metadata: null }),
      { code: "INVALID_INPUT" },
    );
  });
});

describe("etoile.list() — input validation", () => {
  const etoile = new Etoile({ apiKey: "dummy" });

  it("throws on invalid limit", async () => {
    await assert.rejects(
      () => etoile.list({ limit: 0 }),
      { code: "INVALID_INPUT" },
    );
  });

  it("throws on negative offset", async () => {
    await assert.rejects(
      () => etoile.list({ offset: -1 }),
      { code: "INVALID_INPUT" },
    );
  });
});

describe("etoile.get() — input validation", () => {
  const etoile = new Etoile({ apiKey: "dummy" });

  it("throws on empty id", async () => {
    await assert.rejects(
      () => etoile.get(""),
      { code: "INVALID_INPUT" },
    );
  });
});

// ── Integration tests (requires ETOILE_SECRET_KEY) ───────────────────

describe("@etoile-dev/client — integration", () => {
  let etoile;

  before(() => {
    assert.ok(KEY, "ETOILE_SECRET_KEY must be set");
    etoile = new Etoile({ apiKey: KEY });
  });

  // 1 ── Index
  it("indexes a document", async () => {
    await etoile.index({
      id: DOC_ID,
      collection: COLLECTION,
      title: "Espresso Machine Pro",
      content: "A compact espresso machine with 15-bar pressure, built-in grinder, and milk frother.",
      metadata: { category: "appliances", price: 299, inStock: true },
    });

    await wait(2000);
  });

  // 2 ── List
  it("lists documents and includes the indexed document", async () => {
    const { documents } = await etoile.list({ limit: 50 });

    assert.ok(Array.isArray(documents), "documents should be an array");
    assert.ok(documents.length > 0, "expected at least one document");

    const doc = documents.find((d) => d.external_id === DOC_ID);
    assert.ok(doc, "indexed document should appear in list");
    assert.equal(doc.title, "Espresso Machine Pro");
    assert.equal(doc.collection, COLLECTION);
    assert.equal(typeof doc.created_at, "string");
    assert.equal(typeof doc.updated_at, "string");
  });

  // 3 ── Get
  it("gets the document by id", async () => {
    const { document } = await etoile.get(DOC_ID);

    assert.equal(document.external_id, DOC_ID);
    assert.equal(document.title, "Espresso Machine Pro");
    assert.equal(document.collection, COLLECTION);
    assert.equal(document.metadata.category, "appliances");
    assert.equal(typeof document.created_at, "string");
  });

  // 4 ── Plain search
  it("finds the indexed document", async () => {
    const { query, results } = await etoile.search({
      query: "espresso machine",
      collections: [COLLECTION],
      limit: 5,
    });

    assert.equal(query, "espresso machine");
    assert.ok(results.length > 0, "expected at least one result");

    const hit = results[0];
    assert.equal(hit.external_id, DOC_ID);
    assert.equal(hit.title, "Espresso Machine Pro");
    assert.equal(hit.collection, COLLECTION);
    assert.equal(typeof hit.score, "number");
    assert.equal(hit.metadata.category, "appliances");
  });

  // 5 ── Patch
  it("updates metadata", async () => {
    await etoile.patch({
      id: DOC_ID,
      metadata: { category: "kitchen", price: 249, inStock: true, sale: true },
    });

    await wait(1000);
  });

  // 6 ── Filters
  it("searches with metadata filters", async () => {
    const result = await etoile.search({
      query: "espresso",
      collections: [COLLECTION],
      filters: [
        { key: "category", operator: "eq", value: "kitchen" },
        { key: "price", operator: "lte", value: 300 },
        { key: "sale", operator: "eq", value: true },
      ],
    });

    assert.ok(Array.isArray(result.appliedFilters), "appliedFilters should be an array");
    assert.equal(result.appliedFilters.length, 3);
    assert.ok(result.results.length > 0, "expected results with matching filters");
    assert.equal(result.results[0].metadata.sale, true);
  });

  // 7 ── Non-matching filter
  it("returns empty results for a non-matching filter", async () => {
    const result = await etoile.search({
      query: "espresso",
      collections: [COLLECTION],
      filters: [{ key: "category", operator: "eq", value: "furniture" }],
    });

    assert.equal(result.results.length, 0);
  });

  // 8 ── Auto filters
  it("extracts filters from a natural-language query (autoFilters)", async () => {
    const result = await etoile.search({
      query: "kitchen espresso machines under $300",
      collections: [COLLECTION],
      autoFilters: true,
    });

    assert.ok(Array.isArray(result.results), "results should be an array");
    assert.ok(Array.isArray(result.appliedFilters), "appliedFilters should be an array");
    assert.ok(result.appliedFilters.length > 0, "expected at least one extracted filter");

    if (result.refinedQuery !== undefined) {
      assert.equal(typeof result.refinedQuery, "string");
    }

    const keys = result.appliedFilters.map((f) => f.key);
    assert.ok(
      keys.includes("category") || keys.includes("price"),
      `expected category or price filter, got: ${keys.join(", ")}`,
    );
  });

  // 9 ── Delete
  it("deletes the document", async () => {
    await etoile.delete(DOC_ID);
    await wait(1000);
  });

  // 10 ── Confirm deletion
  it("no longer returns the deleted document", async () => {
    const { results } = await etoile.search({
      query: "espresso machine",
      collections: [COLLECTION],
    });

    const found = results.some((r) => r.external_id === DOC_ID);
    assert.ok(!found, "deleted document should not appear in results");
  });
});
