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

export default function Profile() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      alert("❌ Re-authenticate to delete account.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at 15% 15%, #8b4513 0%, #3d1f0a 35%, #0f0e0e 75%, #0a0a0a 100%)",
      paddingTop: "100px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <Toolbar />
      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ 
          background: "rgba(255, 255, 255, 0.05)", 
          backdropFilter: "blur(15px)", 
          borderRadius: "30px", 
          padding: "40px",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white"
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
              <label style={{ display: "block", marginBottom: "8px", opacity: 0.8, fontSize: "0.9rem" }}>Display Name</label>
              <input 
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
              <label style={{ display: "block", marginBottom: "8px", opacity: 0.8, fontSize: "0.9rem" }}>Account Email</label>
              <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button style={outlineBtn} onClick={handleEmailUpdate}>Update & Verify Email</button>
            </div>

            <button style={outlineBtn} onClick={handlePasswordReset}>Send Password Reset Email</button>

            <div style={{ marginTop: "20px", padding: "20px", borderRadius: "20px", background: "rgba(255, 68, 68, 0.1)" }}>
              <h4 style={{ color: "#ff4444", margin: "0 0 10px 0" }}>Danger Zone</h4>
              <button style={{ ...primaryBtn, background: "#ff4444", marginBottom: "10px" }} onClick={() => setShowDeleteModal(true)}>Delete Account</button>
              <button style={outlineBtn} onClick={handleLogout}>Logout from Momentum</button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Are you sure?</h3>
            <p>This action is irreversible.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={{ ...primaryBtn, background: "#ff4444" }} onClick={confirmDelete}>Confirm</button>
              <button style={{ ...primaryBtn, background: "#444" }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: "rgba(255,255,255,0.9)", color: "#333", fontWeight: "600", marginBottom: "10px" };
const primaryBtn = { width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "linear-gradient(90deg, #ff7e00, #ffcc33)", color: "white", fontWeight: "800", cursor: "pointer" };
const outlineBtn = { width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "white", fontWeight: "600", cursor: "pointer", marginTop: "5px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalContent = { background: "#1a1a1a", padding: "40px", borderRadius: "30px", textAlign: "center", color: "white", border: "1px solid rgba(255,255,255,0.1)" };