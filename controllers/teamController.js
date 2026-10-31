const Team = require("../models/Team");
const { isValidId } = require("../utils/helpers");

const createTeam = async (req, res) => {
    try {
        const { name, description } = req.body || {};

        const team = await Team.create({
            name,
            description,
            owner: req.user.userId,
            members: [req.user.userId]
        });

        res.status(201).json({
            message: "Team created successfully",
            team
        });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed",
                errors: Object.values(error.errors).map(
                    err => err.message
                )
            });
        }

        res.status(500).json({
            message: "Failed to create team"
        });
    }
};
const joinTeam = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid team id" });
        }
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        const alreadyMember = team.members.some(
            member => member.toString() === req.user.userId
        );

        if (alreadyMember) {
            return res.status(400).json({
                message: "You are already a member of this team"
            });
        }

        team.members.push(req.user.userId);

        await team.save();

        res.json({
            message: "Joined team successfully",
            team
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to join team"
        });
    }
};
const leaveTeam = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: "Invalid team id" });
        }
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        if (!team.members.some((m) => m.toString() === req.user.userId)) {
            return res.status(400).json({ message: "You are not a member of this team" });
        }

        if (team.owner.toString() === req.user.userId) {
            return res.status(400).json({
                message: "Team owner cannot leave the team"
            });
        }

        team.members = team.members.filter(
            member => member.toString() !== req.user.userId
        );

        await team.save();

        res.json({
            message: "Left team successfully",
            team
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to leave team"
        });
    }
};
const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .sort({ createdAt: -1 })
            .populate("owner", "name email")
            .populate("members", "name email");

        res.json(teams);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch teams"
        });
    }
};
module.exports = {
    createTeam,
    getTeams,
    joinTeam,
    leaveTeam
};