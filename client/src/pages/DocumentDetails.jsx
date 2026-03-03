import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { getDocumentById } from "../services/DocumentService";
import ParticipantModal from "../components/ParticipantModal";

import { Document, Page, pdfjs } from "react-pdf";
import SignatureBox from "../components/SignatureBox";

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function DocumentDetail() {
  const { id } = useParams();

  const [documentData, setDocumentData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [signatures, setSignatures] = useState([]);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  /* ================= FETCH DOCUMENT ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDocumentById(id);
        setDocumentData(data);
        setSignatures(data.signatureFields || []);
      } catch (error) {
        console.error("Error loading document:", error);
      }
    };

    fetchData();
  }, [id]);

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

  /* ================= UPDATE SIGNATURE ================= */
  const updateSignature = (updated) => {
    setSignatures(prev =>
      prev.map(sig =>
        (sig._id || sig.id) === (updated._id || updated.id)
          ? updated
          : sig
      )
    );
  };

  /* ================= SAVE LAYOUT ================= */
  const saveSignaturesToBackend = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/documents/${id}/signatures`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            signatures: signatures.map(sig => ({
              page: sig.page,

              // 🔥 ALWAYS send percent values
              xPercent:
                sig.xPercent !== undefined
                  ? sig.xPercent
                  : sig.x / containerWidth,

              yPercent:
                sig.yPercent !== undefined
                  ? sig.yPercent
                  : sig.y / containerWidth,

              widthPercent:
                sig.widthPercent !== undefined
                  ? sig.widthPercent
                  : sig.width / containerWidth,

              heightPercent:
                sig.heightPercent !== undefined
                  ? sig.heightPercent
                  : sig.height / containerWidth,

              participantEmail: sig.participantEmail,
              role: sig.role,
              designation: sig.designation
            }))
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setDocumentData(data);
      setSignatures(data.signatureFields || []);
      alert("Layout saved successfully");

    } catch (error) {
      console.error(error);
    }
  };

  /* ================= ADD SIGNATURE ================= */
  const handleAddSignature = () => {
    if (!selectedParticipant) {
      alert("Select a participant first");
      return;
    }

    const alreadyExists = signatures.some(
      sig => sig.participantEmail === selectedParticipant
    );

    if (alreadyExists) {
      alert("Signature box already exists for this participant");
      return;
    }

    const participant = documentData.participants.find(
      p => p.email === selectedParticipant
    );

    if (!participant) return;

    setSignatures(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        page: 1,
        x: 100,
        y: 100,
        width: 180,
        height: 60,
        participantEmail: participant.email,
        role: participant.role,
        designation: participant.designation || "",
        status: "Pending"
      }
    ]);

    setSelectedParticipant("");
  };

  if (!documentData) {
    return (
      <Layout title="Loading...">
        <p className="text-white">Loading document...</p>
      </Layout>
    );
  }

  return (
    <>
      <Layout title={documentData.title}>
        <div className="space-y-8 text-white">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {documentData.title}
              </h1>
              <p className="text-slate-400">
                Status: {documentData.status}
              </p>
              <p className="text-slate-500 text-sm">
                Workflow: {documentData.workflowMode}
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <select
                value={selectedParticipant}
                onChange={(e) => setSelectedParticipant(e.target.value)}
                className="bg-slate-700 px-3 py-2 rounded"
              >
                <option value="">Select Participant</option>
                {documentData.participants
                  .filter(p => p.role !== "Validator")
                  .map(p => (
                    <option key={p.email} value={p.email}>
                      {p.email} ({p.role})
                    </option>
                  ))}
              </select>

              <button
                onClick={handleAddSignature}
                className="px-4 py-2 bg-green-600 rounded-lg"
              >
                Add Signature
              </button>

              <button
                onClick={saveSignaturesToBackend}
                className="px-4 py-2 bg-blue-600 rounded-lg"
              >
                Save Layout
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 rounded-lg"
              >
                Manage Participants
              </button>
            </div>
          </div>

          {/* PDF PREVIEW */}
          <div className="bg-slate-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">
              Document Preview
            </h2>

            <div
              ref={containerRef}
              className="w-full h-[700px] overflow-y-auto flex justify-center items-start bg-slate-900 rounded-lg"
            >
              <Document
                file={`http://localhost:5000/${documentData.filePath.replace(/\\/g, "/")}`}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                {numPages &&
                  Array.from(new Array(numPages), (_, index) => (
                    <div key={index} className="relative">
                      <Page
                        pageNumber={index + 1}
                        width={containerWidth}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />

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
                                key={sig._id || sig.id}
                                mode="layout"
                                signature={{
                                  ...sig,
                                  x,
                                  y,
                                  width,
                                  height
                                }}
                                onUpdate={updateSignature}
                              />
                            );
                          })}
                    </div>
                  ))}
              </Document>
            </div>
          </div>

        </div>
      </Layout>

      {isModalOpen && (
        <ParticipantModal
          documentId={id}
          onClose={() => setIsModalOpen(false)}
          onSuccess={async () => {
            const data = await getDocumentById(id);
            setDocumentData(data);
            setSignatures(data.signatureFields || []);
          }}
        />
      )}
    </>
  );
}

export default DocumentDetail;