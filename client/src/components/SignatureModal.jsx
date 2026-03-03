import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

function SignatureModal({ onClose, onSave }) {
  const sigCanvas = useRef(null);

  const [mode, setMode] = useState("draw");
  const [typedName, setTypedName] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  // 🔐 Constraints
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_WIDTH = 600;
  const MAX_HEIGHT = 300;

  const clear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
    setTypedName("");
    setUploadedImage(null);
  };

  // ✅ Upload + Validate + Resize
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File type validation
    if (!file.type.startsWith("image/")) {
      alert("Only JPG or PNG images are allowed.");
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize if too large
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const scale = Math.min(
            MAX_WIDTH / width,
            MAX_HEIGHT / height
          );

          width = width * scale;
          height = height * scale;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const resizedImage = canvas.toDataURL("image/png");

        setUploadedImage(resizedImage);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    let imageData;

    if (mode === "draw") {
      if (sigCanvas.current.isEmpty()) {
        alert("Please draw your signature.");
        return;
      }

      imageData = sigCanvas.current.toDataURL("image/png");

    } else if (mode === "type") {
      if (!typedName.trim()) {
        alert("Please type your name.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "32px cursive";
      ctx.fillStyle = "black";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillText(
        typedName,
        canvas.width / 2,
        canvas.height / 2
      );

      imageData = canvas.toDataURL("image/png");

    } else if (mode === "upload") {
      if (!uploadedImage) {
        alert("Please upload a valid image.");
        return;
      }

      imageData = uploadedImage;
    }

    onSave(imageData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[520px] shadow-xl">

        <h2 className="text-xl font-semibold mb-4 text-black">
          Add Your Signature
        </h2>

        {/* Mode Buttons */}
        <div className="flex gap-3 mb-4">
          {["draw", "type", "upload"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded capitalize ${mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-black"
                }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Draw Mode */}
        {mode === "draw" && (
          <div className="border border-gray-300 rounded">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 480,
                height: 150,
                className: "sigCanvas"
              }}
            />
          </div>
        )}

        {/* Type Mode */}
        {mode === "type" && (
          <input
            type="text"
            placeholder="Type your name"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className="w-full border p-3 rounded text-black"
          />
        )}

        {/* Upload Mode */}
        {mode === "upload" && (
          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileUpload}
            />

            <p className="text-sm text-gray-500">
              Max size: 2MB | Max dimensions: 600x300 px
            </p>

            {uploadedImage && (
              <img
                src={uploadedImage}
                alt="Preview"
                className="max-h-32 object-contain border rounded"
              />
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={clear}
            className="px-4 py-2 bg-gray-300 rounded text-black"
          >
            Clear
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 rounded text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignatureModal;