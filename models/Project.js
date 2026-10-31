const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        techStack: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: ["Planning", "In Progress", "Completed"],
            default: "Planning"
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;