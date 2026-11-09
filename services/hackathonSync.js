const Hackathon = require("../models/Hackathon");
const { generateEmbedding } = require("./embeddingService");
const { toHackathon } = require("../utils/devpost");

const SOURCE = "Devpost";
const API_URL = "https://devpost.com/api/hackathons";
const PAGES = 3;
const PER_PAGE = 50;
const MAX_EMBEDDINGS_PER_RUN = 60;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
const RETRY_AFTER_MS = 60 * 60 * 1000;

let running = false;
let lastAttempt = 0;

const fetchPage = async (page) => {
    const params = new URLSearchParams({ per_page: String(PER_PAGE), page: String(page) });
    params.append("status[]", "open");
    params.append("challenge_type[]", "online");

    const res = await fetch(`${API_URL}?${params}`, {
        headers: { Accept: "application/json", "User-Agent": "HackHub/1.0 (student project)" },
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`Devpost responded with ${res.status}`);

    const body = await res.json();
    return Array.isArray(body.hackathons) ? body.hackathons : [];
};

const fetchOpenHackathons = async () => {
    const found = [];
    for (let page = 1; page <= PAGES; page++) {
        const items = await fetchPage(page);
        found.push(...items);
        if (items.length < PER_PAGE) break;
    }
    return found.map(toHackathon).filter(Boolean);
};

const embeddingText = (h) => [h.name, h.description, h.techStack.join(" ")].join(" ");

const embedNewHackathons = async () => {
    const pending = await Hackathon.find({ source: SOURCE, "embedding.0": { $exists: false } })
        .limit(MAX_EMBEDDINGS_PER_RUN);

    for (const hackathon of pending) {
        try {
            hackathon.embedding = await generateEmbedding(embeddingText(hackathon));
            await hackathon.save();
        } catch (err) {
            console.warn(`Could not embed "${hackathon.name}":`, err.message);
        }
    }
};

const syncHackathons = async ({ embed = true } = {}) => {
    const hackathons = await fetchOpenHackathons();
    if (hackathons.length === 0) return { fetched: 0, removed: 0 };

    const now = new Date();
    await Hackathon.bulkWrite(
        hackathons.map((h) => ({
            updateOne: {
                filter: { officialUrl: h.officialUrl },
                update: { $set: { ...h, lastChecked: now }, $setOnInsert: { embedding: [] } },
                upsert: true
            }
        }))
    );

    // Anything from this source that Devpost no longer lists has closed.
    const removed = await Hackathon.deleteMany({
        source: SOURCE,
        officialUrl: { $nin: hackathons.map((h) => h.officialUrl) }
    });

    if (embed) await embedNewHackathons();
    return { fetched: hackathons.length, removed: removed.deletedCount };
};

// Runs a sync only when the last one is more than a day old. Safe to call often:
// it never runs twice at once, retries a failure at most once an hour, and never throws.
const syncIfStale = async () => {
    if (process.env.AUTO_SYNC === "false" || running) return;
    if (Date.now() - lastAttempt < RETRY_AFTER_MS) return;

    running = true;
    lastAttempt = Date.now();
    try {
        const latest = await Hackathon.findOne({ source: SOURCE }).sort({ lastChecked: -1 }).select("lastChecked");
        if (latest?.lastChecked && Date.now() - latest.lastChecked.getTime() < STALE_AFTER_MS) return;

        // Skip embeddings when the model is not preloaded (small free instances).
        const result = await syncHackathons({ embed: process.env.PRELOAD_MODEL !== "false" });
        console.log(`Hackathon sync: ${result.fetched} fetched, ${result.removed} removed`);
    } catch (err) {
        console.warn("Hackathon sync failed:", err.message);
    } finally {
        running = false;
    }
};

const startAutoSync = () => {
    syncIfStale();
    setInterval(syncIfStale, 6 * 60 * 60 * 1000).unref();
};

module.exports = { syncHackathons, syncIfStale, startAutoSync };
