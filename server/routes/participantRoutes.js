const express = require("express");
const router = express.Router();
const { addParticipants, getParticipants } = require("../controllers/participantController");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addParticipants);
router.get("/:documentId", protect, getParticipants);

module.exports = router;