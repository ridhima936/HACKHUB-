// Creates the Atlas Vector Search index programmatically (Atlas clusters only).
// Run: npm run create-index
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");
const { INDEX_NAME, EMBEDDING_DIMENSIONS } = require("../controllers/hackathonController");

(async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set. Add it to your .env file (see .env.example).");
        process.exitCode = 1;
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = Hackathon.collection;

        // NOTE: passing a name to listSearchIndexes() throws `IndexNotFound`
        // when the index does not exist yet, so list them all and filter here.
        const indexes = await col.listSearchIndexes().toArray();
        const existing = indexes.find((i) => i.name === INDEX_NAME);

        if (existing) {
            console.log(`Index "${INDEX_NAME}" already exists (status: ${existing.status || "unknown"}). Nothing to do.`);
        } else {
            await col.createSearchIndex({
                name: INDEX_NAME,
                type: "vectorSearch",
                definition: {
                    fields: [
                        {
                            type: "vector",
                            path: "embedding",
                            numDimensions: EMBEDDING_DIMENSIONS,
                            similarity: "cosine"
                        }
                    ]
                }
            });
            console.log("Index creation started. It becomes READY in ~1 minute (check Atlas > Search & Vector Search).");
            console.log("Until then the API automatically falls back to local cosine similarity.");
        }
    } catch (err) {
        console.error("Could not create the index automatically:", err.message);
        console.error(
            `Create it manually in Atlas: collection "hackathons", index name "${INDEX_NAME}", ` +
            `path "embedding", ${EMBEDDING_DIMENSIONS} dimensions, similarity "cosine".`
        );
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
})();
