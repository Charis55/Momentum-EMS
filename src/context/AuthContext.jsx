// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Default to null instead of undefined to avoid check errors
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      console.log("[Auth] onAuthStateChanged:", currentUser?.uid || "none");
      setUser(currentUser); // Firebase returns null if logged out, or the user object
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {/* We only render children once loading is false to ensure 
         components don't try to access 'user' before Firebase is ready. 
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
}