require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Project = require("./models/Project");
const User = require("./models/user");
const authMiddleware = require("./middleware/authMiddleware");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
// ==================== MongoDB Connection ====================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });
// ==================== Home Route ====================
app.get("/", (req, res) => {
    res.json({
        message: "HackHub API is running"
    });
});
// ==================== GET ALL PROJECTS ====================

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


// ==================== GET SINGLE PROJECT ====================
app.get("/api/projects/:id", async (req, res) => {
    try {
        const { search, category } = req.query;

        let filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
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
// ==================== REGISTER USER ====================

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
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

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({
            message: "Internal server error"
        });
    }
});


// ==================== LOGIN USER ====================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user"
        });
    }
});
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
            { new: true }
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
app.listen(5000, () => {
    console.log("HackHub server running on port 5000");
});