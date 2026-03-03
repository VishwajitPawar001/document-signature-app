import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/documents/my-documents",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message);
          return;
        }

        setDocuments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <Layout title="All Documents">
      <div className="text-white">

        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-slate-400">
            No documents found.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/documents/${doc._id}`)}
                className="bg-slate-800 p-6 rounded-xl cursor-pointer hover:bg-slate-700 transition"
              >
                <h2 className="text-lg font-semibold mb-2">
                  {doc.title}
                </h2>

                <p className="text-sm text-slate-400">
                  Created: {new Date(doc.createdAt).toLocaleDateString()}
                </p>

                <span
                  className={`inline-block mt-3 px-3 py-1 text-xs rounded ${
                    doc.status === "Completed"
                      ? "bg-green-600"
                      : doc.status === "In Progress"
                      ? "bg-yellow-600"
                      : "bg-gray-600"
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Documents;