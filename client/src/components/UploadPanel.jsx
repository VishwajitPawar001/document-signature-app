import { useState } from "react";
import { uploadDocument } from "../services/DocumentService";

function UploadPanel({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleFile = (selectedFile) => {
        setError("");

        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            setError("Only PDF files are allowed.");
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("File size must be less than 10MB.");
            return;
        }

        setFile(selectedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setIsUploading(true);
            setError("");

            await uploadDocument(file);

            if (onUploadSuccess) {
                await onUploadSuccess();
            }

            setIsUploading(false);
            setFile(null);
            onClose();
        } catch (error) {
            console.error(error);
            setIsUploading(false);
            setError("Upload failed.");
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Slide Panel */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-slate-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 translate-x-0">

                <div className="p-6 h-full flex flex-col">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-semibold">
                            Upload Document
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition text-xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Drag Zone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center px-6 transition-all duration-300 cursor-pointer ${isDragging
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-white/20 bg-white/5"
                            }`}
                        onClick={() =>
                            document.getElementById("fileInput").click()
                        }
                    >
                        {file ? (
                            <>
                                <p className="text-white font-medium mb-2">
                                    {file.name}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="text-red-400 text-sm"
                                >
                                    Remove
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mb-4 text-indigo-400 text-5xl">
                                    ⬆
                                </div>
                                <p className="text-lg font-medium mb-2">
                                    Drag & Drop your PDF here
                                </p>
                                <p className="text-sm text-slate-400">
                                    or click to browse files
                                </p>
                            </>
                        )}

                        <input
                            id="fileInput"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) =>
                                handleFile(e.target.files[0])
                            }
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-400 text-sm mt-4">
                            {error}
                        </p>
                    )}

                    {/* Footer Button */}
                    <button
                        disabled={!file || isUploading}
                        onClick={handleUpload}
                        className="mt-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>

                </div>
            </div>
        </>
    );
}

export default UploadPanel;