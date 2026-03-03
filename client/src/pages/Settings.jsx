import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Settings() {
  const navigate = useNavigate();

  const storedEmail = localStorage.getItem("userEmail");

  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || ""
  );
  const [isEditing, setIsEditing] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    localStorage.setItem("displayName", displayName);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Password changed successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Layout title="Settings">
      <div className="text-white max-w-3xl mx-auto space-y-8">

        {/* Profile */}
        <div className="bg-slate-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">
            Profile
          </h2>

          <div className="space-y-5">

            <div>
              <label className="text-sm text-slate-400">
                Email
              </label>
              <div className="bg-slate-900 px-4 py-3 rounded-lg">
                {storedEmail}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Display Name
              </label>

              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900 px-4 py-3 rounded-lg outline-none border border-slate-700"
                />
              ) : (
                <div className="bg-slate-900 px-4 py-3 rounded-lg">
                  {displayName || "Not Set"}
                </div>
              )}
            </div>

            <div>
              {isEditing ? (
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-indigo-600 rounded-lg"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 rounded-lg"
                >
                  Edit
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Change Password */}
        <div className="bg-slate-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">
            Change Password
          </h2>

          <div className="space-y-4">

            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-900 px-4 py-3 rounded-lg outline-none border border-slate-700"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-900 px-4 py-3 rounded-lg outline-none border border-slate-700"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900 px-4 py-3 rounded-lg outline-none border border-slate-700"
            />

            <button
              onClick={handleChangePassword}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              Update Password
            </button>

          </div>
        </div>

        {/* Logout */}
        <div className="bg-slate-800 p-8 rounded-2xl">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        </div>

      </div>
    </Layout>
  );
}

export default Settings;