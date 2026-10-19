const MODEL = "Xenova/all-MiniLM-L6-v2";

let extractorPromise = null;

// @xenova/transformers is ESM-friendly; load lazily so the server boots fast.
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

/** Returns a normalized 384-dim embedding (array of numbers). */
const generateEmbedding = async (text) => {
    const model = await getExtractor();
    const output = await model(String(text).replace(/\s+/g, " ").trim(), {
        pooling: "mean",
        normalize: true
    });
    return Array.from(output.data);
};

/** Warm the model in the background so the first recommendation is fast. */
const preloadModel = () =>
    getExtractor()
        .then(() => console.log("Embedding model ready:", MODEL))
        .catch((err) => console.warn("Embedding model preload failed:", err.message));

module.exports = { generateEmbedding, preloadModel, MODEL };
