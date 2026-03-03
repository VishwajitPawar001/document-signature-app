const mongoose = require("mongoose");

const documentParticipantSchema = new mongoose.Schema(
    {
        document: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Document",
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["Signer", "Validator", "Witness"],
            required: true,
        },
        order: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Completed", "Rejected"],
            default: "Pending",
        },
        token: {
            type: String,
            required: true,
        },
        actionAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model("DocumentParticipant", documentParticipantSchema);