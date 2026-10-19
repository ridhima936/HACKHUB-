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

        platform: {
            type: String,
            default: "Unstop"
        },

        officialUrl: {
            type: String,
            required: true
        },

        githubUrl: {
            type: String,
            default: null
        },

        vercelUrl: {
            type: String,
            default: null
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