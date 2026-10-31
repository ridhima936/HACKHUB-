import { useState } from "react";
import api, { errorMessage } from "../services/api";
import { useToast } from "./Toast";
import { PageHeader } from "./Ui";

const SUGGESTIONS = ["Web Development", "AI / ML", "Mobile App", "Game Development", "Data Science", "DevOps", "Cybersecurity", "Open Source"];

function CreateProject({ onDone }) {
    const { notify } = useToast();
    const [form, setForm] = useState({ name: "", description: "", category: "", status: "Planning", techStack: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            await api.post("/projects", form);
            notify("Your project has been added to the library");
            onDone();
        } catch (err) {
            setError(errorMessage(err, "Failed to create project"));
        } finally {
            setBusy(false);
        }
    };

    return (
        <section>
            <PageHeader eyebrow="Begin something new" title="Create Project" subtitle="Describe your idea. You can edit it any time." />

            <form className="panel form form-narrow" onSubmit={handleCreate}>
                <label>Project name
                    <input value={form.name} onChange={set("name")} placeholder="e.g. Campus Navigator" minLength={3} maxLength={80} required />
                </label>
                <label>Description
                    <textarea value={form.description} onChange={set("description")} rows={5} minLength={10}
                        placeholder="What does it do and who is it for?" required />
                </label>
                <div className="form-row">
                    <label>Category
                        <input list="category-list" value={form.category} onChange={set("category")} placeholder="Choose or type" required />
                        <datalist id="category-list">{SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
                    </label>
                    <label>Status
                        <select value={form.status} onChange={set("status")}>
                            <option>Planning</option><option>In Progress</option><option>Completed</option>
                        </select>
                    </label>
                </div>
                <label>Tech stack <small>(comma separated, optional)</small>
                    <input value={form.techStack} onChange={set("techStack")} placeholder="React, Node.js, MongoDB" />
                </label>

                {error && <div className="form-error" role="alert">{error}</div>}

                <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
                    <button className="btn btn-gold" disabled={busy}>{busy ? "Creating…" : "Create Project"}</button>
                </div>
            </form>
        </section>
    );
}

export default CreateProject;
