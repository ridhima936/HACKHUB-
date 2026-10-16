const express = require("express");
const Hackathon = require("../models/Hackathon");

const router = express.Router();

// ==================== GET ALL HACKATHONS ====================

router.get("/", async (req, res) => {
    try {
        const { search, techStack } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        if (techStack) {
            filter.techStack = {
                $in: [techStack]
            };
        }

        const hackathons = await Hackathon.find(filter);

        res.json(hackathons);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch hackathons"
        });
    }
});

// ==================== GET SINGLE HACKATHON ====================

router.get("/:id", async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);

        if (!hackathon) {
            return res.status(404).json({
                message: "Hackathon not found"
            });
        }

        res.json(hackathon);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch hackathon"
        });
    }
});

module.exports = router;