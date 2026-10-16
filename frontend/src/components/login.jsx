import { useState } from "react";
import api from "../services/api";
function Login({ onRegister, onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("LOGIN BUTTON CLICKED");
        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });
            localStorage.setItem("token", response.data.token);

            setMessage("Login successful!");

            onLoginSuccess();

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Login failed"
            );
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">

                <h1>HackHub</h1>
                <h2>Login</h2>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

                <p className="message">
                    {message}
                </p>

                <p className="switch-text">
                    Don't have an account?
                </p>

                <button
                    className="secondary-button"
                    onClick={onRegister}
                >
                    Create Account
                </button>

            </div>
        </div>
    );
}

export default Login;