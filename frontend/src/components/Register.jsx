import { useState } from "react";
import api, { errorMessage } from "../services/api";
import { AuthShell, Crest } from "./Ui";

function Register({ onLogin, onLoginSuccess, onBack }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setBusy(true);
        try {
            await api.post("/auth/register", { name, email, password });
            // Sign the new student in straight away.
            const { data } = await api.post("/auth/login", { email, password });
            onLoginSuccess(data.token);
        } catch (err) {
            setError(errorMessage(err, "Registration failed"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthShell>
            <Crest size={64} />
            <h1>Join HackHub</h1>
            <p className="auth-tag">Begin your journey as a student developer</p>

            <form onSubmit={handleRegister} className="form">
                <label>
                    Full name
                    <input type="text" placeholder="Your name" value={name} minLength={3} maxLength={60}
                        autoComplete="name" onChange={(e) => setName(e.target.value)} required />
                </label>
                <label>
                    Email
                    <input type="email" placeholder="you@college.edu" value={email} autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" placeholder="At least 6 characters" value={password} autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <div className="form-error" role="alert">{error}</div>}
                <button className="btn btn-gold btn-block" type="submit" disabled={busy}>
                    {busy ? "Preparing your robes…" : "Create Account"}
                </button>
            </form>

            <p className="auth-switch">
                Already enrolled?{" "}
                <button type="button" className="link-btn" onClick={onLogin}>Sign in</button>
            </p>

            <button type="button" className="link-btn auth-back" onClick={onBack}>
                ← Back to home
            </button>

            <div className="auth-foot">
                <span>📚 Projects</span>
                <span>🛡️ Teams</span>
                <span>🔮 AI Hackathon Matching</span>
            </div>
        </AuthShell>
    );
}

export default Register;
