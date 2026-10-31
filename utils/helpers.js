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

module.exports = { escapeRegex, isValidId, parseList };
