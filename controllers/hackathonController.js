const Hackathon = require("../models/Hackathon");
const { generateEmbedding, MODEL, EMBEDDING_DIMENSIONS } = require("../services/embeddingService");
const { parseList, openNow } = require("../utils/helpers");
const { rankByCosine } = require("../utils/vector");

const INDEX_NAME = "hackathon_vector_index";
const LIMIT = 5;

const PROJECTION = {
    name: 1,
    description: 1,
    techStack: 1,
    skills: 1,
    deadline: 1,
    organizer: 1,
    platform: 1,
    mode: 1,
    location: 1,
    officialUrl: 1
};

/** Primary path: MongoDB Atlas Vector Search. */
const atlasSearch = (queryVector) =>
    Hackathon.aggregate([
        {
            $vectorSearch: {
                index: INDEX_NAME,
                path: "embedding",
                queryVector,
                numCandidates: 100,
                limit: 50
            }
        },
        // Expired hackathons are dropped after the vector search, so the Atlas
        // index definition does not need a filter field.
        { $match: openNow() },
        { $limit: LIMIT },
        { $project: { ...PROJECTION, score: { $meta: "vectorSearchScore" } } }
    ]);

/**
 * Fallback path: cosine similarity computed in Node over the same stored
 * embeddings. Used when the Atlas Vector Search index is missing or still
 * building (Atlas needs ~1 minute after `npm run create-index`).
 */
const localSearch = async (queryVector, limit = LIMIT) => {
    const docs = await Hackathon.find({ "embedding.0": { $exists: true }, ...openNow() }).lean();
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

        const embedded = { "embedding.0": { $exists: true } };
        const embeddedCount = await Hackathon.countDocuments({ ...embedded, ...openNow() });
        if (embeddedCount === 0) {
            // Distinguish "never seeded" from "everything has expired".
            const anyEmbedded = await Hackathon.countDocuments(embedded);
            if (anyEmbedded === 0) {
                return res.status(503).json({
                    message: "No hackathon embeddings found yet. Run `npm run seed` on the server to build the semantic index.",
                    method: "unavailable",
                    recommendations: []
                });
            }
            return res.json({
                message: "No open hackathons right now",
                method: "none",
                model: MODEL,
                total: 0,
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
