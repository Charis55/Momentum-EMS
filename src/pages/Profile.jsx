import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  updateProfile,
  deleteUser,
  verifyBeforeUpdateEmail,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Toolbar from "../components/Toolbar";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Profile() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => { },
    onCancel: null
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUsername(snap.data().username || "");
      }
    }
    loadProfile();
  }, [user]);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setStatusMsg({ type: "error", text: "❌ Error logging out." });
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatusMsg({ type: "", text: "" });
    try {
      await updateProfile(user, { displayName: username });
      await setDoc(doc(db, "users", user.uid), { username, email: user.email }, { merge: true });
      setStatusMsg({ type: "success", text: "✅ Profile updated successfully!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: "❌ Error: " + err.message });
    }
    setSaving(false);
  }

  async function handleEmailUpdate() {
    if (email === user.email) return;
    try {
      await verifyBeforeUpdateEmail(user, email);
      setStatusMsg({ type: "success", text: "📧 Verification link sent to new email!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: "❌ Re-authenticate to change email." });
    }
  }

  async function handlePasswordReset() {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setStatusMsg({ type: "success", text: "🔑 Password reset link sent!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: "❌ Error: " + err.message });
    }
  }

  async function confirmDelete() {
    try {
      await deleteUser(user);
      window.location.href = "/login";
    } catch (err) {
      setModal({
        isOpen: true,
        title: "Error",
        message: "❌ Re-authenticate to delete account.",
        type: "danger",
        onConfirm: () => setModal({ ...modal, isOpen: false }),
        onCancel: null
      });
    }
  }

  const handleDeleteRequest = () => {
    setModal({
      isOpen: true,
      title: "Delete Account",
      message: "Are you sure? This action is irreversible.",
      type: "danger",
      onConfirm: confirmDelete,
      onCancel: () => setModal({ ...modal, isOpen: false })
    });
  };

  return (
    <div className="profile-page-root">
      <Toolbar />
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "0 20px" }}>
        <div className="profile-settings-card">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "900", marginBottom: "30px", textAlign: "center" }}>Account Settings</h2>

          {statusMsg.text && (
            <p style={{
              textAlign: "center",
              color: statusMsg.type === "error" ? "#ff4444" : "#ffcc33",
              fontWeight: "600",
              marginBottom: "20px"
            }}>{statusMsg.text}</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label className="profile-input-label">Display Name</label>
              <input
                className="profile-input"
                style={{ marginBottom: "10px" }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button className="btn-primary" style={{ width: "100%", padding: "14px" }} onClick={handleSave} disabled={saving}>
              {saving ? "Processing..." : "Save Basic Info"}
            </button>

            <hr style={{ border: "0", borderTop: "1px solid rgba(150,150,150,0.3)", margin: "10px 0" }} />

            <div>
              <label className="profile-input-label">Account Email</label>
              <input className="profile-input" style={{ marginBottom: "10px" }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn-secondary-outline" onClick={handleEmailUpdate}>Update & Verify Email</button>
            </div>

            <button className="btn-secondary-outline" onClick={handlePasswordReset}>Send Password Reset Email</button>

            <div className="danger-zone-card">
              <h4 style={{ color: "#ff4444", margin: "0 0 10px 0" }}>Danger Zone</h4>
              <button className="btn-primary" style={{ background: "#ff4444", marginBottom: "10px", width: "100%", padding: "14px" }} onClick={handleDeleteRequest}>Delete Account</button>
              <button className="btn-secondary-outline" onClick={handleLogout}>Logout from Momentum</button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
      />
    </div>
  );
}