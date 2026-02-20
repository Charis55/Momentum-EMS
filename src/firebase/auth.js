// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./config";

export async function registerUser(email, password) {
  // Return the full credential object so the component can access .user
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred; 
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export function subscribeAuth(cb) {
  return onAuthStateChanged(auth, cb);
}