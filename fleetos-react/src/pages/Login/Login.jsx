import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import "./Login.css";

const MESSAGES = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/email-already-in-use": "This email already has an account. Sign in instead.",
  "auth/weak-password": "Password must be at least 8 characters.",
};

function Login() {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const signup = mode === "signup";

  const switchMode = () => {
    setMode(signup ? "signin" : "signup");
    setError("");
    setInfo("");
    setPassword("");
    setConfirm("");
  };

  const handleReset = async () => {
    setError("");
    setInfo("");

    if (!email.trim()) {
      setError("Enter your email above first.");
      return;
    }

    try {
      await resetPassword(email.trim());
      setInfo("If this email has an account, a reset link was sent. Check your inbox and spam.");
    } catch (err) {
      setError(MESSAGES[err.code] || "Could not send the email. Try again.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (signup && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (signup && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      if (signup) {
        await register(email.trim(), password);
        setInfo(`Account created. We sent a verification link to ${email.trim()}. Open it, then sign in.`);
        setMode("signin");
        setPassword("");
        setConfirm("");
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setError(MESSAGES[err.code] || (signup ? "Could not create the account. Try again." : "Sign in failed. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>FleetOS.</h1>
        <p>{signup ? "Create your account" : "Sign in to your fleet"}</p>
        <input type="email" placeholder="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
        {signup && (
          <input type="password" placeholder="Repeat password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        )}
        {error && <div className="login-error">{error}</div>}
        {info && <div className="login-info">{info}</div>}
        <button type="submit" disabled={busy}>{busy ? "Please wait..." : signup ? "Create account" : "Sign in"}</button>
        {!signup && (
          <button type="button" className="login-link" onClick={handleReset}>Forgot password?</button>
        )}
        <button type="button" className="login-link" onClick={switchMode}>
          {signup ? "Already have an account? Sign in" : "Have an invitation? Create account"}
        </button>
      </form>
    </div>
  );
}

export default Login;
