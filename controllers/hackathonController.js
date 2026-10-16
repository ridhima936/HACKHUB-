const Hackathon = require("../models/Hackathon");
const { generateEmbedding } = require("../services/embeddingService");

const recommendHackathons = async (req, res) => {
    try {
        const { techStack } = req.body;

        if (
            !techStack ||
            !Array.isArray(techStack) ||
            techStack.length === 0
        ) {
            return res.status(400).json({
                message: "Please provide your tech stack"
            });
        }

        // User's tech stack ko ek meaningful text mein convert karna
        const queryText = `
            User skills and technologies:
            ${techStack.join(", ")}
        `;

        // User query ka embedding generate karna
        const queryEmbedding = await generateEmbedding(queryText);

        // MongoDB Vector Search
        const recommendations = await Hackathon.aggregate([
            {
                $vectorSearch: {
                    index: "hackathon_vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 50,
                    limit: 5
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    techStack: 1,
                    skills: 1,
                    deadline: 1,
                    platform: 1,
                    officialUrl: 1,
                    githubUrl: 1,
                    vercelUrl: 1,
                    score: {
                        $meta: "vectorSearchScore"
                    }
                }
            }
        ]);

        res.json({
            message: "Hackathons recommended successfully",
            recommendations
        });

    } catch (error) {
        console.log("RAG recommendation error:", error);

        res.status(500).json({
            message: "Failed to generate recommendations"
        });
    }
};

module.exports = {
    recommendHackathons
};