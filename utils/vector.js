// Vector helpers used by the RAG recommendation pipeline.
//
// The embeddings produced by `services/embeddingService` are L2-normalized
// (normalize: true), so the dot product of two vectors is already equal to
// their cosine similarity - no extra division is required.

/** Dot product of two equal-length (normalized) vectors. */
const dotProduct = (a = [], b = []) => {
    const n = Math.min(a.length, b.length);
    let sum = 0;
    for (let i = 0; i < n; i++) sum += a[i] * b[i];
    return sum;
};

/** Cosine similarity for L2-normalized vectors. */
const cosineSimilarity = (a = [], b = []) => dotProduct(a, b);

/**
 * MongoDB Atlas Vector Search reports cosine similarity rescaled to 0..1:
 *   score = (1 + cos) / 2
 * We use the same scale for the local fallback so match percentages look
 * identical whether the query ran on Atlas or in-process.
 */
const toAtlasScale = (cos) => (1 + cos) / 2;

/** Rank documents by cosine similarity against a query vector. */
const rankByCosine = (queryVector, docs = [], limit = 5) =>
    docs
        .filter((doc) => Array.isArray(doc.embedding) && doc.embedding.length > 0)
        .map((doc) => {
            const { embedding, ...rest } = doc;
            return {
                ...rest,
                score: toAtlasScale(cosineSimilarity(queryVector, embedding))
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

module.exports = { dotProduct, cosineSimilarity, toAtlasScale, rankByCosine };
