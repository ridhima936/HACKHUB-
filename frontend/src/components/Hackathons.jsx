import { useCallback, useEffect, useMemo, useState } from "react";
import api, { errorMessage } from "../services/api";
import { EmptyState, Loading, PageHeader } from "./Ui";
import { HackathonCard, Recommender } from "./HackathonParts";

function Hackathons() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [tech, setTech] = useState("");

    const load = useCallback(async () => {
        try {
            const { data } = await api.get("/hackathons");
            setItems(data);
            setError("");
        } catch (err) {
            setError(errorMessage(err, "Failed to load hackathons"));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(); // eslint-disable-line react-hooks/set-state-in-effect
    }, [load]);

    const techOptions = useMemo(
        () => [...new Set(items.flatMap((h) => h.techStack || []))].sort((a, b) => a.localeCompare(b)),
        [items]
    );

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter(
            (h) =>
                (!q ||
                    h.name.toLowerCase().includes(q) ||
                    h.description.toLowerCase().includes(q) ||
                    (h.skills || []).some((s) => s.toLowerCase().includes(q))) &&
                (!tech || (h.techStack || []).includes(tech))
        );
    }, [items, search, tech]);

    return (
        <section>
            <PageHeader eyebrow="The Hackathon Archives" title="Discover Your Next Quest"
                subtitle="Browse every challenge, or let the AI chamber match them to your skills." />

            <Recommender />

            <div className="section-title">
                <h2>All Hackathons</h2>
                <span className="count">{visible.length} of {items.length}</span>
            </div>

            <div className="toolbar">
                <input type="search" placeholder="Search by name, skill or topic…" value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                <select value={tech} onChange={(e) => setTech(e.target.value)} aria-label="Technology">
                    <option value="">All technologies</option>
                    {techOptions.map((t) => <option key={t}>{t}</option>)}
                </select>
            </div>

            {loading ? (
                <Loading text="Unrolling the archives…" />
            ) : error ? (
                <EmptyState icon="⚠" title="The archives are unreachable" text={error}
                    action={<button className="btn btn-ghost" onClick={load}>Try again</button>} />
            ) : visible.length === 0 ? (
                <EmptyState icon="🔮" title="No hackathons found"
                    text={items.length === 0 ? "Run npm run seed on the backend to fill the archives." : "Try a different search or technology."} />
            ) : (
                <div className="grid">{visible.map((h) => <HackathonCard key={h._id} h={h} />)}</div>
            )}
        </section>
    );
}

export default Hackathons;
