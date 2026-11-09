const express = require("express");
const Hackathon = require("../models/Hackathon");
const { recommendHackathons } = require("../controllers/hackathonController");
const { escapeRegex, isValidId, openNow } = require("../utils/helpers");
const { syncIfStale } = require("../services/hackathonSync");

const router = express.Router();

const MAX_LISTED = 6;

const deadlineTime = (h) => (h.deadline ? new Date(h.deadline).getTime() : Infinity);
const bySoonestDeadline = (a, b) => {
    const x = deadlineTime(a);
    const y = deadlineTime(b);
    return x < y ? -1 : x > y ? 1 : 0;
};

// AI recommendations (RAG)
router.post("/recommend", recommendHackathons);

// Up to 6 open hackathons, soonest deadline first, with optional search/filter.
// Embeddings are never sent to the client.
router.get("/", async (req, res) => {
    syncIfStale();

    try {
        const { search, techStack } = req.query;
        const filter = { $and: [openNow()] };

        if (search) {
            const rx = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ name: rx }, { description: rx }, { techStack: rx }, { skills: rx }];
        }
        if (techStack) {
            filter.techStack = new RegExp(`^${escapeRegex(techStack)}$`, "i");
        }

        const hackathons = await Hackathon.find(filter).select("-embedding").lean();
        res.json(hackathons.sort(bySoonestDeadline).slice(0, MAX_LISTED));
    } catch {
        res.status(500).json({ message: "Failed to fetch hackathons" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid hackathon id" });
        }
        const hackathon = await Hackathon.findById(req.params.id).select("-embedding");
        if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
        res.json(hackathon);
    } catch {
        res.status(500).json({ message: "Failed to fetch hackathon" });
    }
});

module.exports = router;
