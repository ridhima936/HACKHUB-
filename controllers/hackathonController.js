const Hackathon = require("../models/Hackathon");
const { generateEmbedding, MODEL, EMBEDDING_DIMENSIONS } = require("../services/embeddingService");
const { parseList } = require("../utils/helpers");
const { rankByCosine } = require("../utils/vector");

const INDEX_NAME = "hackathon_vector_index";
const LIMIT = 5;

const PROJECTION = {
    name: 1,
    description: 1,
    techStack: 1,
    skills: 1,
    deadline: 1,
    platform: 1,
    officialUrl: 1,
    githubUrl: 1,
    vercelUrl: 1
};

/** Primary path: MongoDB Atlas Vector Search. */
const atlasSearch = (queryVector) =>
    Hackathon.aggregate([
        {
            $vectorSearch: {
                index: INDEX_NAME,
                path: "embedding",
                queryVector,
                numCandidates: 50,
                limit: LIMIT
            }
        },
        { $project: { ...PROJECTION, score: { $meta: "vectorSearchScore" } } }
    ]);

/**
 * Fallback path: cosine similarity computed in Node over the same stored
 * embeddings. Used when the Atlas Vector Search index is missing or still
 * building (Atlas needs ~1 minute after `npm run create-index`).
 */
const localSearch = async (queryVector, limit = LIMIT) => {
    const docs = await Hackathon.find({ "embedding.0": { $exists: true } }).lean();
    return rankByCosine(queryVector, docs, limit);
};

const recommendHackathons = async (req, res) => {
    try {
        const techStack = parseList(req.body?.techStack);

        if (techStack.length === 0) {
            return res.status(400).json({ message: "Please provide your tech stack" });
        }
        if (techStack.length > 30) {
            return res.status(400).json({ message: "Please provide at most 30 skills" });
        }

        // Fail fast (with a helpful message) when the archives have not been
        // embedded yet, instead of returning a confusing empty result.
        const embeddedCount = await Hackathon.countDocuments({ "embedding.0": { $exists: true } });
        if (embeddedCount === 0) {
            return res.status(503).json({
                message: "No hackathon embeddings found yet. Run `npm run seed` on the server to build the semantic index.",
                method: "unavailable",
                recommendations: []
            });
        }

        const queryVector = await generateEmbedding(
            `User skills and technologies: ${techStack.join(", ")}`
        );

        let recommendations = [];
        let method = "atlas-vector-search";

        try {
            recommendations = await atlasSearch(queryVector);
        } catch (err) {
            console.warn(
                `Atlas $vectorSearch unavailable (${err.codeName || err.message}); using local cosine search.`
            );
            method = "local-cosine";
        }

        // Atlas returns an empty set when the index is missing/still building,
        // or when no document carries an embedding - fall back in that case.
        if (recommendations.length === 0) {
            recommendations = await localSearch(queryVector);
            if (recommendations.length > 0) method = "local-cosine";
        }

        res.json({
            message: "Hackathons recommended successfully",
            method,
            model: MODEL,
            total: embeddedCount,
            recommendations
        });
    } catch (error) {
        console.error("RAG recommendation error:", error.message);
        res.status(500).json({ message: "Failed to generate recommendations" });
    }
};

module.exports = { recommendHackathons, PROJECTION, INDEX_NAME, EMBEDDING_DIMENSIONS };
