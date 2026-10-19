// Creates the Atlas Vector Search index programmatically (Atlas clusters only).
// Run: npm run create-index
//
// This script is idempotent:
//   - no index yet            -> creates it
//   - index exists and READY  -> does nothing
//   - index exists but FAILED -> drops it and recreates it with a valid definition
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");
const { INDEX_NAME, EMBEDDING_DIMENSIONS } = require("../controllers/hackathonController");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const statusOf = (index) => String(index?.status || "").toUpperCase();

const DEFINITION = {
    fields: [
        {
            type: "vector",
            path: "embedding",
            numDimensions: EMBEDDING_DIMENSIONS,
            similarity: "cosine"
        }
    ]
};

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

        if (existing && statusOf(existing) === "READY") {
            console.log(`Index "${INDEX_NAME}" already exists and is READY. Nothing to do.`);
            return;
        }

        if (existing) {
            const reason = existing.statusDetail?.[0]?.mainIndex?.message;
            console.log(`Index "${INDEX_NAME}" exists but status is "${existing.status}". Recreating it.`);
            if (reason) console.log(`  reason reported by Atlas: ${reason}`);

            await col.dropSearchIndex(INDEX_NAME);
            console.log("  dropped the unusable index; waiting for it to disappear ...");
            for (let i = 0; i < 20; i++) {
                const list = await col.listSearchIndexes().toArray();
                if (!list.some((x) => x.name === INDEX_NAME)) break;
                await sleep(3000);
            }
        }

        await col.createSearchIndex({
            name: INDEX_NAME,
            type: "vectorSearch",
            definition: DEFINITION
        });
        console.log("Index creation started. It usually becomes READY in ~1 minute.");
        console.log("Until then the API automatically falls back to local cosine similarity.");

        for (let i = 0; i < 30; i++) {
            await sleep(4000);
            const list = await col.listSearchIndexes().toArray();
            const found = list.find((x) => x.name === INDEX_NAME);
            const status = statusOf(found);

            if (status === "READY") {
                console.log(`Index "${INDEX_NAME}" is READY. Atlas Vector Search is active.`);
                return;
            }
            if (status === "FAILED") {
                const reason = found.statusDetail?.[0]?.mainIndex?.message;
                console.error(`Index "${INDEX_NAME}" FAILED again${reason ? `: ${reason}` : "."}`);
                process.exitCode = 1;
                return;
            }
        }
        console.log("Still building. Check Atlas > Database > Search & Vector Search in a minute.");
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
