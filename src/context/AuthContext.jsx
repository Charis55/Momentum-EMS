// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      console.log("[Auth] State Update:", currentUser ? "Logged In" : "Logged Out");
      setUser(currentUser);
      setLoading(false); // Once this hits false, PrivateRoute takes over
    });
    return () => unsub();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {/* FIX: We MUST render children immediately. 
          If we wait for !loading here, the Router context might fail 
          to sync the URL with the Component state on the first frame.
      */}
      {children}
    </AuthContext.Provider>
  );
}