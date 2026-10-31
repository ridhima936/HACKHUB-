import { useCallback, useEffect, useMemo, useState } from "react";
import api, { errorMessage } from "../services/api";
import { useToast } from "./Toast";
import { EmptyState, Loading, Modal, PageHeader } from "./Ui";
import { formatDate } from "../utils";

const STATUSES = ["Planning", "In Progress", "Completed"];

const statusClass = (s) => `status status-${(s || "Planning").toLowerCase().replace(/\s+/g, "-")}`;

function Projects({ mode, user, onCreate }) {
    const { notify } = useToast();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get(mode === "mine" ? "/projects/my" : "/projects");
            setProjects(data);
            setError("");
        } catch (err) {
            setError(errorMessage(err, "Failed to load projects"));
        } finally {
            setLoading(false);
        }
    }, [mode]);

    useEffect(() => {
        load(); // eslint-disable-line react-hooks/set-state-in-effect
    }, [load]);

    const isOwner = (p) => (p.owner?._id || p.owner) === user.id;

    const categories = useMemo(
        () => [...new Set(projects.map((p) => p.category).filter(Boolean))].sort(),
        [projects]
    );

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = projects.filter(
            (p) =>
                (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
                (!category || p.category === category) &&
                (!status || p.status === status)
        );
        list = [...list].sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return list;
    }, [projects, search, category, status, sortBy]);

    const handleDelete = async (project) => {
        if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/projects/${project._id}`);
            setProjects((list) => list.filter((p) => p._id !== project._id));
            setSelected(null);
            notify("Project deleted");
        } catch (err) {
            notify(errorMessage(err, "Could not delete project"), "error");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.patch(`/projects/${editing._id}`, {
                name: editing.name,
                description: editing.description,
                category: editing.category,
                status: editing.status,
                techStack: editing.techStackText
            });
            setProjects((list) => list.map((p) => (p._id === data._id ? data : p)));
            setEditing(null);
            notify("Project updated");
        } catch (err) {
            notify(errorMessage(err, "Could not update project"), "error");
        } finally {
            setSaving(false);
        }
    };

    const isMine = mode === "mine";

    return (
        <section>
            <PageHeader
                eyebrow={isMine ? "Your creations" : "The Library"}
                title={isMine ? "My Projects" : "Project Library"}
                subtitle={isMine ? "Everything you have built, in one place." : "Discover what fellow students are building."}
                actions={<button className="btn btn-gold" onClick={onCreate}>＋ Create Project</button>}
            />

            <div className="toolbar">
                <input type="search" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
                    <option value="">All statuses</option>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A–Z</option>
                </select>
            </div>

            {loading ? (
                <Loading text="Fetching scrolls from the library…" />
            ) : error ? (
                <EmptyState icon="⚠" title="The library is unreachable" text={error}
                    action={<button className="btn btn-ghost" onClick={load}>Try again</button>} />
            ) : visible.length === 0 ? (
                <EmptyState
                    icon="📜"
                    title={projects.length === 0 ? (isMine ? "No projects yet" : "The library is empty") : "No projects match your search"}
                    text={projects.length === 0 ? "Every great quest begins with a first step. Create your first project." : "Try different keywords or clear the filters."}
                    action={projects.length === 0 && <button className="btn btn-gold" onClick={onCreate}>Create a project</button>}
                />
            ) : (
                <div className="grid">
                    {visible.map((p) => (
                        <article className="card parchment" key={p._id}>
                            <div className="card-top">
                                <span className="tag tag-ink">{p.category}</span>
                                <span className={statusClass(p.status)}>{p.status}</span>
                            </div>
                            <h3>{p.name}</h3>
                            <p className="clamp">{p.description}</p>
                            {p.techStack?.length > 0 && (
                                <div className="chips">
                                    {p.techStack.slice(0, 5).map((t) => <span key={t} className="chip chip-ink">{t}</span>)}
                                </div>
                            )}
                            <div className="card-meta">
                                <span>By {isOwner(p) ? "you" : p.owner?.name || "Unknown"}</span>
                                <span>{formatDate(p.createdAt)}</span>
                            </div>
                            <div className="card-actions">
                                <button className="btn btn-ink" onClick={() => setSelected(p)}>View</button>
                                {isOwner(p) && (
                                    <>
                                        <button className="btn btn-ink-ghost"
                                            onClick={() => setEditing({ ...p, techStackText: (p.techStack || []).join(", ") })}>Edit</button>
                                        <button className="btn btn-danger-ink" onClick={() => handleDelete(p)}>Delete</button>
                                    </>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {selected && (
                <Modal title={selected.name} onClose={() => setSelected(null)}>
                    <div className="detail-row">
                        <span className="tag">{selected.category}</span>
                        <span className={statusClass(selected.status)}>{selected.status}</span>
                    </div>
                    <p className="detail-text">{selected.description}</p>
                    {selected.techStack?.length > 0 && (
                        <div className="chips">
                            {selected.techStack.map((t) => <span key={t} className="chip">{t}</span>)}
                        </div>
                    )}
                    <div className="detail-grid">
                        <div><small>Owner</small><b>{isOwner(selected) ? "You" : selected.owner?.name || "Unknown"}</b></div>
                        <div><small>Created</small><b>{formatDate(selected.createdAt)}</b></div>
                        <div><small>Updated</small><b>{formatDate(selected.updatedAt)}</b></div>
                    </div>
                </Modal>
            )}

            {editing && (
                <Modal title="Edit project" onClose={() => setEditing(null)}>
                    <form className="form" onSubmit={handleSave}>
                        <label>Name
                            <input value={editing.name} minLength={3} required
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                        </label>
                        <label>Description
                            <textarea value={editing.description} minLength={10} required rows={4}
                                onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                        </label>
                        <div className="form-row">
                            <label>Category
                                <input value={editing.category} required
                                    onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                            </label>
                            <label>Status
                                <select value={editing.status}
                                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </label>
                        </div>
                        <label>Tech stack <small>(comma separated)</small>
                            <input value={editing.techStackText}
                                onChange={(e) => setEditing({ ...editing, techStackText: e.target.value })} />
                        </label>
                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="btn btn-gold" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </section>
    );
}

export default Projects;
