import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { AuthContext } from "./useAuth";
import { loadProfile } from "./loadProfile";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (current) => {
      setLoading(true);
      setError("");
      setProfile(null);
      setUser(current);

      if (current) {
        try {
          setProfile(await loadProfile(current));
        } catch (err) {
          console.error(err);
          setError("Could not load your company profile.");
        }
      }

      setLoading(false);
    });
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      companyId: profile?.companyId,
      role: profile?.role,
      login,
      logout,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
