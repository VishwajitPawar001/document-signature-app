import { useState } from "react";
import axios from "axios";

function ParticipantModal({ documentId, onClose, onSuccess }) {

  const [participants, setParticipants] = useState([
    { email: "", role: "Signer", designation: "" }
  ]);

  const [workflowMode, setWorkflowMode] = useState("Sequential");
  const [loading, setLoading] = useState(false);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  /* ================= ADD ROW ================= */
  const addRow = () => {
    setParticipants([
      ...participants,
      { email: "", role: "Signer", designation: "" }
    ]);
  };

  /* ================= REMOVE ROW ================= */
  const removeRow = (index) => {
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(updated);
  };

  /* ================= VALIDATION ================= */
  const validateParticipants = () => {

    const emails = participants.map(p => p.email.trim().toLowerCase());

    if (emails.includes("")) {
      alert("Email cannot be empty");
      return false;
    }

    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      alert("Duplicate emails are not allowed");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validateParticipants()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/documents/${documentId}/participants`,
        {
          participants,
          workflowMode
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (onSuccess) onSuccess();
      onClose();

    } catch (error) {
      console.error(error);
      alert("Failed to save participants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-3xl space-y-8 shadow-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Manage Participants
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* WORKFLOW MODE */}
        <div className="flex items-center gap-4">
          <label className="text-slate-300 font-medium">
            Workflow Mode:
          </label>

          <select
            value={workflowMode}
            onChange={(e) => setWorkflowMode(e.target.value)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg"
          >
            <option value="Sequential">Sequential</option>
            <option value="Parallel">Parallel</option>
          </select>
        </div>

        {/* PARTICIPANTS LIST */}
        <div className="space-y-4">

          {participants.map((p, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 items-center bg-slate-800 p-4 rounded-xl"
            >

              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                value={p.email}
                onChange={(e) =>
                  handleChange(index, "email", e.target.value)
                }
                className="col-span-4 p-2 rounded bg-slate-700 text-white"
              />

              {/* Role */}
              <select
                value={p.role}
                onChange={(e) =>
                  handleChange(index, "role", e.target.value)
                }
                className="col-span-3 p-2 rounded bg-slate-700 text-white"
              >
                <option value="Signer">Signer</option>
                <option value="Witness">Witness</option>
                <option value="Validator">Validator</option>
              </select>

              {/* Designation */}
              <input
                type="text"
                placeholder="Designation (e.g. CEO)"
                value={p.designation}
                onChange={(e) =>
                  handleChange(index, "designation", e.target.value)
                }
                className="col-span-3 p-2 rounded bg-slate-700 text-white"
              />

              {/* Remove Button */}
              <button
                onClick={() => removeRow(index)}
                className="col-span-2 text-red-400 hover:text-red-600"
              >
                Remove
              </button>

            </div>
          ))}

        </div>

        {/* ADD ROW BUTTON */}
        <button
          onClick={addRow}
          className="text-indigo-400 hover:text-indigo-600"
        >
          + Add Another Participant
        </button>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-700 rounded-lg hover:bg-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Participants"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ParticipantModal;