const cloudinary = require("cloudinary").v2;

/* =====================================
   Cloudinary Configuration
===================================== */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
});

/* =====================================
   Upload Helper (Optional but Useful)
===================================== */

const uploadToCloudinary = async (file, folder = "documents") => {
  try {

    const result = await cloudinary.uploader.upload(file, {
      resource_type: "raw",   // needed for PDFs
      folder: folder
    });

    return result;

  } catch (error) {

    console.error("Cloudinary Upload Error:", error);
    throw error;

  }
};

/* =====================================
   Export
===================================== */

module.exports = {
  cloudinary,
  uploadToCloudinary
};