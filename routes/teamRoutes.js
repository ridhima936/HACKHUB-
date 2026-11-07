const express = require("express");
const { createTeam, getTeams, joinTeam, leaveTeam } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getTeams);
router.post("/", authMiddleware, createTeam);
router.post("/:id/join", authMiddleware, joinTeam);
router.post("/:id/leave", authMiddleware, leaveTeam);

module.exports = router;
