import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config"; // Removed storage
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
import "./Profile.css";

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
      console.error("Logout Error:", err);
      setStatusMsg({ type: "error", text: "❌ Error logging out." });
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatusMsg({ type: "", text: "" });
    try {
      // Updated to only handle Display Name
      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, "users", user.uid), { 
        username, 
        email: user.email 
      }, { merge: true });

      setStatusMsg({ type: "success", text: "✅ Profile updated successfully!" });
    } catch (err) {
      console.error(err);
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
      setStatusMsg({ type: "error", text: "❌ Error: Re-authenticate to change email." });
    }
  }

  async function handlePasswordReset() {
    try {
      await sendPasswordResetEmail(auth, user.email);
      setStatusMsg({ type: "success", text: "🔑 Password reset link sent to your inbox!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: "❌ Error: " + err.message });
    }
  }

  async function confirmDelete() {
    try {
      await deleteUser(user);
      window.location.href = "/login";
    } catch (err) {
      alert("❌ Re-authenticate by logging in again to delete account.");
    }
  }

  return (
    <>
      <Toolbar />
      <div className="auth-bg auth-center" style={{ paddingTop: '80px' }}>
        <div className="profile-card animate-fade">
          
          <h2 className="auth-title" style={{ fontSize: '2.2rem', marginBottom: '30px' }}>Account Settings</h2>

          {statusMsg.text && (
            <p className={statusMsg.type === "error" ? "auth-error" : "gradient-text"} style={{ textAlign: 'center', marginBottom: '20px' }}>
              {statusMsg.text}
            </p>
          )}

          <div className="auth-form">
            <div className="input-group">
              <label>Display Name</label>
              <input 
                className="profile-input"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Username" 
              />
            </div>

            <button className="auth-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Processing..." : "Save Basic Info"}
            </button>

            <div className="profile-divider" />

            <div className="input-group">
              <label>Account Email</label>
              <input 
                className="profile-input"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <button className="btn-secondary-outline" onClick={handleEmailUpdate}>
                Update & Verify Email
              </button>
            </div>

            <div className="input-group">
              <label>Security</label>
              <button className="btn-secondary-outline" onClick={handlePasswordReset}>
                Send Password Reset Email
              </button>
            </div>

            <div className="danger-zone">
              <h4 style={{ color: '#ff4444' }}>Danger Zone</h4>
              <p>Session management and account deletion.</p>
              
              <button className="danger-btn" onClick={() => setShowDeleteModal(true)} style={{ marginBottom: '12px' }}>
                Delete Account
              </button>

              <button 
                onClick={handleLogout}
                className="btn-secondary-outline" 
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  fontSize: '1rem', 
                  borderColor: 'rgba(255,255,255,0.2)', 
                  color: '#fff',
                  marginTop: '5px'
                }}
              >
                Logout from Momentum
              </button>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="auth-card-dark" style={{ width: '380px', textAlign: 'center' }}>
              <h3 style={{ color: 'white', marginBottom: '10px' }}>Are you sure?</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '25px' }}>
                This action is irreversible. You may need to log in again to confirm.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="danger-btn" onClick={confirmDelete}>Confirm Delete</button>
                <button className="auth-btn" style={{ background: '#444' }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}