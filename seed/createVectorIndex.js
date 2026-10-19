// Creates the Atlas Vector Search index programmatically (Atlas clusters only).
// Run: npm run create-index
require("dotenv").config();
const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = Hackathon.collection;
        const existing = await col.listSearchIndexes("hackathon_vector_index").toArray();
        if (existing.length) {
            console.log("Index 'hackathon_vector_index' already exists. Nothing to do.");
        } else {
            await col.createSearchIndex({
                name: "hackathon_vector_index",
                type: "vectorSearch",
                definition: {
                    fields: [{ type: "vector", path: "embedding", numDimensions: 384, similarity: "cosine" }]
                }
            });
            console.log("Index creation started. It becomes READY in ~1 minute (check Atlas > Search & Vector Search).");
        }
    } catch (err) {
        console.error("Could not create the index automatically:", err.message);
        console.error("Create it manually in Atlas: collection 'hackathons', index name 'hackathon_vector_index', path 'embedding', 384 dimensions, cosine.");
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
})();
