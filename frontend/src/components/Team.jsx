import { useCallback, useEffect, useMemo, useState } from "react";
import api, { errorMessage } from "../services/api";
import { useToast } from "./Toast";
import { EmptyState, Loading, Modal, PageHeader } from "./Ui";
import { initial } from "../utils";

const getId = (v) => (!v ? "" : typeof v === "string" ? v : v._id || v.id || "");
const personName = (p) => (p && typeof p === "object" ? p.name || p.email || "Member" : "Member");

function Team({ user }) {
    const { notify } = useToast();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("all");
    const [busyId, setBusyId] = useState("");
    const [selectedId, setSelectedId] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get("/teams");
            setTeams(Array.isArray(data) ? data : []);
            setError("");
        } catch (err) {
            setError(errorMessage(err, "Failed to load teams"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(); // eslint-disable-line react-hooks/set-state-in-effect
    }, [load]);

    const isOwner = (t) => getId(t.owner) === user.id;
    const isMember = (t) => (t.members || []).some((m) => getId(m) === user.id);

    const myTeams = useMemo(() => teams.filter((t) => isOwner(t) || isMember(t)), [teams, user]); // eslint-disable-line react-hooks/exhaustive-deps
    const shown = tab === "my" ? myTeams : teams;
    const selected = teams.find((t) => t._id === selectedId) || null;

    const create = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post("/teams", { name: name.trim(), description: description.trim() });
            setName("");
            setDescription("");
            setTab("my");
            notify("Team created");
            await load();
        } catch (err) {
            notify(errorMessage(err, "Could not create team"), "error");
        } finally {
            setCreating(false);
        }
    };

    const act = async (team, action) => {
        if (action === "leave" && !window.confirm(`Leave "${team.name}"?`)) return;
        setBusyId(team._id);
        try {
            await api.post(`/teams/${team._id}/${action}`);
            notify(action === "join" ? "You joined the team" : "You left the team");
            await load();
        } catch (err) {
            notify(errorMessage(err, `Could not ${action} the team`), "error");
        } finally {
            setBusyId("");
        }
    };

    return (
        <section>
            <PageHeader eyebrow="Fellowships" title="Teams" subtitle="Find teammates, build together, and turn ideas into projects." />

            <form className="panel form" onSubmit={create}>
                <h2>＋ Create a team</h2>
                <div className="form-row">
                    <label>Team name
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Code Warriors"
                            minLength={3} maxLength={60} required />
                    </label>
                    <label>Description
                        <input value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="What will your team work on?" maxLength={500} />
                    </label>
                </div>
                <div className="form-actions">
                    <button className="btn btn-gold" disabled={creating}>{creating ? "Creating…" : "Create team"}</button>
                </div>
            </form>

            <div className="section-title">
                <h2>Explore teams</h2>
                <div className="tabs">
                    <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All ({teams.length})</button>
                    <button className={tab === "my" ? "active" : ""} onClick={() => setTab("my")}>My teams ({myTeams.length})</button>
                </div>
            </div>

            {loading ? (
                <Loading text="Gathering the fellowships…" />
            ) : error ? (
                <EmptyState icon="⚠" title="Could not load teams" text={error}
                    action={<button className="btn btn-ghost" onClick={load}>Try again</button>} />
            ) : shown.length === 0 ? (
                <EmptyState icon="🛡️"
                    title={tab === "my" ? "You haven't joined any teams yet" : "No teams yet"}
                    text={tab === "my" ? "Browse all teams and join one, or create your own." : "Be the first to create a team."}
                    action={tab === "my" && <button className="btn btn-ghost" onClick={() => setTab("all")}>Browse all teams</button>} />
            ) : (
                <div className="grid">
                    {shown.map((t) => (
                        <article className="card team-card" key={t._id}>
                            <div className="card-top">
                                <div className="avatar avatar-lg">{initial(t.name)}</div>
                                <span className="tag">{(t.members || []).length} members</span>
                            </div>
                            <h3>{t.name}</h3>
                            <p className="clamp">{t.description || "No description provided yet."}</p>
                            <div className="card-meta"><span>Owner</span><b>{personName(t.owner)}</b></div>
                            <div className="card-actions">
                                <button className="btn btn-ghost" onClick={() => setSelectedId(t._id)}>Details</button>
                                {isOwner(t) ? (
                                    <button className="btn btn-ghost" disabled>You own this</button>
                                ) : isMember(t) ? (
                                    <button className="btn btn-danger" disabled={busyId === t._id} onClick={() => act(t, "leave")}>
                                        {busyId === t._id ? "Please wait…" : "Leave"}
                                    </button>
                                ) : (
                                    <button className="btn btn-gold" disabled={busyId === t._id} onClick={() => act(t, "join")}>
                                        {busyId === t._id ? "Joining…" : "Join"}
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {selected && (
                <Modal title={selected.name} onClose={() => setSelectedId("")}>
                    <p className="detail-text">{selected.description || "No description provided yet."}</p>
                    <div className="detail-grid">
                        <div><small>Owner</small><b>{personName(selected.owner)}</b></div>
                        <div><small>Members</small><b>{(selected.members || []).length}</b></div>
                        <div><small>Your role</small><b>{isOwner(selected) ? "Owner" : isMember(selected) ? "Member" : "Not a member"}</b></div>
                    </div>
                    <h4 className="sub">Members</h4>
                    <ul className="list">
                        {(selected.members || []).map((m, i) => (
                            <li key={getId(m) || i}>
                                <div className="member">
                                    <div className="avatar">{initial(personName(m))}</div>
                                    <div>
                                        <b>{personName(m)}{getId(m) === user.id ? " (You)" : ""}</b>
                                        <small>{getId(m) === getId(selected.owner) ? "Team owner" : "Member"}{m?.email ? ` · ${m.email}` : ""}</small>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}
        </section>
    );
}

export default Team;
