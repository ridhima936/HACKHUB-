import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Team from "./Team";

const hackathonsData = [
    {
        id: 1,
        name: "AI Innovation Challenge",
        organizer: "HackHub Community",
        category: "AI / ML",
        mode: "Online",
        description:
            "Build innovative AI solutions to solve real-world problems.",
        prize: "Check official website",
        registrationUrl: "https://unstop.com/hackathons"
    },
    {
        id: 2,
        name: "Web Development Challenge",
        organizer: "HackHub Community",
        category: "Web Development",
        mode: "Online",
        description:
            "Create modern web applications using your favourite technologies.",
        prize: "Check official website",
        registrationUrl: "https://unstop.com/hackathons"
    },
    {
        id: 3,
        name: "Smart Campus Challenge",
        organizer: "HackHub Community",
        category: "Innovation",
        mode: "Online",
        description:
            "Develop technology-driven solutions for everyday campus problems.",
        prize: "Check official website",
        registrationUrl: "https://unstop.com/hackathons"
    }
];

function Dashboard({ onLogout, onCreateProject }) {
    const [user, setUser] = useState(null);
    const [projects, setProjects] = useState([]);

    const [showProjects, setShowProjects] = useState(false);
    const [showTeams, setShowTeams] = useState(false);
    const [showHackathons, setShowHackathons] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const [hackathonSearch, setHackathonSearch] = useState("");
    const [hackathonCategory, setHackathonCategory] = useState("");
    const [recommendedHackathons, setRecommendedHackathons] = useState([]);
    const [recommendationLoading, setRecommendationLoading] = useState(false);

    const [editingProject, setEditingProject] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editCategory, setEditCategory] = useState("");

    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await api.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(response.data.user || response.data);
            } catch (error) {
                localStorage.removeItem("token");
                onLogout();
            }
        };

        getUser();
    }, [onLogout]);

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
        }, 3000);
    };

    const handleDashboard = () => {
        setShowProjects(false);
        setShowTeams(false);
        setShowHackathons(false);
    };

    const handleMyProjects = async () => {
        setShowTeams(false);
        setShowHackathons(false);

        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await api.get("/projects/my", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setProjects(response.data);
            setShowProjects(true);
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    "Failed to fetch projects",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (projectId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(`/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSelectedProject(response.data);
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    "Failed to fetch project details",
                "error"
            );
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setEditName(project.name);
        setEditDescription(project.description);
        setEditCategory(project.category);
        setSelectedProject(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await api.patch(
                `/projects/${editingProject._id}`,
                {
                    name: editName,
                    description: editDescription,
                    category: editCategory
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProjects((previousProjects) =>
                previousProjects.map((project) =>
                    project._id === editingProject._id
                        ? response.data
                        : project
                )
            );

            setEditingProject(null);
            showMessage("Project updated successfully!");
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    "Failed to update project",
                "error"
            );
        }
    };

    const handleDelete = async (projectId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this project?"
        );

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await api.delete(`/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setProjects((previousProjects) =>
                previousProjects.filter(
                    (project) => project._id !== projectId
                )
            );

            if (selectedProject?._id === projectId) {
                setSelectedProject(null);
            }

            showMessage("Project deleted successfully!");
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    "Failed to delete project",
                "error"
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        onLogout();
    };

    const handleHackathons = () => {
        setShowHackathons(true);
        setShowProjects(false);
        setShowTeams(false);
        setSearch("");
        setHackathonSearch("");
        setHackathonCategory("");
    };

    const getHackathonRecommendations = async () => {
        try {
            setRecommendationLoading(true);

            const response = await api.post("/hackathons/recommend", {
                techStack: [
                    "React",
                    "Node.js",
                    "MongoDB",
                    "JavaScript",
                    "AI"
                ]
            });

            setRecommendedHackathons(
                response.data.recommendations || []
            );
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    "Failed to get AI recommendations",
                "error"
            );
        } finally {
            setRecommendationLoading(false);
        }
    };

    const getStatus = (project) => {
        return project.status || "Planning";
    };

    const getRating = (project) => {
        return typeof project.rating === "number"
            ? project.rating
            : null;
    };

    const getProgress = (project) => {
        const status = getStatus(project);

        if (status === "Planning") return 25;
        if (status === "Building") return 50;
        if (status === "Testing") return 75;
        if (status === "Submitted") return 100;

        return 25;
    };

    const getTechStack = (project) => {
        if (Array.isArray(project.techStack)) {
            return project.techStack;
        }

        return [];
    };

    const filteredProjects = useMemo(() => {
        let result = [...projects];

        result = result.filter((project) => {
            const matchesSearch = (project.name || "")
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesCategory =
                categoryFilter === "" ||
                project.category?.toLowerCase() ===
                    categoryFilter.toLowerCase();

            const matchesStatus =
                statusFilter === "" ||
                getStatus(project).toLowerCase() ===
                    statusFilter.toLowerCase();

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });

        if (sortBy === "rating") {
            result.sort(
                (a, b) =>
                    (getRating(b) || 0) -
                    (getRating(a) || 0)
            );
        }

        if (sortBy === "progress") {
            result.sort(
                (a, b) => getProgress(b) - getProgress(a)
            );
        }

        if (sortBy === "name") {
            result.sort((a, b) =>
                (a.name || "").localeCompare(b.name || "")
            );
        }

        if (sortBy === "newest") {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            );
        }

        return result;
    }, [
        projects,
        search,
        categoryFilter,
        statusFilter,
        sortBy
    ]);

    const filteredHackathons = useMemo(() => {
        return hackathonsData.filter((hackathon) => {
            const query = hackathonSearch.toLowerCase();

            const matchesSearch =
                hackathon.name.toLowerCase().includes(query) ||
                hackathon.description.toLowerCase().includes(query) ||
                hackathon.category.toLowerCase().includes(query) ||
                hackathon.organizer.toLowerCase().includes(query);

            const matchesCategory =
                hackathonCategory === "" ||
                hackathon.category === hackathonCategory;

            return matchesSearch && matchesCategory;
        });
    }, [hackathonSearch, hackathonCategory]);

    const totalProjects = projects.length;

    const submittedProjects = projects.filter(
        (project) => getStatus(project) === "Submitted"
    ).length;

    const buildingProjects = projects.filter(
        (project) => getStatus(project) === "Building"
    ).length;

    const ratedProjects = projects.filter(
        (project) => getRating(project) !== null
    );

    const averageRating =
        ratedProjects.length > 0
            ? (
                  ratedProjects.reduce(
                      (sum, project) => sum + getRating(project),
                      0
                  ) / ratedProjects.length
              ).toFixed(1)
            : "—";

    if (showTeams) {
        return (
            <Team
                onBack={() => setShowTeams(false)}
            />
        );
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-logo">H</div>

                    <div>
                        <h2>HackHub</h2>
                        <span>Build. Collaborate. Win.</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${
                            !showProjects && !showHackathons
                                ? "active"
                                : ""
                        }`}
                        onClick={handleDashboard}
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className={`nav-item ${
                            showProjects ? "active" : ""
                        }`}
                        onClick={handleMyProjects}
                    >
                        <span>◈</span>
                        My Projects
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => {
                            setShowProjects(false);
                            setShowHackathons(false);
                            setShowTeams(false);
                            onCreateProject();
                        }}
                    >
                        <span>＋</span>
                        Create Project
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => {
                            setShowProjects(false);
                            setShowHackathons(false);
                            setShowTeams(true);
                        }}
                    >
                        <span>👥</span>
                        Teams
                    </button>

                    <button
                        className={`nav-item ${
                            showHackathons ? "active" : ""
                        }`}
                        onClick={handleHackathons}
                    >
                        <span>🏆</span>
                        Hackathons
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <div className="user-mini">
                        <div className="avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                            <strong>{user?.name || "User"}</strong>
                            <span>{user?.email || ""}</span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="eyebrow">WORKSPACE</p>

                        <h1>
                            Welcome back,{" "}
                            {user?.name?.split(" ")[0] || "Builder"} 👋
                        </h1>

                        <p className="subtitle">
                            Manage your hackathon projects and track progress.
                        </p>
                    </div>

                    <button
                        className="primary-button"
                        onClick={() => {
                            setShowProjects(false);
                            setShowHackathons(false);
                            onCreateProject();
                        }}
                    >
                        + New Project
                    </button>
                </header>

                {message && (
                    <div
                        className={`toast ${
                            messageType === "error"
                                ? "toast-error"
                                : "toast-success"
                        }`}
                    >
                        <span>
                            {messageType === "error" ? "!" : "✓"}
                        </span>
                        {message}
                    </div>
                )}

                {!showHackathons && (
                    <section className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple">◈</div>
                            <div>
                                <span>Total Projects</span>
                                <strong>{totalProjects}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">◉</div>
                            <div>
                                <span>Currently Building</span>
                                <strong>{buildingProjects}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">✓</div>
                            <div>
                                <span>Submitted</span>
                                <strong>{submittedProjects}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">★</div>
                            <div>
                                <span>Average Rating</span>
                                <strong>{averageRating}</strong>
                            </div>
                        </div>
                    </section>
                )}

                {!showProjects && !showHackathons && (
                    <section className="welcome-panel">
                        <div className="welcome-content">
                            <span className="welcome-badge">
                                🚀 HACKATHON WORKSPACE
                            </span>

                            <h2>
                                Turn ideas into{" "}
                                <span>winning projects.</span>
                            </h2>

                            <p>
                                Create projects, track development,
                                collaborate with teammates and prepare
                                your next hackathon submission.
                            </p>

                            <div className="welcome-actions">
                                <button
                                    className="primary-button"
                                    onClick={onCreateProject}
                                >
                                    Create your first project
                                </button>

                                <button
                                    className="secondary-button"
                                    onClick={handleMyProjects}
                                >
                                    Explore projects
                                </button>
                            </div>
                        </div>

                        <div className="welcome-visual">
                            <div className="visual-circle">⚡</div>

                            <div className="floating-card card-one">
                                <span>Projects</span>
                                <strong>{totalProjects}</strong>
                            </div>

                            <div className="floating-card card-two">
                                <span>Progress</span>
                                <strong>75%</strong>
                            </div>
                        </div>
                    </section>
                )}

                {showHackathons && (
                    <section className="projects-section hackathons-section">
                        <div className="section-header">
                            <div>
                                <p className="eyebrow">DISCOVER & COMPETE</p>
                                <h2>🏆 Explore Hackathons</h2>
                                <p>
                                    Discover opportunities and get AI-powered
                                    recommendations based on your tech stack.
                                </p>
                            </div>

                            <button
                                className="primary-button"
                                onClick={getHackathonRecommendations}
                                disabled={recommendationLoading}
                            >
                                {recommendationLoading
                                    ? "Finding Matches..."
                                    : "✨ Get AI Recommendations"}
                            </button>
                        </div>

                        {recommendedHackathons.length > 0 && (
                            <div>
                                <div className="section-header">
                                    <div>
                                        <p className="eyebrow">RAG POWERED</p>
                                        <h2>✨ Recommended For You</h2>
                                        <p>
                                            Ranked using semantic similarity with
                                            your tech stack.
                                        </p>
                                    </div>
                                </div>

                                <div className="hackathon-grid">
                                    {recommendedHackathons.map((hackathon) => (
                                        <article
                                            className="project-card hackathon-card"
                                            key={hackathon._id}
                                        >
                                            <div className="hackathon-card-top">
                                                <span className="category-badge">
                                                    AI Match
                                                </span>

                                                <span className="hackathon-mode">
                                                    {Math.round(
                                                        (hackathon.score || 0) * 100
                                                    )}
                                                    % Match
                                                </span>
                                            </div>

                                            <div className="hackathon-icon">🤖</div>

                                            <h3>{hackathon.name}</h3>

                                            <p className="project-description">
                                                {hackathon.description}
                                            </p>

                                            {Array.isArray(hackathon.techStack) &&
                                                hackathon.techStack.length > 0 && (
                                                    <div className="tech-stack">
                                                        {hackathon.techStack.map(
                                                            (tech, index) => (
                                                                <span key={index}>
                                                                    {tech}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                            <div className="hackathon-prize">
                                                <span>🏆</span>
                                                <div>
                                                    <small>Platform</small>
                                                    <strong>
                                                        {hackathon.platform ||
                                                            "Hackathon"}
                                                    </strong>
                                                </div>
                                            </div>

                                            <a
                                                className="primary-button hackathon-register"
                                                href={hackathon.officialUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Explore & Register ↗
                                            </a>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="filter-bar">
                            <div className="search-box">
                                <span>⌕</span>
                                <input
                                    type="text"
                                    placeholder="Search hackathons, domains..."
                                    value={hackathonSearch}
                                    onChange={(e) =>
                                        setHackathonSearch(e.target.value)
                                    }
                                />
                            </div>

                            <select
                                value={hackathonCategory}
                                onChange={(e) =>
                                    setHackathonCategory(e.target.value)
                                }
                            >
                                <option value="">All Domains</option>
                                <option value="AI / ML">AI / ML</option>
                                <option value="Web Development">
                                    Web Development
                                </option>
                                <option value="Innovation">Innovation</option>
                            </select>
                        </div>

                        <p className="hackathon-results">
                            {filteredHackathons.length} hackathons found
                        </p>

                        {filteredHackathons.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">⌕</div>
                                <h3>No hackathons found</h3>
                                <p>
                                    Try another search or select a different domain.
                                </p>

                                <button
                                    className="secondary-button"
                                    onClick={() => {
                                        setHackathonSearch("");
                                        setHackathonCategory("");
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="hackathon-grid">
                                {filteredHackathons.map((hackathon) => (
                                    <article
                                        className="project-card hackathon-card"
                                        key={hackathon.id}
                                    >
                                        <div className="hackathon-card-top">
                                            <span className="category-badge">
                                                {hackathon.category}
                                            </span>

                                            <span className="hackathon-mode">
                                                🌐 {hackathon.mode}
                                            </span>
                                        </div>

                                        <div className="hackathon-icon">🏆</div>

                                        <h3>{hackathon.name}</h3>

                                        <p className="hackathon-organizer">
                                            By {hackathon.organizer}
                                        </p>

                                        <p className="project-description">
                                            {hackathon.description}
                                        </p>

                                        <div className="hackathon-prize">
                                            <span>🏅</span>
                                            <div>
                                                <small>Prize information</small>
                                                <strong>{hackathon.prize}</strong>
                                            </div>
                                        </div>

                                        <a
                                            className="primary-button hackathon-register"
                                            href={hackathon.registrationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Explore & Register ↗
                                        </a>

                                        <p className="hackathon-note">
                                            Demo listing. Verify event details
                                            on the official event page.
                                        </p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {showProjects && (
                    <section className="projects-section">
                        <div className="section-header">
                            <div>
                                <p className="eyebrow">YOUR WORKSPACE</p>
                                <h2>My Projects</h2>
                                <p>
                                    {filteredProjects.length} projects
                                    matching your filters
                                </p>
                            </div>

                            <button
                                className="secondary-button"
                                onClick={onCreateProject}
                            >
                                + Create Project
                            </button>
                        </div>

                        <div className="filter-bar">
                            <div className="search-box">
                                <span>⌕</span>

                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                            >
                                <option value="">All Categories</option>
                                <option value="AI">AI</option>
                                <option value="Web">Web</option>
                                <option value="ML">ML</option>
                                <option value="App">App</option>
                                <option value="Other">Other</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >
                                <option value="">All Status</option>
                                <option value="Planning">Planning</option>
                                <option value="Building">Building</option>
                                <option value="Testing">Testing</option>
                                <option value="Submitted">Submitted</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(e.target.value)
                                }
                            >
                                <option value="newest">Newest</option>
                                <option value="rating">Highest Rated</option>
                                <option value="progress">Progress</option>
                                <option value="name">Name</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="project-list">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        className="skeleton-card"
                                        key={item}
                                    >
                                        <div className="skeleton skeleton-small"></div>
                                        <div className="skeleton skeleton-title"></div>
                                        <div className="skeleton skeleton-text"></div>
                                        <div className="skeleton skeleton-text"></div>
                                    </div>
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">◈</div>
                                <h3>No projects yet</h3>
                                <p>
                                    Start building your first hackathon project.
                                </p>

                                <button
                                    className="primary-button"
                                    onClick={onCreateProject}
                                >
                                    Create Project
                                </button>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">⌕</div>
                                <h3>No projects found</h3>
                                <p>
                                    Try changing your search or filters.
                                </p>

                                <button
                                    className="secondary-button"
                                    onClick={() => {
                                        setSearch("");
                                        setCategoryFilter("");
                                        setStatusFilter("");
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="project-list">
                                {filteredProjects.map((project) => {
                                    const status = getStatus(project);
                                    const rating = getRating(project);
                                    const progress = getProgress(project);
                                    const techStack = getTechStack(project);

                                    return (
                                        <div
                                            className="project-card"
                                            key={project._id}
                                        >
                                            <div className="project-card-top">
                                                <span className="category-badge">
                                                    {project.category}
                                                </span>

                                                <span
                                                    className={`status-badge status-${status.toLowerCase()}`}
                                                >
                                                    <span></span>
                                                    {status}
                                                </span>
                                            </div>

                                            <h3>{project.name}</h3>

                                            <p className="project-description">
                                                {project.description}
                                            </p>

                                            {techStack.length > 0 && (
                                                <div className="tech-stack">
                                                    {techStack.map((tech, index) => (
                                                        <span key={index}>
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="progress-area">
                                                <div className="progress-header">
                                                    <span>Progress</span>
                                                    <strong>{progress}%</strong>
                                                </div>

                                                <div className="progress-bar">
                                                    <div
                                                        style={{
                                                            width: `${progress}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="project-footer">
                                                <div className="rating">
                                                    {rating !== null ? (
                                                        <>
                                                            <span className="star">
                                                                ★
                                                            </span>
                                                            <strong>
                                                                {rating.toFixed(1)}
                                                            </strong>
                                                            <span>/ 5</span>
                                                        </>
                                                    ) : (
                                                        <span className="not-rated">
                                                            Not rated
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="project-actions">
                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                project._id
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="edit-button"
                                                        onClick={() =>
                                                            handleEdit(project)
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                project._id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {editingProject && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <div>
                                    <p className="eyebrow">
                                        PROJECT SETTINGS
                                    </p>
                                    <h2>Edit Project</h2>
                                </div>

                                <button
                                    className="modal-close"
                                    onClick={() => setEditingProject(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleUpdate}>
                                <label>Project Name</label>

                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    required
                                />

                                <label>Description</label>

                                <textarea
                                    value={editDescription}
                                    onChange={(e) =>
                                        setEditDescription(e.target.value)
                                    }
                                    required
                                />

                                <label>Category</label>

                                <input
                                    type="text"
                                    value={editCategory}
                                    onChange={(e) =>
                                        setEditCategory(e.target.value)
                                    }
                                    required
                                />

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() =>
                                            setEditingProject(null)
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="primary-button"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {selectedProject && (
                    <div className="modal-overlay">
                        <div className="modal details-modal">
                            <div className="modal-header">
                                <div>
                                    <span className="category-badge">
                                        {selectedProject.category}
                                    </span>

                                    <h2>{selectedProject.name}</h2>
                                </div>

                                <button
                                    className="modal-close"
                                    onClick={() => setSelectedProject(null)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="details-grid">
                                <div className="detail-box">
                                    <span>Status</span>
                                    <strong>
                                        {getStatus(selectedProject)}
                                    </strong>
                                </div>

                                <div className="detail-box">
                                    <span>Progress</span>
                                    <strong>
                                        {getProgress(selectedProject)}%
                                    </strong>
                                </div>

                                <div className="detail-box">
                                    <span>Rating</span>
                                    <strong>
                                        {getRating(selectedProject) !== null
                                            ? `${getRating(selectedProject).toFixed(1)} / 5`
                                            : "Not rated"}
                                    </strong>
                                </div>

                                <div className="detail-box">
                                    <span>Project ID</span>
                                    <strong className="id-text">
                                        {selectedProject._id}
                                    </strong>
                                </div>
                            </div>

                            <div className="details-description">
                                <h4>Description</h4>
                                <p>{selectedProject.description}</p>
                            </div>

                            <div className="detail-progress">
                                <div className="progress-header">
                                    <span>Project Progress</span>
                                    <strong>
                                        {getProgress(selectedProject)}%
                                    </strong>
                                </div>

                                <div className="progress-bar large">
                                    <div
                                        style={{
                                            width: `${getProgress(selectedProject)}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
export default Dashboard;