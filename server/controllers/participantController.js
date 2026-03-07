const crypto = require("crypto");
const DocumentParticipant = require("../models/documentParticipant");
const Document = require("../models/Document");

exports.addParticipants = async (req, res) => {
    try {
        const { documentId, participants } = req.body;

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found"});
        }
        if (document.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "Not authorized"});
        }
        const createdParticipants = [];

        for (let i = 0; i<participants.length; i++) {
            const token = crypto.randomBytes(32).toString("hex");

            const participant = await DocumentParticipant.create({
                document: documentId,
                email: participants[i].email,
                role: participants[i].role,
                order: participants[i].order,
                token,
            });

            createdParticipants.push(participant);
        }

        document.status = "InProgress";
        await document.save();

        res.status(201).json({message: "Participants added successfully", participants: createdParticipants});
    } catch (error) {
        console.log("PARTICIPANT ERROR:", error.message);
        res.status(500).json({ message: "Server error"});
    }
};

exports.getParticipants = async (req, res) => {
    try{
        const { documentId } = req.params;

        const participants = await DocumentParticipant.find({
            document: documentId,
        });

        res.json({participants});
    } catch (error) {
        console.log("GET PARTICIPANTS ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
