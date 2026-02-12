import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore"; // ✅ Changed updateDoc to setDoc
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, deleteUser, verifyBeforeUpdateEmail, sendPasswordResetEmail } from "firebase/auth";
import Toolbar from "../components/Toolbar";
import "./Profile.css";

export default function Profile() {
  const user = auth.currentUser;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [newPhoto, setNewPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUsername(snap.data().username || "");
        setPhotoURL(snap.data().photoURL || user.photoURL);
      }
    }
    loadProfile();
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setStatusMsg({ type: "", text: "" });
    try {
      let uploadedPhotoURL = photoURL;
      if (newPhoto) {
        const fileRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(fileRef, newPhoto);
        uploadedPhotoURL = await getDownloadURL(fileRef);
      }

      // 1. Update the Auth Profile
      await updateProfile(user, { displayName: username, photoURL: uploadedPhotoURL });

      // 2. Update or Create the Firestore document
      // ✅ Using setDoc with { merge: true } prevents the "No document to update" error
      await setDoc(doc(db, "users", user.uid), { 
        username, 
        photoURL: uploadedPhotoURL,
        email: user.email // Keep email synced for reference
      }, { merge: true });

      setPhotoURL(uploadedPhotoURL);
      setNewPhoto(null);
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
          <h2 className="auth-title" style={{ fontSize: '2.2rem' }}>Account Settings</h2>

          {statusMsg.text && (
            <p className={statusMsg.type === "error" ? "auth-error" : "gradient-text"} style={{ textAlign: 'center', marginBottom: '20px' }}>
              {statusMsg.text}
            </p>
          )}

          <div className="profile-photo-section">
            <div className="avatar-wrapper">
              <img
                src={newPhoto ? URL.createObjectURL(newPhoto) : photoURL || "/assets/avatar.png"}
                alt="Profile"
                className="profile-avatar-circle"
              />
              <label className="avatar-edit-badge">
                +
                <input type="file" accept="image/*" onChange={(e) => setNewPhoto(e.target.files[0])} hidden />
              </label>
            </div>
            <p>Click the + icon to change photo</p>
          </div>

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
              <h4>Danger Zone</h4>
              <p>Permanently delete your account and all data.</p>
              <button className="danger-btn" onClick={() => setShowDeleteModal(true)}>
                Delete Account
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