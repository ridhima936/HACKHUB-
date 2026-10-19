require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
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

// Do not advertise the framework.
app.disable("x-powered-by");

// Allow a comma-separated list of frontends (local dev + deployed URL).
const origins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
// Vite picks the next free port (5174, 5175, ...) when 5173 is already taken, so
// also accept any localhost origin during development. Deployed origins must still
// be listed explicitly in CLIENT_URL.
const isLocalhost = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(
    cors({
        origin(origin, callback) {
            // No Origin header => same-origin requests, curl, health checks, etc.
            if (!origin || origins.includes(origin) || isLocalhost(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
    })
);

// Minimal, dependency-free security headers for the API.
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
});

app.use(express.json({ limit: "100kb" }));

const DB_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

app.get("/", (req, res) => res.json({ message: "HackHub API is running" }));
app.get("/api/health", (req, res) =>
    res.json({
        status: "ok",
        db: DB_STATES[mongoose.connection.readyState] || "unknown",
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
    })
);

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
    const server = app.listen(PORT, () => {
        console.log(`HackHub server running on port ${PORT}`);
        if (process.env.PRELOAD_MODEL !== "false") preloadModel();
    });

    // Close cleanly so Docker/Render restarts do not drop in-flight requests.
    const shutdown = (signal) => {
        console.log(`\n${signal} received - shutting down gracefully…`);
        server.close(async () => {
            await mongoose.connection.close().catch(() => {});
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
    };

    ["SIGINT", "SIGTERM"].forEach((signal) => process.on(signal, () => shutdown(signal)));
});
