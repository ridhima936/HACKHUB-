// Generates the 384-dim embeddings used by the RAG recommender.
// Run: npm run seed:embeddings        (skip up-to-date rows)
//      FORCE=1 npm run seed:embeddings (regenerate every row)
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");
const { generateEmbedding, MODEL, EMBEDDING_DIMENSIONS } = require("../services/embeddingService");

const FORCE = process.env.FORCE === "1" || process.argv.includes("--force");

const buildText = (h) =>
    [
        h.name,
        h.description,
        (h.techStack || []).join(" "),
        (h.skills || []).join(" ")
    ]
        .filter(Boolean)
        .join(" ");

const hasEmbedding = (h) =>
    Array.isArray(h.embedding) && h.embedding.length === EMBEDDING_DIMENSIONS;

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set. Add it to your .env file (see .env.example).");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
        console.log(`Model: ${MODEL} (${EMBEDDING_DIMENSIONS} dimensions)`);

        const hackathons = await Hackathon.find();
        if (hackathons.length === 0) {
            console.warn("No hackathons found. Run `npm run seed:data` first.");
            return;
        }

        let generated = 0;
        let skipped = 0;

        for (const hackathon of hackathons) {
            if (!FORCE && hasEmbedding(hackathon)) {
                skipped++;
                continue;
            }

            const embedding = await generateEmbedding(buildText(hackathon));

            if (embedding.length !== EMBEDDING_DIMENSIONS) {
                throw new Error(
                    `Unexpected embedding size for "${hackathon.name}": ${embedding.length} (expected ${EMBEDDING_DIMENSIONS}).`
                );
            }

            hackathon.embedding = embedding;
            await hackathon.save();
            generated++;

            console.log(`  ✓ ${hackathon.name} -> ${embedding.length} dimensions`);
        }

        console.log(`\nEmbeddings ready: ${generated} generated, ${skipped} already up to date.`);
        console.log("Next: npm run create-index (once) to enable Atlas Vector Search.");
    } catch (error) {
        console.error("Embedding generation error:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close().catch(() => {});
    }
};

run();
