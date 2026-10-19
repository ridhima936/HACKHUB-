require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { preloadModel } = require("./services/embeddingService");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamRoutes = require("./routes/teamRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Add it to your .env file (see .env.example).");
    process.exit(1);
}

const app = express();

const origins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => res.json({ message: "HackHub API is running" }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/hackathons", hackathonRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON body" });
    }
    console.error("Unhandled error:", err.message);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`HackHub server running on port ${PORT}`);
        if (process.env.PRELOAD_MODEL !== "false") preloadModel();
    });
});
