// Pure unit tests for the RAG vector helpers - no database or network needed.
// Usage: npm run test:unit
const assert = require("assert");
const { cosineSimilarity, toAtlasScale, rankByCosine, dotProduct } = require("../utils/vector");

let passed = 0;
let failed = 0;

const it = (name, fn) => {
    try {
        fn();
        passed++;
        console.log(`  PASS  ${name}`);
    } catch (err) {
        failed++;
        console.log(`  FAIL  ${name}\n        ${err.message}`);
    }
};

const normalize = (v) => {
    const len = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / len);
};

console.log("VECTOR MATH");

it("dot product of identical unit vectors is 1", () => {
    const a = normalize([0.3, 0.9, 0.2]);
    assert.ok(Math.abs(dotProduct(a, a) - 1) < 1e-9);
});

it("cosine similarity of identical vectors is ~1", () => {
    const a = normalize([1, 2, 3, 4]);
    assert.ok(Math.abs(cosineSimilarity(a, a) - 1) < 1e-9);
});

it("cosine similarity of orthogonal vectors is ~0", () => {
    assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1])) < 1e-9);
});

it("cosine similarity of opposite vectors is ~-1", () => {
    assert.ok(Math.abs(cosineSimilarity([1, 0], [-1, 0]) + 1) < 1e-9);
});

it("mismatched lengths are safe (no throw)", () => {
    assert.strictEqual(typeof cosineSimilarity([1, 2, 3], [1]), "number");
    assert.strictEqual(cosineSimilarity([], []), 0);
});

it("Atlas scale maps cos to 0..1 like Atlas Vector Search", () => {
    assert.strictEqual(toAtlasScale(1), 1);
    assert.strictEqual(toAtlasScale(0), 0.5);
    assert.strictEqual(toAtlasScale(-1), 0);
});

console.log("RANKING");

it("ranks documents by similarity (best first)", () => {
    const query = normalize([1, 1, 1]);
    const docs = [
        { _id: "far", embedding: normalize([0, 0, 1]) },
        { _id: "near", embedding: normalize([1, 1, 0.9]) },
        { _id: "mid", embedding: normalize([1, 0.5, 0]) }
    ];
    const ranked = rankByCosine(query, docs, 5);
    assert.deepStrictEqual(ranked.map((d) => d._id), ["near", "mid", "far"]);
});

it("respects the limit", () => {
    const docs = Array.from({ length: 10 }, (_, i) => ({ _id: String(i), embedding: normalize([i + 1, 1]) }));
    assert.strictEqual(rankByCosine(normalize([1, 1]), docs, 3).length, 3);
});

it("ignores documents without embeddings", () => {
    const docs = [
        { _id: "empty", embedding: [] },
        { _id: "missing" },
        { _id: "ok", embedding: normalize([1, 1]) }
    ];
    const ranked = rankByCosine(normalize([1, 1]), docs, 5);
    assert.strictEqual(ranked.length, 1);
    assert.strictEqual(ranked[0]._id, "ok");
});

it("never leaks the embedding vector back to the caller", () => {
    const ranked = rankByCosine(normalize([1, 1]), [{ _id: "x", embedding: normalize([1, 1]) }], 1);
    assert.ok(!("embedding" in ranked[0]));
    assert.ok(ranked[0].score > 0.99);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
