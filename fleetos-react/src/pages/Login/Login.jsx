import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import "./Login.css";

const MESSAGES = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

function Login() {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

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
    setBusy(true);

    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(MESSAGES[err.code] || "Sign in failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>FleetOS.</h1>
        <p>Sign in to your fleet</p>
        <input type="email" placeholder="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="login-error">{error}</div>}
        {info && <div className="login-info">{info}</div>}
        <button type="submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
        <button type="button" className="login-link" onClick={handleReset}>Forgot password?</button>
      </form>
    </div>
  );
}

export default Login;