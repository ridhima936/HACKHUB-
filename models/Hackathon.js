const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        techStack: {
            type: [String],
            default: []
        },

        skills: {
            type: [String],
            default: []
        },

        deadline: {
            type: Date
        },

        organizer: {
            type: String,
            trim: true,
            default: ""
        },

        platform: {
            type: String,
            default: "Unstop"
        },

        // "Online" | "Offline" | "Hybrid" - shown as a badge on each card.
        mode: {
            type: String,
            default: "Online"
        },

        location: {
            type: String,
            trim: true,
            default: ""
        },

        officialUrl: {
            type: String,
            required: true
        },

        // Where the record came from and when it was last verified by hand.
        source: {
            type: String,
            default: "Unstop"
        },

        lastChecked: {
            type: Date
        },

        embedding: {
            type: [Number],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

module.exports = Hackathon;