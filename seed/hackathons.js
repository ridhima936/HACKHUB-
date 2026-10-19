// Seeds the hackathon archive with real, currently-open hackathons from Unstop.
//
// These entries were collected from unstop.com in October 2026. Each `officialUrl`
// points at the actual competition page, so "Register on Unstop" opens the real event.
// Re-run `npm run seed` after updating the list; then run `npm run seed:embeddings`
// to rebuild the embeddings used by the recommender.
//
// Every record has a `source` + `lastChecked` field so it is clear the data was
// curated by hand rather than scraped live.
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Hackathon = require("../models/Hackathon");

const LAST_CHECKED = new Date("2026-10-19");

const UNSTOP = "Unstop";

const hackathons = [
    {
        name: "CodeVerse India - National Level Hackathon",
        organizer: "WeCodeCoders",
        platform: UNSTOP,
        mode: "Online",
        location: "Online",
        description:
            "A three-round national hackathon with full-stack product engineering, agentic AI and open-innovation tracks. Open to students and professionals across India.",
        techStack: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "Full Stack"],
        skills: ["Full Stack", "Web Development", "Backend", "REST APIs", "Software Development"],
        deadline: new Date("2026-10-29"),
        officialUrl: "https://unstop.com/hackathons/codeverse-india-national-level-hackathon-wecodecoders-1763003",
        source: UNSTOP,
        lastChecked: LAST_CHECKED
    },
    {
        name: "Codex 48 - National-Level Hackathon",
        organizer: "WeCodeCoders",
        platform: UNSTOP,
        mode: "Online",
        location: "Online",
        description:
            "A 48-hour national-level hackathon running over three rounds. Tracks cover agentic AI, full-stack product engineering and open innovation, with PPO opportunities for top teams.",
        techStack: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "Full Stack"],
        skills: ["Full Stack", "Web Development", "Backend", "Software Development", "Open Innovation"],
        deadline: new Date("2026-10-24"),
        officialUrl: "https://unstop.com/hackathons/codex-48-national-level-hackathon-wecodecoders-1761082",
        source: UNSTOP,
        lastChecked: LAST_CHECKED
    },
    {
        name: "WCC Forge 48",
        organizer: "WeCodeCoders",
        platform: UNSTOP,
        mode: "Online",
        location: "Online",
        description:
            "A 12-day online hackathon where teams build and submit a working product under Agentic AI, Open Innovation or Education. Free entry with a Rs 25,000 prize pool and PPO opportunities.",
        techStack: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "Web Development"],
        skills: ["Web Development", "Full Stack", "Open Innovation", "Software Development", "UI/UX"],
        deadline: new Date("2026-10-29"),
        officialUrl: "https://unstop.com/hackathons/wcc-forge-48-wecodecoders-1756040",
        source: UNSTOP,
        lastChecked: LAST_CHECKED
    },
    {
        name: "CodeTitans India 2026 - National Hackathon",
        organizer: "WeCodeCoders",
        platform: UNSTOP,
        mode: "Online",
        location: "Online",
        description:
            "Three rounds: a solution PDF, then a functional product build, then final polish. Teams are judged on a working central workflow. Rs 30,000 prize pool plus internship and incubation offers.",
        techStack: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "Full Stack"],
        skills: ["Full Stack", "Web Development", "Backend", "Software Development", "Product Thinking"],
        deadline: new Date("2026-11-06"),
        officialUrl: "https://unstop.com/hackathons/codetitans-india-2026-national-hackathon-wecodecoders-1766190",
        source: UNSTOP,
        lastChecked: LAST_CHECKED
    },
    {
        name: "RunUp Coders Hackathon 2026",
        organizer: "CodeVerse Community",
        platform: UNSTOP,
        mode: "Online",
        location: "Online",
        description:
            "A fully online open-innovation hackathon for students across India. Idea submission round followed by a build round covering web development, AI, data science, FinTech and social impact.",
        techStack: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "Web Development"],
        skills: ["Web Development", "Open Innovation", "Full Stack", "Problem Solving", "Software Development"],
        deadline: new Date("2026-10-30"),
        officialUrl: "https://unstop.com/hackathons/codeverse-2026-open-innovation-hackathon-codeverse-community-1764453",
        source: UNSTOP,
        lastChecked: LAST_CHECKED
    },
    {
        name: "Vihaan X: Software Track",
        organizer: "IEEE DTU (Delhi Technological University)",
        platform: UNSTOP,
        mode: "Hybrid",
        location: "Delhi Technological University, New Delhi",
        description:
            "North India's largest student-run hackathon, organised by IEEE DTU. The software track focuses on building real, scalable products with mentoring from industry experts across HealthTech, FinTech, Education and Web3.",
        techStack: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "Full Stack"],
        skills: ["Full Stack", "Web Development", "Backend", "UI/UX", "Software Development"],
        deadline: new Date("2026-11-07"),
        officialUrl: "https://unstop.com/hackathons/vihaan-x-software-track-dtu-new-delhi-1761841",
        source: UNSTOP,
        lastChecked: LAST_CHECKED
    }
];

const seedHackathons = async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set. Add it to your .env file (see .env.example).");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const removed = await Hackathon.deleteMany();
        await Hackathon.insertMany(hackathons);

        console.log(`Seeded ${hackathons.length} real Unstop hackathons (removed ${removed.deletedCount} old records).`);
        console.log("Embeddings were cleared - run `npm run seed:embeddings` to rebuild them.");
    } catch (error) {
        console.error("Seeding error:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close().catch(() => {});
    }
};

seedHackathons();
