const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendSigningEmail = async (email, token) => {
  const signingLink = `${process.env.CLIENT_URL}/sign/${token}`;

  await transporter.sendMail({
    from: `"Document Signature App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Document Signature Request",
    html: `
      <h2>You have been requested to sign a document</h2>
      <p>Click the link below to review and sign the document:</p>
      <a href="${signingLink}" target="_blank">${signingLink}</a>
      <p>This link will expire in 7 days.</p>
    `
  });
};