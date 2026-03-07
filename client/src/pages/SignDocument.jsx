import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import SignatureBox from "../components/SignatureBox";

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function SignDocument() {
  const { token } = useParams();

  const [documentData, setDocumentData] = useState(null);
  const [participantEmail, setParticipantEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(900);

  /* ================= FETCH DATA ================= */
  const fetchSigningData = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/documents/sign/${token}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid signing link");
        return;
      }

      setDocumentData(data.document);
      setParticipantEmail(data.participantEmail);
      setRole(data.role);
      setSignatures(data.document.signatureFields || []);

    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSigningData();
  }, [fetchSigningData]);

  /* ================= RESPONSIVE WIDTH ================= */
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  /* ================= SIGN ACTION ================= */
  const handleParticipantSign = async (imageData) => {
    try {
      const response = await fetch(
        documentData.filePath,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signatureImage: imageData })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Signing failed");
        return;
      }

      fetchSigningData();

    } catch (error) {
      console.error("Sign error:", error);
    }
  };

  /* ================= VALIDATOR ================= */
  const handleValidatorAction = async (type) => {
    const body =
      type === "reject"
        ? {
          action: "reject",
          rejectReason: prompt("Enter rejection reason:")
        }
        : { action: "approve" };

    const response = await fetch(
      documentData.filePath,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    fetchSigningData();
  };

  if (loading) {
    return <p className="text-white p-10">Loading...</p>;
  }

  if (!documentData) {
    return <p className="text-white p-10">Document not found</p>;
  }

  const participant = documentData.participants.find(
    p => p.email === participantEmail
  );

  const isCompleted = documentData.status === "Completed";
  const isRejected = documentData.status === "Rejected";

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">

      {isCompleted && (
        <div className="mb-6 bg-green-700 p-3 rounded text-center font-semibold">
          ✅ Document Completed
        </div>
      )}

      {isRejected && (
        <div className="mb-6 bg-red-700 p-3 rounded text-center font-semibold">
          ❌ Document Rejected
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">
        Signing as: {participantEmail}
      </h1>



      {/* ===== VALIDATOR BUTTONS ===== */}
      {role === "Validator" &&
        participant?.status === "Pending" &&
        !isCompleted &&
        !isRejected && (
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => handleValidatorAction("approve")}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Approve
            </button>

            <button
              onClick={() => handleValidatorAction("reject")}
              className="bg-red-600 px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        )}

      {/* ===== PDF VIEWER ===== */}
      <div
        ref={containerRef}
        className="w-full h-[800px] overflow-y-auto flex justify-center items-start bg-slate-900 rounded-lg"
      >
        <Document
          file={documentData.filePath}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {numPages &&
            Array.from(new Array(numPages), (_, index) => (
              <div key={index} className="relative w-fit">

                <Page
                  pageNumber={index + 1}
                  width={containerWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />

                {/* 🔥 SHOW ONLY PENDING OVERLAYS (avoid duplicate) */}
                {documentData.status !== "Completed" &&
                  signatures
                    .filter(sig => sig.page === index + 1)
                    .map(sig => {

                      const x =
                        sig.xPercent !== undefined
                          ? sig.xPercent * containerWidth
                          : sig.x || 0;

                      const y =
                        sig.yPercent !== undefined
                          ? sig.yPercent * containerWidth
                          : sig.y || 0;

                      const width =
                        sig.widthPercent !== undefined
                          ? sig.widthPercent * containerWidth
                          : sig.width || 180;

                      const height =
                        sig.heightPercent !== undefined
                          ? sig.heightPercent * containerWidth
                          : sig.height || 60;

                      return (
                        <SignatureBox
                          key={sig._id}
                          mode={
                            sig.participantEmail === participantEmail &&
                              participant?.status === "Pending"
                              ? "sign"
                              : "readonly"
                          }
                          signature={{
                            ...sig,
                            x,
                            y,
                            width,
                            height
                          }}
                          onSign={
                            sig.participantEmail === participantEmail &&
                              participant?.status === "Pending"
                              ? handleParticipantSign
                              : undefined
                          }
                        />
                      );
                    })}

              </div>
            ))}
        </Document>
      </div>
    </div>
  );
}

export default SignDocument;