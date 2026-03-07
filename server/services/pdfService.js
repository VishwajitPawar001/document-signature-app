const axios = require("axios");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

exports.generateSignedPDF = async (document) => {
  try {

    let existingPdfBytes;

    /* ==============================
       LOAD ORIGINAL PDF
    ============================== */

    if (document.filePath.startsWith("http")) {

      const response = await axios.get(document.filePath, {
        responseType: "arraybuffer"
      });

      existingPdfBytes = response.data;

    } 
    else if (document.filePath.startsWith("data:")) {

      const base64Data = document.filePath.split(",")[1];
      existingPdfBytes = Buffer.from(base64Data, "base64");

    } 
    else {

      throw new Error("Invalid PDF source");

    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    /* ==============================
       APPLY SIGNATURES
    ============================== */

    for (const signature of document.signatureFields) {

      if (signature.status !== "Signed" || !signature.image) continue;

      const pageIndex = signature.page - 1;
      const pdfPage = pages[pageIndex];

      if (!pdfPage) continue;

      const { width, height } = pdfPage.getSize();

      const x = signature.xPercent * width;
      const y = height - (signature.yPercent * height);

      const sigWidth = signature.widthPercent * width;
      const sigHeight = signature.heightPercent * height;

      const base64Data = signature.image.split(",")[1];
      const imageBytes = Buffer.from(base64Data, "base64");

      let image;

      if (signature.image.includes("png")) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      pdfPage.drawImage(image, {
        x,
        y: y - sigHeight,
        width: sigWidth,
        height: sigHeight
      });

      /* SIGNER TEXT */

      const textY = y - sigHeight - 14;

      pdfPage.drawText(signature.participantEmail, {
        x,
        y: textY,
        size: 10,
        font,
        color: rgb(0,0,0)
      });

    }

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;

  } catch (error) {

    console.error("PDF Generation Error:", error);
    throw error;

  }
};