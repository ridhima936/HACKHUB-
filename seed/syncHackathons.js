// Fetches open hackathons from Devpost right now. Run: npm run sync
require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const { syncHackathons } = require("../services/hackathonSync");

(async () => {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set. Add it to your .env file (see .env.example).");
        process.exitCode = 1;
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await syncHackathons();
        console.log(`Synced from Devpost: ${result.fetched} open, ${result.removed} removed.`);
    } catch (err) {
        console.error("Sync failed:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
})();
