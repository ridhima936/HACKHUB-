const mongoose = require("mongoose");

const escapeRegex = (value = "") =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseList = (value) => {
    if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
        return value.split(",").map((v) => v.trim()).filter(Boolean);
    }
    return [];
};

// Mongo filter for hackathons that are still open: no deadline, or a deadline
// that is today or later. Deadlines are stored as UTC dates, so compare against
// the start of today (UTC) to keep a hackathon visible on its last day.
const openNow = () => {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    return {
        $or: [
            { deadline: { $exists: false } },
            { deadline: null },
            { deadline: { $gte: startOfToday } }
        ]
    };
};

module.exports = { escapeRegex, isValidId, parseList, openNow };
