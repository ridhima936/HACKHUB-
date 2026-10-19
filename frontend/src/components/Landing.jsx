import { useEffect, useState } from "react";
import api, { errorMessage } from "../services/api";
import { Crest } from "./Ui";
import { HackathonCard } from "./HackathonParts";

const FEATURES = [
    {
        icon: "🔍",
        title: "Find hackathons that fit",
        text: "Every entry links straight to the real Unstop page — no sign-up walls, no dead links."
    },
    {
        icon: "🧠",
        title: "Skill-based matching",
        text: "Type your stack (React, Node.js, MongoDB…) and get the closest hackathons ranked by relevance."
    },
    {
        icon: "🤝",
        title: "Build a team",
        text: "Create projects, post them, and find teammates who work with the same tools you do."
    }
];

const STEPS = [
    { n: "1", title: "Create an account", text: "Sign up with your email in a few seconds." },
    { n: "2", title: "Add your skills", text: "Tell HackHub what you build with." },
    { n: "3", title: "Register and ship", text: "Open the Unstop page and join the event." }
];

function Landing({ onLogin, onRegister }) {
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        api.get("/hackathons")
            .then(({ data }) => {
                if (!cancelled) setHackathons(Array.isArray(data) ? data.slice(0, 3) : []);
            })
            .catch((err) => {
                if (!cancelled) setError(errorMessage(err, "Could not load hackathons"));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="landing">
            <header className="landing-hero">
                <Crest size={72} />
                <span className="landing-badge">Hackathon discovery for student developers</span>
                <h1>Find your next hackathon.<br />Build something worth showing.</h1>
                <p className="lead">
                    HackHub collects real, currently-open hackathons and matches them to the
                    technologies you actually use. Sign in to save your stack, track deadlines
                    and get skill-based recommendations.
                </p>
                <div className="landing-cta">
                    <button className="btn btn-gold" onClick={onRegister}>Create an account</button>
                    <button className="btn btn-ghost" onClick={onLogin}>Sign in</button>
                </div>
            </header>

            <div className="landing-features">
                {FEATURES.map((f) => (
                    <div className="feature" key={f.title}>
                        <span className="feature-icon" aria-hidden="true">{f.icon}</span>
                        <h3>{f.title}</h3>
                        <p>{f.text}</p>
                    </div>
                ))}
            </div>

            <section className="landing-section">
                <div className="section-title">
                    <h2>Open right now</h2>
                    <span className="count">{loading ? "loading…" : `${hackathons.length} shown`}</span>
                </div>

                {loading ? (
                    <div className="skeleton-grid">
                        {[0, 1, 2].map((i) => <div className="skeleton" key={i} />)}
                    </div>
                ) : error ? (
                    <p className="form-error" role="alert">{error}</p>
                ) : hackathons.length === 0 ? (
                    <p className="landing-note">
                        No hackathons loaded yet. Run <code>npm run seed</code> on the backend to fill the archive.
                    </p>
                ) : (
                    <>
                        <div className="grid">
                            {hackathons.map((h) => <HackathonCard key={h._id} h={h} />)}
                        </div>
                        <p className="landing-note">
                            Sign in to browse the full list and get matched to your skills.
                        </p>
                    </>
                )}
            </section>

            <section className="landing-section">
                <div className="section-title">
                    <h2>How it works</h2>
                </div>
                <div className="landing-features">
                    {STEPS.map((s) => (
                        <div className="feature" key={s.n}>
                            <span className="feature-icon" aria-hidden="true">{s.n}</span>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="landing-foot">
                <span>HackHub — a student full-stack project (React, Express, MongoDB).</span>
                <span>Hackathon data: unstop.com</span>
            </footer>
        </div>
    );
}

export default Landing;
