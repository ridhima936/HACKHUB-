import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Team({ onBack }) {
    const [teams, setTeams] = useState([]);
    const [user, setUser] = useState(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [activeAction, setActiveAction] = useState("");

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const [activeTab, setActiveTab] = useState("all");
    const [selectedTeam, setSelectedTeam] = useState(null);

    const getToken = () => localStorage.getItem("token");

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    const getId = (value) => {
        if (!value) return "";
        return typeof value === "string" ? value : value._id || value.id || "";
    };

    const getMemberName = (member) => {
        if (!member) return "Unknown User";

        if (typeof member === "string") {
            return "Team Member";
        }

        return (
            member.name ||
            member.username ||
            member.fullName ||
            member.email ||
            "Team Member"
        );
    };

    const getOwnerName = (team) => {
        if (!team?.owner) return "Unknown";

        if (typeof team.owner === "object") {
            return getMemberName(team.owner);
        }

        return team.ownerName || "Team Owner";
    };

    const isOwner = (team) => {
        return getId(team?.owner) === getId(user);
    };

    const isMember = (team) => {
        const userId = getId(user);

        if (!userId || !Array.isArray(team?.members)) {
            return false;
        }

        return team.members.some((member) => getId(member) === userId);
    };

    const myTeams = useMemo(() => {
        return teams.filter((team) => isOwner(team) || isMember(team));
    }, [teams, user]);

    const displayedTeams = useMemo(() => {
        return activeTab === "my" ? myTeams : teams;
    }, [activeTab, teams, myTeams]);

    const fetchTeams = async () => {
        try {
            setLoading(true);

            const response = await api.get("/teams");
            const data = response.data;

            let teamData = [];

            if (Array.isArray(data)) {
                teamData = data;
            } else if (Array.isArray(data?.teams)) {
                teamData = data.teams;
            } else if (Array.isArray(data?.data)) {
                teamData = data.data;
            }

            setTeams(teamData);

            setSelectedTeam((currentTeam) => {
                if (!currentTeam) return null;

                return (
                    teamData.find(
                        (team) => team._id === currentTeam._id
                    ) || null
                );
            });
        } catch (error) {
            console.error("Error fetching teams:", error);

            showMessage(
                error.response?.data?.message ||
                    "Failed to load teams. Please try again.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await api.get("/auth/me", getHeaders());
            const data = response.data;

            setUser(data.user || data);
        } catch (error) {
            console.log(
                "Could not fetch current user:",
                error.response?.data || error.message
            );

            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    setUser(null);
                }
            }
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchUser();
    }, []);

    const handleCreateTeam = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            showMessage("Please enter a team name.", "error");
            return;
        }

        try {
            setCreating(true);

            await api.post(
                "/teams",
                {
                    name: name.trim(),
                    description: description.trim()
                },
                getHeaders()
            );

            setName("");
            setDescription("");

            showMessage("Team created successfully!");

            await fetchTeams();
            setActiveTab("all");
        } catch (error) {
            console.error("Create team error:", error);

            showMessage(
                error.response?.data?.message ||
                    "Could not create team. Please try again.",
                "error"
            );
        } finally {
            setCreating(false);
        }
    };

    const handleJoinTeam = async (teamId) => {
        try {
            setActiveAction(teamId);

            await api.post(
                `/teams/${teamId}/join`,
                {},
                getHeaders()
            );

            showMessage("You joined the team successfully!");

            await fetchTeams();
        } catch (error) {
            console.error("Join team error:", error);

            showMessage(
                error.response?.data?.message ||
                    "Could not join the team.",
                "error"
            );
        } finally {
            setActiveAction("");
        }
    };

    const handleLeaveTeam = async (teamId) => {
        const confirmed = window.confirm(
            "Are you sure you want to leave this team?"
        );

        if (!confirmed) return;

        try {
            setActiveAction(teamId);

            await api.post(
                `/teams/${teamId}/leave`,
                {},
                getHeaders()
            );

            showMessage("You left the team successfully!");

            setSelectedTeam((currentTeam) =>
                currentTeam?._id === teamId ? null : currentTeam
            );

            await fetchTeams();
        } catch (error) {
            console.error("Leave team error:", error);

            showMessage(
                error.response?.data?.message ||
                    "Could not leave the team.",
                "error"
            );
        } finally {
            setActiveAction("");
        }
    };

    return (
        <div className="teams-page">
            <style>{`
                .teams-page {
                    max-width: 1150px;
                    margin: 0 auto;
                    padding: 28px;
                    color: #20213a;
                    font-family: inherit;
                }

                .teams-page * {
                    box-sizing: border-box;
                }

                .teams-header {
                    margin-bottom: 28px;
                }

                .teams-header h1 {
                    margin: 18px 0 8px;
                    font-size: clamp(27px, 4vw, 36px);
                }

                .teams-header p {
                    color: #73758a;
                    line-height: 1.6;
                    margin: 0;
                }

                .teams-back,
                .teams-button {
                    border: none;
                    border-radius: 10px;
                    padding: 12px 18px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s ease;
                }

                .teams-back {
                    background: #f0efff;
                    color: #5948d8;
                }

                .teams-button {
                    background: #6554e8;
                    color: white;
                }

                .teams-back:hover,
                .teams-button:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }

                .teams-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .teams-panel {
                    background: white;
                    border: 1px solid #e9e8f3;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 28px;
                    box-shadow: 0 5px 22px rgba(40, 35, 90, 0.04);
                }

                .teams-panel h2 {
                    margin: 0 0 20px;
                    font-size: 21px;
                }

                .teams-form {
                    display: grid;
                    gap: 16px;
                }

                .teams-form label {
                    display: grid;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .teams-form input,
                .teams-form textarea {
                    width: 100%;
                    border: 1px solid #deddea;
                    border-radius: 9px;
                    padding: 12px 14px;
                    font: inherit;
                    font-size: 14px;
                    outline: none;
                }

                .teams-form input:focus,
                .teams-form textarea:focus {
                    border-color: #6554e8;
                }

                .teams-form textarea {
                    min-height: 95px;
                    resize: vertical;
                }

                .teams-form button {
                    justify-self: start;
                }

                .teams-message {
                    padding: 13px 16px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-size: 14px;
                }

                .teams-message.success {
                    background: #e8f8ef;
                    color: #167544;
                }

                .teams-message.error {
                    background: #fff0f0;
                    color: #bb3030;
                }

                .teams-list-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .teams-list-header h2 {
                    margin: 0;
                    font-size: 23px;
                }

                .teams-count {
                    background: #f0efff;
                    color: #5948d8;
                    border-radius: 20px;
                    padding: 7px 12px;
                    font-size: 13px;
                    font-weight: 600;
                }

                .teams-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .teams-tab {
                    padding: 12px 20px;
                    border: 1px solid #e4e2f0;
                    border-radius: 10px;
                    background: white;
                    color: #686b80;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: 0.2s ease;
                }

                .teams-tab:hover {
                    border-color: #6554e8;
                }

                .teams-tab.active {
                    color: white;
                    background: #6554e8;
                    border-color: #6554e8;
                }

                .teams-grid {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fit,
                        minmax(min(100%, 275px), 1fr)
                    );
                    gap: 18px;
                }

                .team-card {
                    border: 1px solid #e8e7f2;
                    border-radius: 15px;
                    padding: 20px;
                    background: white;
                    min-width: 0;
                    transition: 0.2s ease;
                }

                .team-card:hover {
                    border-color: #d0caff;
                    box-shadow: 0 8px 25px rgba(40, 35, 90, 0.06);
                }

                .team-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 10px;
                }

                .team-avatar {
                    display: grid;
                    place-items: center;
                    width: 46px;
                    height: 46px;
                    flex-shrink: 0;
                    border-radius: 12px;
                    background: #eeecff;
                    color: #6554e8;
                    font-size: 21px;
                    font-weight: 700;
                }

                .team-members {
                    color: #686b80;
                    background: #f7f7fb;
                    padding: 7px 9px;
                    border-radius: 8px;
                    font-size: 12px;
                }

                .team-card h3 {
                    margin: 18px 0 8px;
                    font-size: 19px;
                    overflow-wrap: anywhere;
                }

                .team-card p {
                    color: #73758a;
                    line-height: 1.6;
                    font-size: 14px;
                    overflow-wrap: anywhere;
                    min-height: 42px;
                }

                .team-owner {
                    display: block;
                    color: #686b80;
                    font-size: 13px;
                    margin: 14px 0;
                }

                .team-card-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 9px;
                    margin-top: 12px;
                }

                .team-card-actions .teams-button {
                    width: 100%;
                    padding: 11px 8px;
                }

                .teams-button.secondary {
                    color: #5948d8;
                    background: #f0efff;
                }

                .teams-button.leave {
                    background: #fff0f0;
                    color: #bb3030;
                }

                .teams-empty {
                    text-align: center;
                    padding: 40px 20px;
                    border: 1px dashed #d9d7e9;
                    border-radius: 14px;
                    color: #73758a;
                    background: white;
                }

                .teams-empty h3 {
                    color: #20213a;
                    margin-bottom: 8px;
                }

                .team-details {
                    margin-top: 24px;
                    border: 1px solid #e4e2f0;
                    border-radius: 16px;
                    padding: 24px;
                    background: white;
                }

                .team-details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .team-details-header h2 {
                    margin: 12px 0 8px;
                    overflow-wrap: anywhere;
                }

                .team-details-description {
                    color: #73758a;
                    line-height: 1.7;
                    overflow-wrap: anywhere;
                }

                .team-details-meta {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fit,
                        minmax(150px, 1fr)
                    );
                    gap: 12px;
                    margin: 22px 0;
                }

                .team-meta-box {
                    background: #f8f8fc;
                    border: 1px solid #ecebf5;
                    padding: 15px;
                    border-radius: 11px;
                    min-width: 0;
                }

                .team-meta-box span {
                    display: block;
                    color: #73758a;
                    font-size: 12px;
                    margin-bottom: 7px;
                }

                .team-meta-box strong {
                    display: block;
                    overflow-wrap: anywhere;
                    font-size: 15px;
                }

                .team-details h3 {
                    margin: 22px 0 14px;
                }

                .team-member-list {
                    display: grid;
                    gap: 10px;
                }

                .team-member {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border: 1px solid #ecebf5;
                    border-radius: 11px;
                    min-width: 0;
                }

                .team-member-avatar {
                    display: grid;
                    place-items: center;
                    width: 38px;
                    height: 38px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    background: #eeecff;
                    color: #5948d8;
                    font-weight: 700;
                }

                .team-member-info {
                    min-width: 0;
                }

                .team-member-info strong,
                .team-member-info span {
                    display: block;
                    overflow-wrap: anywhere;
                }

                .team-member-info span {
                    margin-top: 4px;
                    color: #73758a;
                    font-size: 12px;
                }

                @media (max-width: 600px) {
                    .teams-page {
                        padding: 16px;
                    }

                    .teams-panel,
                    .team-details {
                        padding: 18px;
                    }

                    .team-card-actions {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <header className="teams-header">
                <button
                    className="teams-back"
                    onClick={onBack}
                    type="button"
                >
                    ← Back to Dashboard
                </button>

                <h1>Teams 👥</h1>

                <p>
                    Find teammates, build together, and turn your ideas into projects.
                </p>
            </header>

            {message && (
                <div
                    className={`teams-message ${messageType}`}
                    role="status"
                >
                    {message}
                </div>
            )}

            <section className="teams-panel">
                <h2>＋ Create a Team</h2>

                <form className="teams-form" onSubmit={handleCreateTeam}>
                    <label>
                        Team Name

                        <input
                            type="text"
                            placeholder="e.g. Code Warriors"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            minLength={3}
                            maxLength={60}
                            required
                        />
                    </label>

                    <label>
                        Team Description

                        <textarea
                            placeholder="What will your team work on?"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            maxLength={500}
                        />
                    </label>

                    <button
                        className="teams-button"
                        type="submit"
                        disabled={creating}
                    >
                        {creating ? "Creating..." : "Create Team"}
                    </button>
                </form>
            </section>

            <section>
                <div className="teams-list-header">
                    <h2>Explore Teams</h2>

                    <span className="teams-count">
                        {displayedTeams.length}{" "}
                        {activeTab === "my" ? "My Teams" : "Teams"}
                    </span>
                </div>

                <div className="teams-tabs">
                    <button
                        type="button"
                        className={`teams-tab ${
                            activeTab === "all" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("all")}
                    >
                        All Teams ({teams.length})
                    </button>

                    <button
                        type="button"
                        className={`teams-tab ${
                            activeTab === "my" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("my")}
                    >
                        My Teams ({myTeams.length})
                    </button>
                </div>

                {loading ? (
                    <div className="teams-empty">Loading teams...</div>
                ) : displayedTeams.length === 0 ? (
                    <div className="teams-empty">
                        <h3>
                            {activeTab === "my"
                                ? "You haven't joined any teams yet"
                                : "No teams available yet"}
                        </h3>

                        <p>
                            {activeTab === "my"
                                ? "Browse All Teams and join a team, or create your own."
                                : "Be the first to create a team and start collaborating!"}
                        </p>

                        {activeTab === "my" && (
                            <button
                                type="button"
                                className="teams-button"
                                onClick={() => setActiveTab("all")}
                            >
                                Browse All Teams
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="teams-grid">
                        {displayedTeams.map((team) => (
                            <article
                                className="team-card"
                                key={team._id}
                            >
                                <div className="team-card-top">
                                    <div className="team-avatar">
                                        {team.name?.charAt(0).toUpperCase() || "T"}
                                    </div>

                                    <span className="team-members">
                                        👥 {(team.members || []).length} members
                                    </span>
                                </div>

                                <h3>{team.name}</h3>

                                <p>
                                    {team.description ||
                                        "No description provided yet."}
                                </p>

                                <span className="team-owner">
                                    Owner: {getOwnerName(team)}
                                </span>

                                <div className="team-card-actions">
                                    <button
                                        className="teams-button secondary"
                                        type="button"
                                        onClick={() => setSelectedTeam(team)}
                                    >
                                        View Details
                                    </button>

                                    {isOwner(team) ? (
                                        <button
                                            className="teams-button"
                                            type="button"
                                            disabled
                                        >
                                            You are the Owner
                                        </button>
                                    ) : isMember(team) ? (
                                        <button
                                            className="teams-button leave"
                                            type="button"
                                            disabled={activeAction === team._id}
                                            onClick={() =>
                                                handleLeaveTeam(team._id)
                                            }
                                        >
                                            {activeAction === team._id
                                                ? "Please wait..."
                                                : "Leave Team"}
                                        </button>
                                    ) : (
                                        <button
                                            className="teams-button"
                                            type="button"
                                            disabled={activeAction === team._id}
                                            onClick={() =>
                                                handleJoinTeam(team._id)
                                            }
                                        >
                                            {activeAction === team._id
                                                ? "Joining..."
                                                : "Join Team"}
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {selectedTeam && (
                <section className="team-details">
                    <div className="team-details-header">
                        <div>
                            <span className="teams-count">TEAM DETAILS</span>

                            <h2>{selectedTeam.name}</h2>

                            <p className="team-details-description">
                                {selectedTeam.description ||
                                    "No description provided yet."}
                            </p>
                        </div>

                        <button
                            className="teams-back"
                            type="button"
                            onClick={() => setSelectedTeam(null)}
                        >
                            Close Details ×
                        </button>
                    </div>

                    <div className="team-details-meta">
                        <div className="team-meta-box">
                            <span>Team Owner</span>
                            <strong>{getOwnerName(selectedTeam)}</strong>
                        </div>

                        <div className="team-meta-box">
                            <span>Total Members</span>
                            <strong>
                                {(selectedTeam.members || []).length}
                            </strong>
                        </div>

                        <div className="team-meta-box">
                            <span>Your Status</span>
                            <strong>
                                {isOwner(selectedTeam)
                                    ? "Owner"
                                    : isMember(selectedTeam)
                                      ? "Member"
                                      : "Not a member"}
                            </strong>
                        </div>
                    </div>

                    <h3>Team Members</h3>

                    {(selectedTeam.members || []).length === 0 ? (
                        <div className="teams-empty">
                            No members are listed for this team yet.
                        </div>
                    ) : (
                        <div className="team-member-list">
                            {selectedTeam.members.map((member, index) => {
                                const memberId = getId(member);
                                const ownerId = getId(selectedTeam.owner);

                                return (
                                    <div
                                        className="team-member"
                                        key={memberId || index}
                                    >
                                        <div className="team-member-avatar">
                                            {getMemberName(member)
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="team-member-info">
                                            <strong>
                                                {memberId === getId(user)
                                                    ? `${getMemberName(member)} (You)`
                                                    : getMemberName(member)}
                                            </strong>

                                            <span>
                                                {memberId === ownerId
                                                    ? "Team Owner"
                                                    : "Team Member"}
                                                {member?.email
                                                    ? ` · ${member.email}`
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
export default Team;