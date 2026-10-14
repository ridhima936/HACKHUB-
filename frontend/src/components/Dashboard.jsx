import { useEffect, useState } from "react";
import api from "../services/api";

 function Dashboard({ onLogout, onCreateProject }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await api.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(response.data);

            } catch (error) {
                console.log(error);
                localStorage.removeItem("token");
                onLogout();
            }
        };

        getUser();
    }, [onLogout]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        onLogout();
    };

    return (
        <div className="dashboard">

            <h1>HackHub</h1>

            {user && (
                <>
                    <h2>Welcome, {user.name} 👋</h2>
                    <p>{user.email}</p>
                </>
            )}

            <div className="dashboard-buttons">
                <button onClick={onCreateProject}>
                        Create Project
                           </button>
                <button>My Projects</button>
                <button onClick={handleLogout}>Logout</button>
            </div>

        </div>
    );
}

export default Dashboard;