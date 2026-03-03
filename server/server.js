require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes")
const { protect } = require("./middleware/authMiddleware")
const signatureRoutes = require("./routes/signatureRoutes");
const participantRoutes = require("./routes/participantRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb"}));
app.use(express.urlencoded({ limit: "10mb", extended: true}));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes)
app.use("/api/signatures", signatureRoutes);
app.use("/api/participants", participantRoutes);

app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });
});

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI).then(()=> console.log("MongoDB Connected")).catch((err) => console.log(err));

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});