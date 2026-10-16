require("dotenv").config();
const express = require("express");
const Project = require("./models/Project");
const authMiddleware = require("./middleware/authMiddleware");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/hackathons", hackathonRoutes);

// ==================== HOME ROUTE ====================

app.get("/", (req, res) => {
    res.json({
        message: "HackHub API is running"
    });
});

// ==================== GET ALL PROJECTS ====================

app.get("/api/projects", async (req, res) => {
    try {
        const { search, category } = req.query;

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

        if (category) {
            filter.category = category;
        }

        const projects = await Project.find(filter);

        res.json(projects);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch projects"
        });
    }
});

// ==================== GET MY PROJECTS ====================

app.get("/api/projects/my", authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({
            owner: req.user.userId
        });

        res.json(projects);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your projects"
        });
    }
});

// ==================== GET SINGLE PROJECT ====================

app.get("/api/projects/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch project"
        });
    }
});

// ==================== CREATE PROJECT ====================

app.post("/api/projects", authMiddleware, async (req, res) => {
    try {
        const { name, description, category } = req.body;

        const project = await Project.create({
            name,
            description,
            category,
            owner: req.user.userId
        });

        res.status(201).json(project);
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
            message: "Failed to create project"
        });
    }
});

// ==================== UPDATE PROJECT ====================

app.patch("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this project"
            });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true
            }
        );

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update project"
        });
    }
});

// ==================== DELETE PROJECT ====================

app.delete("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this project"
            });
        }

        await Project.findByIdAndDelete(req.params.id);

        res.json({
            message: "Project deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete project"
        });
    }
});

// ==================== START SERVER ====================

connectDB();

app.listen(5000, () => {
    console.log("HackHub server running on port 5000");
});