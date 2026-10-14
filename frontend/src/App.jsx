import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import CreateProject from "./components/CreateProject";

function App() {
    const [showRegister, setShowRegister] = useState(false);
    const [showCreateProject, setShowCreateProject] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setShowCreateProject(false);
    };

    if (isLoggedIn && showCreateProject) {
        return (
            <CreateProject
                onBack={() => setShowCreateProject(false)}
            />
        );
    }

    if (isLoggedIn) {
        return (
            <Dashboard
                onLogout={handleLogout}
                onCreateProject={() => setShowCreateProject(true)}
            />
        );
    }

    return (
        <>
            {showRegister ? (
                <Register
                    onLogin={() => setShowRegister(false)}
                />
            ) : (
                <Login
                    onRegister={() => setShowRegister(true)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
}

export default App;