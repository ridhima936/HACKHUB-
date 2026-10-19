const express = require("express");
const Hackathon = require("../models/Hackathon");
const { recommendHackathons } = require("../controllers/hackathonController");
const { escapeRegex, isValidId } = require("../utils/helpers");

const router = express.Router();

// AI recommendations (RAG)
router.post("/recommend", recommendHackathons);

// List + search/filter (embeddings are never sent to the client)
router.get("/", async (req, res) => {
    try {
        const { search, techStack } = req.query;
        const filter = {};

        if (search) {
            const rx = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ name: rx }, { description: rx }, { techStack: rx }, { skills: rx }];
        }
        if (techStack) {
            filter.techStack = new RegExp(`^${escapeRegex(techStack)}$`, "i");
        }

        const hackathons = await Hackathon.find(filter)
            .select("-embedding")
            .sort({ deadline: 1 });
        res.json(hackathons);
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch hackathon" });
    }
});

module.exports = router;
