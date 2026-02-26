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
    <main style={{
      minHeight: "100vh",
      background: "var(--bg-main)",
      paddingTop: "100px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <Toolbar />
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(15px)",
          borderRadius: "30px",
          padding: "40px",
          border: "1px solid var(--card-border)",
          color: "var(--card-text)"
        }}>
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
              <label htmlFor="username" style={{ display: "block", marginBottom: "8px", color: "var(--card-text-muted)", fontSize: "0.9rem" }}>Display Name</label>
              <input
                id="username"
                style={inputStyle}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button style={primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? "Processing..." : "Save Basic Info"}
            </button>

            <hr style={{ border: "0", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "10px 0" }} />

            <div>
              <label htmlFor="email" style={{ display: "block", marginBottom: "8px", color: "var(--card-text-muted)", fontSize: "0.9rem" }}>Account Email</label>
              <input id="email" style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button style={outlineBtn} onClick={handleEmailUpdate}>Update & Verify Email</button>
            </div>

            <button style={outlineBtn} onClick={handlePasswordReset}>Send Password Reset Email</button>

            <div style={{ marginTop: "20px", padding: "20px", borderRadius: "20px", background: "rgba(255, 68, 68, 0.1)" }}>
              <h3 style={{ color: "#ff6b6b", margin: "0 0 10px 0", fontSize: "1.2rem" }}>Danger Zone</h3>
              <button style={{ ...primaryBtn, background: "#ff6b6b", marginBottom: "10px" }} onClick={handleDeleteRequest}>Delete Account</button>
              <button style={outlineBtn} onClick={handleLogout}>Logout from Momentum</button>
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
    </main>
  );
}

const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "#ffffff", fontWeight: "600", marginBottom: "10px" };
const primaryBtn = { width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "linear-gradient(90deg, #ff7e00, #ffcc33)", color: "white", fontWeight: "800", cursor: "pointer" };
const outlineBtn = { width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid var(--card-border)", background: "transparent", color: "var(--card-text)", fontWeight: "600", cursor: "pointer", marginTop: "5px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalContent = { background: "#1a1a1a", padding: "40px", borderRadius: "30px", textAlign: "center", color: "white", border: "1px solid rgba(255,255,255,0.1)" };