require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Project = require("./models/Project");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

app.get("/", (req, res) => {
    res.json({
        message: "HackHub API is running"
    });
});

app.get("/api/projects", async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch projects"
        });
    }
});

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

app.post("/api/projects", async (req, res) => {
    try {
        const { name, description, category } = req.body;

        const project = await Project.create({
            name,
            description,
            category
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create project"
        });
    }
});

app.patch("/api/projects/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update project"
        });
    }
});

app.delete("/api/projects/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            message: "Project deleted successfully",
            project
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete project"
        });
    }
});

app.listen(5000, () => {
    console.log("HackHub server running on port 5000");
});