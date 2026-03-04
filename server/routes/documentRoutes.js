const express = require("express");
const router = express.Router();

const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  addParticipants,
  getDocumentForSigning,
  signDocument,
  saveSignatures,
  downloadSignedPDF
} = require("../controllers/documentController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");


router.get("/sign/:token", getDocumentForSigning);

router.post("/sign/:token", signDocument);

router.post("/upload", protect, upload.single("file"), uploadDocument);

router.get("/my-documents", protect, getMyDocuments);

router.post("/:id/participants", protect, addParticipants);

router.put("/:id/signatures", protect, saveSignatures);

router.get("/:id/download", protect, downloadSignedPDF);

router.get("/:id", protect, getDocumentById);



module.exports = router;