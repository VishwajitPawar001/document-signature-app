import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import UploadPanel from "../components/UploadPanel";
import { getMyDocuments } from "../services/DocumentService";


function Dashboard() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [documents, setDocuments] = useState([]);

    const fetchDocuments = async () => {
        try {
            const data = await getMyDocuments();
            setDocuments(data);
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadDocuments = async () => {
            try {
                const data = await getMyDocuments();
                if (isMounted) {
                    setDocuments(data);
                }
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        loadDocuments();

        return () => {
            isMounted = false;
        };
    }, []);

    const totalDocuments = documents.length;

    const activeDocuments = documents.filter(
        (doc) =>
            doc.status === "Draft" ||
            doc.status === "In Progress"
    ).length;

    const completedDocuments = documents.filter(
        (doc) => doc.status === "Completed"
    ).length;

    const stats = [
        {
            label: "Total Documents",
            value: totalDocuments,
            isGradient: true,
            textColor: "text-white",
        },
        {
            label: "Active Documents",
            value: activeDocuments,
            isGradient: false,
            textColor: "text-yellow-400",
        },
        {
            label: "Completed",
            value: completedDocuments,
            isGradient: false,
            textColor: "text-green-400",
        },
    ];

    return (
        <>
            <Layout
                title="Dashboard"
                action={
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/30"
                    >
                        Upload Document
                    </button>
                }
            >
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">
                        Welcome Back 👋
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Here’s what’s happening with your documents today.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`p-8 rounded-3xl border border-white/10 backdrop-blur-xl hover:scale-[1.02] transition ${stat.isGradient
                                ? "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                                : "bg-white/5"
                                }`}
                        >
                            <p className="text-slate-400 text-sm mb-2">
                                {stat.label}
                            </p>
                            <h2 className={`text-4xl font-bold ${stat.textColor}`}>
                                {stat.value}
                            </h2>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                    <h2 className="text-2xl font-semibold mb-6">
                        Recent Activity
                    </h2>

                    {documents.length === 0 ? (
                        <p className="text-slate-400">
                            No documents uploaded yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {documents.slice(0, 3).map((doc) => (
                                <div
                                    key={doc._id}
                                    className="flex justify-between text-sm text-slate-300"
                                >
                                    <Link
                                        to={`/documents/${doc._id}`}
                                        className="hover:text-indigo-400 transition"
                                    >
                                        {doc.title || "Untitled Document"}
                                    </Link>

                                    <span>{doc.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Layout>

            <UploadPanel
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={fetchDocuments}
            />
        </>
    );
}

export default Dashboard;