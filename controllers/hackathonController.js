const Hackathon = require("../models/Hackathon");
const { generateEmbedding } = require("../services/embeddingService");
const { parseList } = require("../utils/helpers");

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

const cosine = (a, b) => {
    let dot = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) dot += a[i] * b[i];
    return dot; // vectors are L2-normalized, so dot product == cosine similarity
};

// Atlas reports cosine as (1 + cos) / 2 -> use the same scale in the fallback.
const toAtlasScale = (cos) => (1 + cos) / 2;

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

/** Fallback (same embeddings, same cosine metric) when Atlas Vector Search is unavailable. */
const localSearch = async (queryVector) => {
    const docs = await Hackathon.find({ "embedding.0": { $exists: true } }).lean();
    return docs
        .map((doc) => {
            const { embedding, ...rest } = doc;
            return { ...rest, score: toAtlasScale(cosine(queryVector, embedding)) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, LIMIT);
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

        // Atlas returns nothing if the index is missing/still building or no docs are embedded yet.
        if (recommendations.length === 0 && method === "atlas-vector-search") {
            recommendations = await localSearch(queryVector);
            if (recommendations.length > 0) method = "local-cosine";
        } else if (method === "local-cosine") {
            recommendations = await localSearch(queryVector);
        }

        res.json({
            message: "Hackathons recommended successfully",
            method,
            recommendations
        });
    } catch (error) {
        console.error("RAG recommendation error:", error.message);
        res.status(500).json({ message: "Failed to generate recommendations" });
    }
};

module.exports = { recommendHackathons, PROJECTION };
