const express = require("express");
const router = express.Router();
const { signDocument } = require("../controllers/signatureController");

router.post("/:token", signDocument);

module.exports = router;    