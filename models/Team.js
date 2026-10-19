const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 60
    },

    description: {
        type: String,
        trim: true,
        maxlength: 500
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

teamSchema.set("timestamps", true);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;