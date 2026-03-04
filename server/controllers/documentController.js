const Document = require("../models/Document");
const { generateSignedPDF } = require("../services/pdfService");
const { sendSigningEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");

/* =====================================
   📤 Upload Document
===================================== */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      filePath: req.file.path,
      owner: req.user._id,
      status: "Draft",
      workflowMode: "Sequential",
      participants: [],
      signatureFields: [],
      auditTrail: []
    });

    res.status(201).json(document);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================
   📄 Get All Documents
===================================== */
exports.getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      owner: req.user._id
    }).sort({ createdAt: -1 });

    res.json(documents);

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================
   📄 Get Single Document
===================================== */
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!document)
      return res.status(404).json({ message: "Not found" });

    res.json(document);

  } catch {
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================
   👥 Add Participants
===================================== */
exports.addParticipants = async (req, res) => {
  try {
    const { participants, workflowMode } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!document)
      return res.status(404).json({ message: "Not found" });

    // Normalize and rebuild participants
    const normalizedParticipants = participants.map((p, index) => ({
      email: p.email.trim().toLowerCase(),
      role: p.role,
      designation: p.designation || "",
      order: workflowMode === "Sequential" ? index + 1 : null,
      status: "Pending",
      token: jwt.sign(
        {
          documentId: document._id,
          email: p.email.trim().toLowerCase()
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      )
    }));

    const validEmails = normalizedParticipants.map(p => p.email);

    // Remove signature fields of deleted participants
    document.signatureFields = document.signatureFields.filter(
      field => validEmails.includes(field.participantEmail)
    );

    // 🔥 Sync designation in signatureFields
    document.signatureFields = document.signatureFields.map(field => {
      const matchingParticipant = normalizedParticipants.find(
        p => p.email === field.participantEmail
      );

      if (matchingParticipant) {
        field.role = matchingParticipant.role;
        field.designation = matchingParticipant.designation;
      }

      return field;
    });

    document.participants = normalizedParticipants;
    // Send email to participants
    for (const p of normalizedParticipants) {
      try {
        await sendSigningEmail(p.email, p.token);
      } catch (err) {
        console.log("Email error:", err.message);
      }
    }
    document.workflowMode = workflowMode;

    if (document.status !== "Completed") {
      document.status = "InProgress";
    }

    document.auditTrail.push({
      action: "PARTICIPANTS_UPDATED",
      by: req.user.email,
      role: "Owner",
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    await document.save();

    res.json(document);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================
   💾 Save Layout
===================================== */
exports.saveSignatures = async (req, res) => {
  try {
    const { signatures } = req.body;

    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!document)
      return res.status(404).json({ message: "Not found" });

    document.signatureFields = signatures.map(sig => {

      const participant = document.participants.find(
        p => p.email === sig.participantEmail.trim().toLowerCase()
      );

      return {
        page: sig.page,

        // 🔥 Now we expect percent values directly
        xPercent: sig.xPercent,
        yPercent: sig.yPercent,
        widthPercent: sig.widthPercent,
        heightPercent: sig.heightPercent,

        participantEmail: sig.participantEmail.trim().toLowerCase(),
        role: participant?.role || sig.role,
        designation: participant?.designation || "",
        status: "Pending"
      };
    });

    await document.save();

    res.json(document);

  } catch (error) {
    console.log("SAVE SIGNATURE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


/* =====================================
   🔓 Public: Get For Signing
===================================== */
exports.getDocumentForSigning = async (req, res) => {
  try {
    const decoded = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET
    );

    const document = await Document.findById(decoded.documentId);

    if (!document)
      return res.status(404).json({ message: "Not found" });

    const participant = document.participants.find(
      p => p.email === decoded.email
    );

    if (!participant)
      return res.status(403).json({ message: "Unauthorized" });

    res.json({
      document,
      participantEmail: participant.email,
      role: participant.role
    });

  } catch {
    res.status(401).json({ message: "Invalid link" });
  }
};


/* =====================================
   ✍️ Public: Sign / Approve / Reject
===================================== */
exports.signDocument = async (req, res) => {
  try {
    const { signatureImage, action, rejectReason } = req.body;

    const decoded = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET
    );

    const document = await Document.findById(decoded.documentId);

    if (!document)
      return res.status(404).json({ message: "Not found" });

    const participant = document.participants.find(
      p => p.email === decoded.email
    );

    if (!participant)
      return res.status(403).json({ message: "Unauthorized" });

    if (participant.status !== "Pending")
      return res.status(403).json({
        message: "Action already completed"
      });

    /* ===== Sequential Enforcement ===== */
    if (document.workflowMode === "Sequential") {
      const nextPending = document.participants
        .filter(p => p.status === "Pending")
        .sort((a, b) => a.order - b.order)[0];

      if (!nextPending || nextPending.email !== participant.email)
        return res.status(403).json({
          message: "Not your turn yet"
        });
    }

    /* ===== VALIDATOR ===== */
    if (participant.role === "Validator") {

      const allSigned = document.participants
        .filter(p => p.role !== "Validator")
        .every(p => p.status === "Signed");

      if (!allSigned)
        return res.status(403).json({
          message: "All signers must sign first"
        });

      if (action === "approve") {
        participant.status = "Approved";
      }

      if (action === "reject") {
        participant.status = "Rejected";
        participant.rejectReason = rejectReason || "Rejected";
        document.status = "Rejected";
      }

    }

    // ===== SIGNER / WITNESS =====
    else {

      if (!signatureImage)
        return res.status(400).json({
          message: "Signature required"
        });

      // Find existing layout field
      const existingField = document.signatureFields.find(
        f => f.participantEmail === participant.email
      );

      if (!existingField)
        return res.status(400).json({
          message: "Signature field not found"
        });

      //  Update existing field instead of pushing new one
      existingField.image = signatureImage;
      existingField.status = "Signed";
      existingField.signedAt = new Date();
      existingField.designation = participant.designation || "";

      participant.status = "Signed";
    }

    /* ===== Completion Check ===== */
    const allComplete = document.participants.every(p =>
      ["Signed", "Approved"].includes(p.status)
    );

    if (allComplete && document.status !== "Rejected") {
      document.status = "Completed";

      const signedPath = await generateSignedPDF(document);
      document.filePath = signedPath;
    }

    /* ===== Audit Trail ===== */
    document.auditTrail.push({
      action: action || "SIGNED",
      by: participant.email,
      role: participant.role,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    await document.save();

    res.json({ document });

  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid link" });
  }
};