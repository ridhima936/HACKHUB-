// Unit tests for the Devpost parsing helpers. No database or network needed.
const assert = require("assert");
const { parseEndDate, toHackathon } = require("../utils/devpost");

let passed = 0;
let failed = 0;

const it = (name, fn) => {
    try {
        fn();
        passed++;
        console.log(`  PASS  ${name}`);
    } catch (err) {
        failed++;
        console.log(`  FAIL  ${name}\n        ${err.message}`);
    }
};

const iso = (date) => date && date.toISOString().slice(0, 10);

console.log("END DATE PARSING");

it("same-month range", () => assert.strictEqual(iso(parseEndDate("May 10 - 12, 2026")), "2026-05-12"));
it("range across months", () => assert.strictEqual(iso(parseEndDate("Nov 07 - Dec 12, 2026")), "2026-12-12"));
it("range across years", () => assert.strictEqual(iso(parseEndDate("Dec 01, 2026 - Jan 05, 2027")), "2027-01-05"));
it("single date", () => assert.strictEqual(iso(parseEndDate("Nov 7, 2026")), "2026-11-07"));
it("long month names and en dash", () => assert.strictEqual(iso(parseEndDate("November 3 – November 20, 2026")), "2026-11-20"));
it("rejects an impossible date", () => assert.strictEqual(parseEndDate("Feb 30, 2026"), null));
it("rejects text it does not understand", () => {
    assert.strictEqual(parseEndDate("soon"), null);
    assert.strictEqual(parseEndDate(undefined), null);
});

console.log("MAPPING");

it("maps an API item to a hackathon", () => {
    const h = toHackathon({
        title: "  Build   Week ",
        url: "https://buildweek.devpost.com/",
        organization_name: "Example Org",
        displayed_location: { icon: "globe", location: "Online" },
        submission_period_dates: "Nov 07 - Dec 12, 2026",
        themes: [{ id: 1, name: "Web" }, { id: 2, name: "Machine Learning/AI" }]
    });
    assert.strictEqual(h.name, "Build Week");
    assert.strictEqual(h.platform, "Devpost");
    assert.strictEqual(h.mode, "Online");
    assert.deepStrictEqual(h.techStack, ["Web", "Machine Learning/AI"]);
    assert.strictEqual(iso(h.deadline), "2026-12-12");
    assert.ok(h.description.includes("Example Org"));
});

it("accepts camelCase fields", () => {
    const h = toHackathon({ title: "A", url: "https://a.devpost.com/", organizationName: "Org", submissionPeriodDates: "Nov 1 - 9, 2026" });
    assert.strictEqual(h.organizer, "Org");
    assert.strictEqual(iso(h.deadline), "2026-11-09");
});

it("keeps a hackathon with an unreadable deadline, without a deadline", () => {
    const h = toHackathon({ title: "A", url: "https://a.devpost.com/", submission_period_dates: "TBA" });
    assert.strictEqual(h.deadline, null);
});

it("skips items without a title or url, and invite-only items", () => {
    assert.strictEqual(toHackathon({ url: "https://a.devpost.com/" }), null);
    assert.strictEqual(toHackathon({ title: "A" }), null);
    assert.strictEqual(toHackathon({ title: "A", url: "https://a.devpost.com/", invite_only: true }), null);
    assert.strictEqual(toHackathon(null), null);
});

it("marks in-person hackathons as Offline", () => {
    const h = toHackathon({ title: "A", url: "https://a.devpost.com/", displayed_location: { location: "Pune, India" } });
    assert.strictEqual(h.mode, "Offline");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
