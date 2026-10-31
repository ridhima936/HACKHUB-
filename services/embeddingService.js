const MODEL = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIMENSIONS = 384;

let extractorPromise = null;

// @xenova/transformers is ESM-friendly; load lazily so the server boots fast
// and so environments that never touch the RAG endpoint (e.g. CI) stay light.
const getExtractor = async () => {
    if (!extractorPromise) {
        extractorPromise = (async () => {
            const { pipeline } = await import("@xenova/transformers");
            return pipeline("feature-extraction", MODEL);
        })().catch((err) => {
            extractorPromise = null; // allow retry on next call
            throw err;
        });
    }
    return extractorPromise;
};

/**
 * Returns a normalized embedding (array of `EMBEDDING_DIMENSIONS` numbers).
 * The first call downloads the model (~90 MB) into the transformers cache.
 */
const generateEmbedding = async (text) => {
    const model = await getExtractor();
    const clean = String(text ?? "").replace(/\s+/g, " ").trim();
    const output = await model(clean, { pooling: "mean", normalize: true });
    return Array.from(output.data);
};

/** Warm the model in the background so the first recommendation is fast. */
const preloadModel = () =>
    getExtractor()
        .then(() => console.log("Embedding model ready:", MODEL))
        .catch((err) => console.warn("Embedding model preload failed:", err.message));

module.exports = { generateEmbedding, preloadModel, MODEL, EMBEDDING_DIMENSIONS };
