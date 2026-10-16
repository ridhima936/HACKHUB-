const express = require("express");

const {
    createTeam,
    getTeams,
    joinTeam,
    leaveTeam
} = require("../controllers/teamController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createTeam);
router.get("/", getTeams);
router.post("/:id/join", authMiddleware, joinTeam);
router.post("/:id/leave", authMiddleware, leaveTeam);
module.exports = router;