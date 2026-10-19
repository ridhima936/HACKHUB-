import { useEffect, useState } from "react";
import api from "../services/api";
import { Loading, PageHeader } from "./Ui";
import { daysLeft, formatDate } from "../utils";
import { Recommender } from "./HackathonParts";

function Dashboard({ user, go }) {
    const [data, setData] = useState(null);

    useEffect(() => {
        let cancelled = false;
        Promise.allSettled([
            api.get("/projects/my"),
            api.get("/projects"),
            api.get("/teams"),
            api.get("/hackathons")
        ]).then(([mine, all, teams, hacks]) => {
            if (cancelled) return;
            const pick = (r) => (r.status === "fulfilled" && Array.isArray(r.value.data) ? r.value.data : []);
            setData({ mine: pick(mine), all: pick(all), teams: pick(teams), hacks: pick(hacks) });
        });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!data) return <Loading text="Lighting the candles…" />;

    const myTeams = data.teams.filter((t) =>
        (t.members || []).some((m) => (m._id || m) === user.id)
    );
    const upcoming = data.hacks.filter((h) => daysLeft(h.deadline) >= 0).slice(0, 3);
    const firstName = user.name?.split(" ")[0] || "Student";

    const stats = [
        { icon: "📜", label: "My Projects", value: data.mine.length, to: "my-projects" },
        { icon: "📚", label: "Library Projects", value: data.all.length, to: "projects" },
        { icon: "🛡️", label: "My Teams", value: myTeams.length, to: "teams" },
        { icon: "🔮", label: "Hackathons", value: data.hacks.length, to: "hackathons" }
    ];

    return (
        <section>
            <PageHeader
                eyebrow="The Great Hall"
                title={`Welcome back, ${firstName}`}
                subtitle="Your projects, teams and next hackathon quests, all in one place."
                actions={<button className="btn btn-gold" onClick={() => go("create")}>＋ Create Project</button>}
            />

            <div className="stats">
                {stats.map((s) => (
                    <button key={s.label} className="stat" onClick={() => go(s.to)}>
                        <span className="stat-icon">{s.icon}</span>
                        <b>{s.value}</b>
                        <small>{s.label}</small>
                    </button>
                ))}
            </div>

            <div className="two-col">
                <div className="panel">
                    <div className="panel-head">
                        <h2>Recent projects</h2>
                        <button className="link-btn" onClick={() => go("my-projects")}>View all →</button>
                    </div>
                    {data.mine.length === 0 ? (
                        <p className="muted">You have not created a project yet. Your first quest awaits.</p>
                    ) : (
                        <ul className="list">
                            {data.mine.slice(0, 4).map((p) => (
                                <li key={p._id}>
                                    <div><b>{p.name}</b><small>{p.category}</small></div>
                                    <span className="tag">{p.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="panel">
                    <div className="panel-head">
                        <h2>Upcoming quests</h2>
                        <button className="link-btn" onClick={() => go("hackathons")}>Archives →</button>
                    </div>
                    {upcoming.length === 0 ? (
                        <p className="muted">No upcoming hackathons in the archives.</p>
                    ) : (
                        <ul className="list">
                            {upcoming.map((h) => (
                                <li key={h._id}>
                                    <div><b>{h.name}</b><small>{h.platform} · {formatDate(h.deadline)}</small></div>
                                    <span className="tag">{daysLeft(h.deadline)}d</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <Recommender compact />
        </section>
    );
}

export default Dashboard;
