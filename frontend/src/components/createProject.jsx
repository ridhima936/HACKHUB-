import { useState } from "react";
import api from "../services/api";

function CreateProject({ onBack }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");

            const response = await api.post(
                "/projects",
                {
                    name,
                    description,
                    category
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Project created successfully!");

            setName("");
            setDescription("");
            setCategory("");

        } catch (error) {
            console.log("CREATE PROJECT ERROR:", error.response?.data);
            setMessage(
                error.response?.data?.message ||
                "Failed to create project"
            );
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">

                <h1>HackHub</h1>
                <h2>Create Project</h2>

                <form onSubmit={handleCreate}>

                    <input
                        type="text"
                        placeholder="Project name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Project description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />

                    <button type="submit">
                        Create Project
                    </button>

                </form>

                <p className="message">
                    {message}
                </p>

                <button
                    className="secondary-button"
                    onClick={onBack}
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}

export default CreateProject;