const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const clean = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

// Devpost gives the submission period as text, for example
// "May 10 - 12, 2026", "Nov 07 - Dec 12, 2026" or "Dec 01, 2026 - Jan 05, 2027".
// Returns the last day as a UTC date, or null if the text is not understood.
const parseEndDate = (text) => {
    if (typeof text !== "string") return null;

    const parts = text.split(/\s[-–—]\s/).map((p) => p.trim());
    const start = parts[0];
    const end = parts[parts.length - 1];

    const match = end.match(/^(?:([A-Za-z]{3,9})\.?\s+)?(\d{1,2}),?\s+(\d{4})$/);
    if (!match) return null;

    const monthName = match[1] || (start.match(/^([A-Za-z]{3,9})/) || [])[1];
    const month = MONTHS.indexOf(String(monthName || "").slice(0, 3).toLowerCase());
    const day = Number(match[2]);
    const year = Number(match[3]);
    if (month < 0) return null;

    const date = new Date(Date.UTC(year, month, day));
    return date.getUTCDate() === day ? date : null;
};

// Turns one item from the Devpost API into a Hackathon document, or null if it
// is unusable. Both snake_case and camelCase field names are accepted.
const toHackathon = (raw) => {
    if (!raw) return null;

    const name = clean(raw.title);
    const officialUrl = clean(raw.url);
    if (!name || !officialUrl) return null;
    if (raw.invite_only || raw.inviteOnly) return null;

    const organizer = clean(raw.organization_name ?? raw.organizationName);
    const location = clean(raw.displayed_location?.location ?? raw.location) || "Online";
    const themes = (raw.themes || [])
        .map((t) => (typeof t === "string" ? clean(t) : clean(t?.name)))
        .filter(Boolean);

    const description = [
        organizer ? `${name}, hosted by ${organizer}.` : `${name}.`,
        themes.length ? `Themes: ${themes.join(", ")}.` : ""
    ]
        .join(" ")
        .trim();

    return {
        name,
        description,
        techStack: themes,
        skills: themes,
        deadline: parseEndDate(raw.submission_period_dates ?? raw.submissionPeriodDates),
        organizer,
        platform: "Devpost",
        mode: /online/i.test(location) ? "Online" : "Offline",
        location,
        officialUrl,
        source: "Devpost"
    };
};

module.exports = { parseEndDate, toHackathon };
