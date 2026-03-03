const mongoose = require("mongoose");

/* ================= PARTICIPANT ================= */
const participantSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  role: {
    type: String,
    enum: ["Signer", "Witness", "Validator"],
    required: true
  },

  designation: {
    type: String,
    default: ""
  },

  order: {
    type: Number,
    default: null
  },

  status: {
    type: String,
    enum: ["Pending", "Signed", "Approved", "Rejected"],
    default: "Pending"
  },

  token: String,

  rejectReason: {
    type: String,
    default: ""
  }
});


/* ================= SIGNATURE FIELD ================= */
const signatureFieldSchema = new mongoose.Schema({
  page: {
    type: Number,
    required: true
  },

  xPercent: {
    type: Number,
    required: true
  },

  yPercent: {
    type: Number,
    required: true
  },

  widthPercent: {
    type: Number,
    required: true
  },

  heightPercent: {
    type: Number,
    required: true
  },

  participantEmail: {
    type: String,
    lowercase: true,
    trim: true,
    required: true
  },

  role: {
    type: String,
    required: true
  },

  designation: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["Pending", "Signed", "Rejected"],
    default: "Pending"
  },

  image: {
    type: String,
    default: ""
  },

  signedAt: Date
});


/* ================= AUDIT TRAIL ================= */
const auditSchema = new mongoose.Schema({
  action: String,
  by: String,
  role: String,
  timestamp: Date,
  ip: String,
  userAgent: String
});


/* ================= DOCUMENT ================= */
const documentSchema = new mongoose.Schema(
  {
    title: String,

    filePath: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["Draft", "InProgress", "Rejected", "Completed"],
      default: "Draft"
    },

    workflowMode: {
      type: String,
      enum: ["Sequential", "Parallel"],
      default: "Sequential"
    },
    

    participants: [participantSchema],

    signatureFields: [signatureFieldSchema],

    auditTrail: [auditSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);