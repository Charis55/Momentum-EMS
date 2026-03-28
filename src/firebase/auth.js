// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  verifyBeforeUpdateEmail
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

/**
 * Modern Firebase way to update email.
 * Sends a verification link to the NEW email address.
 * Use ActionCodeSettings to redirect the user back to the app after verification.
 */
export async function changeUserEmail(newEmail) {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found.");

  const actionCodeSettings = {
    // Redirect back to the profile page after verification
    url: window.location.origin + "/profile",
    handleCodeInApp: true,
  };

  await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
  console.log("[Auth] verifyBeforeUpdateEmail sent successfully to:", newEmail);
}

export function subscribeAuth(cb) {
  return onAuthStateChanged(auth, cb);
}