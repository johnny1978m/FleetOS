import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
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
    let version = 0;

    return onAuthStateChanged(auth, async (current) => {
      const mine = ++version;
      setLoading(true);
      setError("");
      setProfile(null);
      setUser(current);

      let nextProfile = null;
      let nextError = "";

      if (current) {
        try {
          nextProfile = await loadProfile(current);
        } catch (err) {
          console.error(err);
          if (err.message === "verify-email") {
            nextError =
              "Your email is not verified yet. Open the verification link we sent you (check spam), then sign in again.";
          } else if (err.message === "removed") {
            nextError =
              "Your access to this company was removed. Ask your administrator.";
          } else {
            nextError = "Could not load your company profile.";
          }
        }
      }

      if (mine !== version) return;
      setProfile(nextProfile);
      setError(nextError);
      setLoading(false);
    });
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const register = async (email, password) => {
    const created = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await sendEmailVerification(created.user);
    } finally {
      await signOut(auth);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      companyId: profile?.companyId,
      role: profile?.role,
      login,
      logout,
      register,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
