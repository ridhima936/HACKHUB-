const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");
const { generateEmbedding } = require("../services/embeddingService");

require("dotenv").config();

const generateHackathonEmbeddings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const hackathons = await Hackathon.find();

        console.log(`Found ${hackathons.length} hackathons`);

        for (const hackathon of hackathons) {
            const text = `
                ${hackathon.name}
                ${hackathon.description}
                ${hackathon.techStack.join(" ")}
                ${hackathon.skills.join(" ")}
            `;

            console.log(`Generating embedding for: ${hackathon.name}`);

            const embedding = await generateEmbedding(text);

            hackathon.embedding = embedding;

            await hackathon.save();

            console.log(
                `Embedding saved: ${embedding.length} dimensions`
            );
        }

        console.log("All hackathon embeddings generated successfully");

        await mongoose.connection.close();

    } catch (error) {
        console.log(
            "Embedding generation error:",
            error.message
        );

        process.exit(1);
    }
};

generateHackathonEmbeddings();