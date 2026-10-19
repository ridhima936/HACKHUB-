import { useCallback, useEffect, useState } from "react";
import api from "./services/api";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import CreateProject from "./components/CreateProject";
import Team from "./components/Team";
import Hackathons from "./components/Hackathons";
import { Crest, Loading } from "./components/Ui";
import { useToast } from "./components/Toast";

const NAV = [
    { id: "dashboard", icon: "🏰", label: "Great Hall", hint: "Your dashboard" },
    { id: "projects", icon: "📚", label: "Project Library", hint: "Explore all projects" },
    { id: "my-projects", icon: "📜", label: "My Projects", hint: "Your creations" },
    { id: "create", icon: "✒️", label: "Create Project", hint: "Begin something new" },
    { id: "teams", icon: "🛡️", label: "Teams", hint: "Find your fellowship" },
    { id: "hackathons", icon: "🔮", label: "Hackathon Archives", hint: "Quests & AI guidance" }
];

function App() {
    const { notify } = useToast();
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [view, setView] = useState("dashboard");
    const [menuOpen, setMenuOpen] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setView("dashboard");
        setAuthMode("login");
        setMenuOpen(false);
    }, []);

    // Load the current user whenever we have a token.
    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        api.get("/auth/me")
            .then((res) => !cancelled && setUser({ ...res.data.user, id: res.data.user._id }))
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [token]);

    // Auto-logout when the API says the token is no longer valid.
    useEffect(() => {
        const onForcedLogout = () => {
            logout();
            notify("Your session has ended. Please sign in again.", "error");
        };
        window.addEventListener("hackhub:logout", onForcedLogout);
        return () => window.removeEventListener("hackhub:logout", onForcedLogout);
    }, [logout, notify]);

    const handleLoginSuccess = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const go = (id) => {
        setView(id);
        setMenuOpen(false);
        window.scrollTo({ top: 0 });
    };

    if (!token) {
        return authMode === "login" ? (
            <Login onRegister={() => setAuthMode("register")} onLoginSuccess={handleLoginSuccess} />
        ) : (
            <Register onLogin={() => setAuthMode("login")} onLoginSuccess={handleLoginSuccess} />
        );
    }

    const renderView = () => {
        if (!user) return <Loading text="Opening the academy gates…" />;
        switch (view) {
            case "projects":
                return <Projects key="all" mode="all" user={user} onCreate={() => go("create")} />;
            case "my-projects":
                return <Projects key="mine" mode="mine" user={user} onCreate={() => go("create")} />;
            case "create":
                return <CreateProject onDone={() => go("my-projects")} />;
            case "teams":
                return <Team user={user} />;
            case "hackathons":
                return <Hackathons />;
            default:
                return <Dashboard user={user} go={go} />;
        }
    };

    return (
        <div className="app-shell">
            <div className="mobile-bar">
                <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button>
                <span className="mobile-title">HackHub</span>
                <Crest size={30} />
            </div>

            {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

            <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
                <div className="brand">
                    <Crest />
                    <div>
                        <strong>HackHub</strong>
                        <span>The Developer Academy</span>
                    </div>
                </div>

                <nav className="nav">
                    {NAV.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${view === item.id ? "active" : ""}`}
                            onClick={() => go(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">
                                <b>{item.label}</b>
                                <small>{item.hint}</small>
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-foot">
                    <div className="student">
                        <div className="avatar">{(user?.name || "?").charAt(0).toUpperCase()}</div>
                        <div className="student-info">
                            <b>{user?.name || "Student"}</b>
                            <small>{user?.email}</small>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-block" onClick={logout}>Leave the Academy</button>
                </div>
            </aside>

            <main className="main">{renderView()}</main>
        </div>
    );
}

export default App;
