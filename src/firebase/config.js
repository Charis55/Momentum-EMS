// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";   // ✅ Added storage import

// --- Your Firebase project config ---
const firebaseConfig = {
  apiKey: "AIzaSyDhY8aq0hB9qQa9TqTrZAixpLKlsxb26xM",
  authDomain: "studio-745307310-1f63a.firebaseapp.com",
  projectId: "studio-745307310-1f63a",
  storageBucket: "studio-745307310-1f63a.firebasestorage.app", // ✅ Correct storage bucket
  messagingSenderId: "967052354065",
  appId: "1:967052354065:web:47a29a73105e42dea547b0",
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);

// ✅ Exports
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);  // ✅ Export storage for profile uploads

// Optional: expose to browser console for debugging
if (typeof window !== "undefined") {
  window.__AUTH__ = auth;
  window.__DB__ = db;
  window.__STORAGE__ = storage; // ✅ Helpful debug
}

export default app;
