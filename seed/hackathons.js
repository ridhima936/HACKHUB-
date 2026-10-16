const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");
require("dotenv").config();
const hackathons = [
    {
        name: "AI Innovation Hackathon",
        description:
            "Build an innovative AI-powered solution for a real-world problem.",
        techStack: [
            "React",
            "Node.js",
            "MongoDB",
            "AI"
        ],
        skills: [
            "JavaScript",
            "Backend",
            "Artificial Intelligence",
            "Machine Learning"
        ],
        deadline: new Date("2026-12-31"),
        platform: "Unstop",
        officialUrl: "https://unstop.com/hackathons",
        githubUrl: null,
        vercelUrl: null
    },

    {
        name: "Web Development Hackathon",
        description:
            "Create a modern web application using current web technologies.",
        techStack: [
            "React",
            "Node.js",
            "JavaScript",
            "MongoDB"
        ],
        skills: [
            "Frontend",
            "Backend",
            "Web Development"
        ],
        deadline: new Date("2026-12-31"),
        platform: "Unstop",
        officialUrl: "https://unstop.com/hackathons",
        githubUrl: null,
        vercelUrl: null
    },

    {
        name: "Open Innovation Hackathon",
        description:
            "Develop a technology-based solution for an open-ended problem.",
        techStack: [
            "React",
            "Node.js",
            "Python",
            "AI"
        ],
        skills: [
            "Problem Solving",
            "AI",
            "Software Development"
        ],
        deadline: new Date("2026-12-31"),
        platform: "Unstop",
        officialUrl: "https://unstop.com/hackathons",
        githubUrl: null,
        vercelUrl: null
    }
];

const seedHackathons = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Hackathon.deleteMany();

        await Hackathon.insertMany(hackathons);

        console.log("Hackathons seeded successfully");

        await mongoose.connection.close();
    } catch (error) {
        console.log("Seeding error:", error.message);
        process.exit(1);
    }
};

seedHackathons();