const axios = require("axios");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

exports.generateSignedPDF = async (document) => {
  try {

    /* ===== DOWNLOAD PDF FROM CLOUDINARY ===== */

    const response = await axios.get(document.filePath, {
      responseType: "arraybuffer"
    });

    const existingPdfBytes = response.data;

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    for (const signature of document.signatureFields) {

      if (signature.status !== "Signed" || !signature.image) continue;

      const pageIndex = signature.page - 1;
      const pdfPage = pages[pageIndex];

      if (!pdfPage) continue;

      const { width: pdfWidth, height: pdfHeight } = pdfPage.getSize();

      const x = signature.xPercent * pdfWidth;
      const width = signature.widthPercent * pdfWidth;
      const height = signature.heightPercent * pdfWidth;

      const y =
        pdfHeight -
        (signature.yPercent * pdfWidth) -
        height;

      const base64Data = signature.image.split(",")[1];
      const imageBytes = Buffer.from(base64Data, "base64");

      let embeddedImage;

      if (signature.image.includes("png")) {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      pdfPage.drawImage(embeddedImage, {
        x,
        y,
        width,
        height
      });

      /* ===== TEXT BELOW SIGNATURE ===== */

      const baseTextY = y - 14;
      let lineOffset = 0;

      const name =
        signature.participantName ||
        signature.participantEmail;

      pdfPage.drawText(name, {
        x,
        y: baseTextY - lineOffset,
        size: 10,
        font,
        color: rgb(0, 0, 0)
      });

      lineOffset += 12;

      if (signature.role) {
        pdfPage.drawText(signature.role, {
          x,
          y: baseTextY - lineOffset,
          size: 9,
          font,
          color: rgb(0.2, 0.2, 0.2)
        });

        lineOffset += 12;
      }

      if (signature.designation) {
        pdfPage.drawText(signature.designation, {
          x,
          y: baseTextY - lineOffset,
          size: 9,
          font,
          color: rgb(0.3, 0.3, 0.3)
        });

        lineOffset += 12;
      }

      if (signature.signedAt) {
        pdfPage.drawText(
          new Date(signature.signedAt).toLocaleString(),
          {
            x,
            y: baseTextY - lineOffset,
            size: 8,
            font,
            color: rgb(0.5, 0.5, 0.5)
          }
        );
      }
    }

    /* ===== RETURN FINAL PDF BUFFER ===== */

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;

  } catch (error) {

    console.error("PDF Generation Error:", error);
    throw error;

  }
};