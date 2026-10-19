const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");
require("dotenv").config();

// Deadlines are sample values - replace with real events from the official links.
const hackathons = [
    {
        "name": "AI Innovation Hackathon",
        "description": "Build an innovative AI-powered solution for a real-world problem using machine learning and modern web tools.",
        "techStack": [
            "React",
            "Node.js",
            "MongoDB",
            "AI",
            "Python"
        ],
        "skills": [
            "JavaScript",
            "Machine Learning",
            "Artificial Intelligence",
            "Backend"
        ],
        "platform": "Unstop",
        "officialUrl": "https://unstop.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2026-12-31"
    },
    {
        "name": "Web Development Hackathon",
        "description": "Create a modern, responsive web application using current frontend and backend technologies.",
        "techStack": [
            "React",
            "Node.js",
            "JavaScript",
            "MongoDB",
            "Express"
        ],
        "skills": [
            "Frontend",
            "Backend",
            "Web Development",
            "REST APIs"
        ],
        "platform": "Unstop",
        "officialUrl": "https://unstop.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2026-12-20"
    },
    {
        "name": "Open Innovation Hackathon",
        "description": "Develop a technology-based solution for an open-ended problem of your choice.",
        "techStack": [
            "React",
            "Node.js",
            "Python",
            "AI"
        ],
        "skills": [
            "Problem Solving",
            "Software Development",
            "Product Thinking"
        ],
        "platform": "Devpost",
        "officialUrl": "https://devpost.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-01-15"
    },
    {
        "name": "Smart Campus Challenge",
        "description": "Solve everyday campus problems with connected, data-driven software: timetables, attendance, safety and sustainability.",
        "techStack": [
            "React",
            "Node.js",
            "MongoDB",
            "IoT"
        ],
        "skills": [
            "Full Stack",
            "Data Analysis",
            "UI Design"
        ],
        "platform": "Unstop",
        "officialUrl": "https://unstop.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-01-30"
    },
    {
        "name": "FinTech Builders Sprint",
        "description": "Design secure payment, budgeting or ledger tools for the next generation of digital finance.",
        "techStack": [
            "Node.js",
            "Express",
            "MongoDB",
            "TypeScript",
            "Docker"
        ],
        "skills": [
            "Backend",
            "Security",
            "API Design",
            "Databases"
        ],
        "platform": "Devpost",
        "officialUrl": "https://devpost.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-02-10"
    },
    {
        "name": "Machine Learning & Data Science Cup",
        "description": "Train, evaluate and ship a model on a real dataset. Notebooks, dashboards and clear storytelling are rewarded.",
        "techStack": [
            "Python",
            "TensorFlow",
            "Pandas",
            "Scikit-learn",
            "AI"
        ],
        "skills": [
            "Machine Learning",
            "Data Science",
            "Statistics"
        ],
        "platform": "Kaggle",
        "officialUrl": "https://www.kaggle.com/competitions",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-02-28"
    },
    {
        "name": "Cloud & DevOps Challenge",
        "description": "Containerise, deploy and monitor a production-style application with CI/CD and infrastructure as code.",
        "techStack": [
            "Docker",
            "Kubernetes",
            "AWS",
            "Linux",
            "GitHub Actions"
        ],
        "skills": [
            "DevOps",
            "Cloud Computing",
            "Automation",
            "Linux"
        ],
        "platform": "Devpost",
        "officialUrl": "https://devpost.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-03-12"
    },
    {
        "name": "Mobile App Innovation Hackathon",
        "description": "Ship a polished cross-platform mobile app that solves a clear user problem.",
        "techStack": [
            "React Native",
            "Flutter",
            "Firebase",
            "JavaScript"
        ],
        "skills": [
            "Mobile Development",
            "UI/UX",
            "Frontend"
        ],
        "platform": "Unstop",
        "officialUrl": "https://unstop.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-03-25"
    },
    {
        "name": "Cybersecurity Capture The Flag",
        "description": "Hunt vulnerabilities, solve cryptography puzzles and defend systems in a timed team CTF.",
        "techStack": [
            "Linux",
            "Python",
            "C++",
            "Networking"
        ],
        "skills": [
            "Security",
            "Cryptography",
            "Operating Systems"
        ],
        "platform": "CTFtime",
        "officialUrl": "https://ctftime.org/event/list/upcoming",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-04-05"
    },
    {
        "name": "Generative AI & RAG Hackathon",
        "description": "Build retrieval-augmented applications with embeddings, vector search and LLM APIs.",
        "techStack": [
            "Python",
            "Node.js",
            "MongoDB Atlas",
            "Vector Search",
            "AI",
            "React"
        ],
        "skills": [
            "RAG",
            "Embeddings",
            "LLMs",
            "Backend"
        ],
        "platform": "Devpost",
        "officialUrl": "https://devpost.com/hackathons",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-04-20"
    },
    {
        "name": "Open Source Contribution Quest",
        "description": "Contribute meaningful pull requests to open-source projects and document your journey.",
        "techStack": [
            "Git",
            "GitHub",
            "JavaScript",
            "Python"
        ],
        "skills": [
            "Open Source",
            "Collaboration",
            "Documentation"
        ],
        "platform": "GitHub",
        "officialUrl": "https://github.com/explore",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-05-10"
    },
    {
        "name": "Game Development Jam",
        "description": "Create a small but delightful game in 72 hours around a surprise theme.",
        "techStack": [
            "C++",
            "JavaScript",
            "Unity",
            "Canvas"
        ],
        "skills": [
            "Game Development",
            "Algorithms",
            "Creativity"
        ],
        "platform": "itch.io",
        "officialUrl": "https://itch.io/jams",
        "githubUrl": null,
        "vercelUrl": null,
        "deadline": "2027-05-30"
    }
];

const seedHackathons = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Hackathon.deleteMany();
        await Hackathon.insertMany(hackathons.map((h) => ({ ...h, deadline: new Date(h.deadline) })));
        console.log(`Seeded ${hackathons.length} hackathons`);
        await mongoose.connection.close();
    } catch (error) {
        console.log("Seeding error:", error.message);
        process.exit(1);
    }
};

seedHackathons();
