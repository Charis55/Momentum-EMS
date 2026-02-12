// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔧 Replace these with your Firebase credentials
const firebaseConfig = {
  apiKey: "AIzaSyDhY8aq0hB9qQa9TqTrZAixpLKlsxb26xM",
  authDomain: "studio-745307310-1f63a.firebaseapp.com",
  projectId: "studio-745307310-1f63a",
  storageBucket: "studio-745307310-1f63a.firebasestorage.app",
  messagingSenderId: "967052354065",
  appId: "1:967052354065:web:47a29a73105e42dea547b0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
