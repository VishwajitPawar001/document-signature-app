const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const Signature = require("../models/Signature");
const DocumentParticipant = require("../models/documentParticipant");
const Document = require("../models/Document");

exports.signDocument = async (req, res) => {
    try {
        const { token } = req.params;
        const { type, value, image, x, y, page } = req.body;

        const participant = await DocumentParticipant.findOne({ token });

        if (!participant) {
            return res.status(404).json({ message: "Invalid signing link" });
        }

        if (participant.status === "Completed") {
            return res.status(400).json({ message: "Already signed" });
        }

        const document = await Document.findById(participant.document);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Sequential check
        if (document.workflowType === "Sequential") {
            const previousParticipants = await DocumentParticipant.find({
                document: document._id,
                order: { $lt: participant.order },
            });

            const incomplete = previousParticipants.find(
                (p) => p.status !== "Completed"
            );

            if (incomplete) {
                return res.status(400).json({
                    message: "Waiting for previous participant to complete action",
                });
            }
        }

        // Load PDF
        const filePath = path.join(__dirname, "..", document.filePath);
        const existingPdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const pages = pdfDoc.getPages();
        const selectedPage = pages[page - 1];

        if (!selectedPage) {
            return res.status(400).json({ message: "Invalid page number" });
        }

        // TEXT SIGNATURE
        if (type === "text") {
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            selectedPage.drawText(value, {
                x,
                y,
                size: 20,
                font,
                color: rgb(0, 0, 0),
            });
        }

        // IMAGE SIGNATURE
        if (type === "image") {
            // Remove data URL prefix if present
            const base64Data = image.includes("base64,")
                ? image.split("base64,")[1]
                : image;

            const imageBuffer = Buffer.from(base64Data, "base64");

            const pngImage = await pdfDoc.embedPng(imageBuffer);

            // IMAGE SIGNATURE
            if (type === "image") {
                const base64Data = image.includes("base64,")
                    ? image.split("base64,")[1]
                    : image;

                const imageBuffer = Buffer.from(base64Data, "base64");
                const pngImage = await pdfDoc.embedPng(imageBuffer);

                selectedPage.drawImage(pngImage, {
                    x,
                    y,
                    width,
                    height,
                });
            }
        }

        // Save updated PDF
        const updatedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(filePath, updatedPdfBytes);

        // Save signature record
        await Signature.create({
            document: document._id,
            participant: participant._id,
            x,
            y,
            page,
        });

        participant.status = "Completed";
        participant.actionAt = new Date();
        await participant.save();

        // Check completion
        const allParticipants = await DocumentParticipant.find({
            document: document._id,
        });

        const allCompleted = allParticipants.every(
            (p) => p.status === "Completed"
        );

        if (allCompleted) {
            document.status = "Completed";
            await document.save();
        }

        res.json({
            message: "Document signed successfully",
            document
        });

    } catch (error) {
        console.log("SIGN ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};