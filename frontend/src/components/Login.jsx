import { useState } from "react";
import api, { errorMessage } from "../services/api";
import { AuthShell, Crest } from "./Ui";

function Login({ onRegister, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            onLoginSuccess(data.token);
        } catch (err) {
            setError(errorMessage(err, "Login failed"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell>
            <Crest size={64} />
            <h1>HackHub</h1>
            <p className="auth-tag">Enter the Developer Academy</p>

            <form onSubmit={handleLogin} className="form">
                <label>
                    Email
                    <input type="email" placeholder="you@college.edu" value={email} autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" placeholder="Your secret phrase" value={password} autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <div className="form-error" role="alert">{error}</div>}
                <button className="btn btn-gold btn-block" type="submit" disabled={busy}>
                    {busy ? "Opening the gates…" : "Sign In"}
                </button>
            </form>

            <p className="auth-switch">
                New to the academy?{" "}
                <button type="button" className="link-btn" onClick={onRegister}>Create an account</button>
            </p>

            <div className="auth-foot">
                <span>📚 Projects</span>
                <span>🛡️ Teams</span>
                <span>🔮 AI Hackathon Matching</span>
            </div>
        </AuthShell>
    );
}

export default Login;
