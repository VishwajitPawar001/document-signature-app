const mongoose = require("mongoose");

const signatureSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentParticipant",
      required: true,
    },
    x: Number,
    y: Number,
    page: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signature", signatureSchema);