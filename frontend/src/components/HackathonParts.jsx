import { useState } from "react";
import api, { errorMessage } from "../services/api";
import { daysLeft, formatDate } from "../utils";

const QUICK_SKILLS = ["React", "Node.js", "MongoDB", "Python", "AI", "Docker", "Linux", "C++", "Flutter", "TypeScript"];

export function HackathonCard({ h, score }) {
    const left = daysLeft(h.deadline);
    const percent = typeof score === "number" ? Math.round(score * 100) : null;

    return (
        <article className="card hack-card">
            <div className="card-top">
                <span className="tag">{h.platform || "Hackathon"}</span>
                {left !== null && (
                    <span className={`deadline ${left < 0 ? "closed" : left <= 14 ? "soon" : ""}`}>
                        {left < 0 ? "Closed" : left === 0 ? "Ends today" : `${left} days left`}
                    </span>
                )}
            </div>

            {percent !== null && (
                <div className="match" aria-label={`Match score ${percent} percent`}>
                    <div className="match-head"><span>Match</span><b>{percent}%</b></div>
                    <div className="meter"><i style={{ width: `${Math.min(100, percent)}%` }} /></div>
                </div>
            )}

            <h3>{h.name}</h3>
            <p className="clamp">{h.description}</p>

            {h.techStack?.length > 0 && (
                <div className="chips">{h.techStack.map((t) => <span className="chip" key={t}>{t}</span>)}</div>
            )}
            {h.skills?.length > 0 && (
                <div className="chips">{h.skills.map((s) => <span className="chip chip-soft" key={s}>{s}</span>)}</div>
            )}

            <div className="card-meta">
                <span>Deadline</span>
                <b>{formatDate(h.deadline)}</b>
            </div>

            <div className="card-actions">
                {h.officialUrl && <a className="btn btn-gold" href={h.officialUrl} target="_blank" rel="noreferrer">Official page</a>}
                {h.githubUrl && <a className="btn btn-ghost" href={h.githubUrl} target="_blank" rel="noreferrer">GitHub</a>}
                {h.vercelUrl && <a className="btn btn-ghost" href={h.vercelUrl} target="_blank" rel="noreferrer">Live demo</a>}
            </div>
        </article>
    );
}

export function Recommender({ compact = false }) {
    const [skills, setSkills] = useState("");
    const [results, setResults] = useState(null);
    const [method, setMethod] = useState("");
    const [model, setModel] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const addSkill = (skill) => {
        const list = skills.split(",").map((s) => s.trim()).filter(Boolean);
        if (!list.some((s) => s.toLowerCase() === skill.toLowerCase())) list.push(skill);
        setSkills(list.join(", "));
    };

    const consult = async (e) => {
        e.preventDefault();
        const techStack = skills.split(",").map((s) => s.trim()).filter(Boolean);
        if (techStack.length === 0) {
            setError("Enter at least one skill or technology.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/hackathons/recommend", { techStack });
            setResults(data.recommendations || []);
            setMethod(data.method || "");
            setModel(data.model || "");
        } catch (err) {
            setResults(null);
            setError(errorMessage(err, "The recommendation chamber is unavailable right now."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chamber">
            <div className="chamber-head">
                <span className="orb" aria-hidden="true" />
                <div>
                    <h2>AI Recommendation Chamber</h2>
                    <p>Tell us your skills. Semantic search over hackathon embeddings finds your best-matching quests.</p>
                </div>
            </div>

            <form className="chamber-form" onSubmit={consult}>
                <input
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, Node.js, MongoDB…"
                    aria-label="Your skills and technologies"
                />
                <button className="btn btn-gold" disabled={loading}>{loading ? "Consulting…" : "Find my hackathons"}</button>
            </form>

            <div className="chips quick">
                {QUICK_SKILLS.map((s) => (
                    <button type="button" key={s} className="chip chip-btn" onClick={() => addSkill(s)}>+ {s}</button>
                ))}
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            {results && (
                results.length === 0 ? (
                    <p className="muted">No matches yet. Make sure hackathon embeddings have been generated (<code>npm run seed</code>).</p>
                ) : (
                    <>
                        <div className="results-head">
                            <b>Top {results.length} matches</b>
                            <small>
                                {method === "atlas-vector-search"
                                    ? "MongoDB Atlas Vector Search · cosine"
                                    : "Semantic search · cosine similarity"}
                                {model ? ` · ${model}` : ""}
                            </small>
                        </div>
                        <div className={compact ? "grid grid-compact" : "grid"}>
                            {results.map((h) => <HackathonCard key={h._id} h={h} score={h.score} />)}
                        </div>
                    </>
                )
            )}
        </div>
    );
}
