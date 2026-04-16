# 🖊️ Signature App – Digital Document Signing Platform

A full-stack web application that allows users to upload PDF documents, add signatures interactively, and download signed documents. Designed for seamless digital signing with an intuitive UI and real-time preview.

---

## 🚀 Features

- 📄 Upload and view PDF documents  
- ✍️ Add draggable signature boxes  
- 🖱️ Draw or place signatures on documents  
- 📌 Precise positioning of signatures  
- 💾 Save and download signed PDFs  
- 🔐 Backend API for document management  
- ⚡ Smooth and responsive UI  

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- React PDF (`react-pdf`)  
- HTML5 Canvas  
- CSS / Tailwind  

### Backend
- Node.js  
- Express.js  

### Database
- MongoDB (if implemented)  

---

## 📂 Project Structure

signature-app/
│
├── client/ # Frontend (React)
│ ├── components/
│ │ └── SignatureBox.jsx
│ ├── pages/
│ │ └── SignDocument.jsx
│ └── services/
│ └── api.js
│
├── server/ # Backend (Node + Express)
│ ├── models/
│ ├── routes/
│ └── controllers/


---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/signature-app.git
cd signature-app

2️⃣ Setup Backend
cd server
npm install
npm start

3️⃣ Setup Frontend
cd client
npm install
npm run dev

🧠 How It Works
User uploads a PDF document
The document is rendered using react-pdf
A draggable Signature Box is added
User draws a signature using canvas
Signature position is tracked (X, Y coordinates)
Final signed document is generated and downloaded
🎯 Core Components
🔹 SignatureBox
Handles dragging and resizing
Captures signature input
Maintains position relative to PDF
🔹 SignDocument Page
Displays PDF pages
Controls signature placement logic
Manages user interactions
🔹 Backend API
Handles file uploads
Stores document metadata
Processes signed outputs
📌 Future Improvements
🔐 Authentication (JWT / OAuth)
☁️ Cloud storage (AWS S3 / Firebase)
📧 Email signed documents
📱 Full mobile responsiveness
🖋️ Multiple signatures support
📜 Audit logs & document history
🧪 Known Issues
Signature box may require precise clicking (UI refinement needed)
PDF scaling may vary across devices
📈 Why This Project Matters

This project demonstrates:

Real-world document processing workflow
Advanced frontend interaction (drag, drop, canvas)
Integration of PDF rendering libraries
Full-stack architecture with API handling
🤝 Contribution

Contributions are welcome:

Fork the repository
Create a feature branch
Commit changes
Open a Pull Request
📜 License

This project is licensed under the MIT License.

👨‍💻 Author

Vishwajit Pawar
Computer Engineering Student
Sinhgad Academy of Engineering

⭐ Support

If you found this project useful, consider giving it a star ⭐ on GitHub!
