import { useState } from "react";
import api from "../services/api";

function Register({ onLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/auth/register", {
                name,
                email,
                password
            });

            setMessage(response.data.message);

            setName("");
            setEmail("");
            setPassword("");

        } catch (error) {
            console.log("REGISTER ERROR:", error);
            console.log("SERVER RESPONSE:", error.response?.data);

            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">

                <h1>HackHub</h1>

                <h2>Create Account</h2>

                <form onSubmit={handleRegister}>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

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
                        Register
                    </button>

                </form>

                <p className="message">
                    {message}
                </p>

                <p className="switch-text">
                    Already have an account?
                </p>

                <button
                    className="secondary-button"
                    onClick={onLogin}
                >
                    Login
                </button>

            </div>
        </div>
    );
}

export default Register;