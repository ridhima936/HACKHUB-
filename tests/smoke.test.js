// End-to-end API smoke test. Usage: start the server + seed the database, then
// run `npm run test:api`.
// Optional: API_URL=http://localhost:5000/api
const BASE = process.env.API_URL || "http://localhost:5000/api";
let passed = 0, failed = 0;

const call = async (method, path, { token, body } = {}) => {
    const res = await fetch(BASE + path, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch { /* empty */ }
    return { status: res.status, data };
};

const check = (name, cond, extra = "") => {
    if (cond) { passed++; console.log(`  PASS  ${name}`); }
    else { failed++; console.log(`  FAIL  ${name} ${extra}`); }
};

(async () => {
    const stamp = Date.now();
    const a = { name: "Alice Tester", email: `alice${stamp}@test.com`, password: "secret123" };
    const b = { name: "Bob Tester", email: `bob${stamp}@test.com`, password: "secret123" };

    console.log("AUTH");
    let r = await call("POST", "/auth/register", { body: a });
    check("register", r.status === 201);
    r = await call("POST", "/auth/register", { body: a });
    check("duplicate email rejected", r.status === 400);
    r = await call("POST", "/auth/register", { body: { name: "X", email: "bad", password: "1" } });
    check("invalid register rejected", r.status === 400);
    await call("POST", "/auth/register", { body: b });
    r = await call("POST", "/auth/login", { body: { email: a.email, password: "wrong" } });
    check("wrong password rejected", r.status === 400);
    r = await call("POST", "/auth/login", { body: { email: a.email, password: a.password } });
    check("login returns token", r.status === 200 && !!r.data.token);
    const ta = r.data.token;
    const tb = (await call("POST", "/auth/login", { body: { email: b.email, password: b.password } })).data.token;
    r = await call("GET", "/auth/me", { token: ta });
    check("/auth/me", r.status === 200 && r.data.user.email === a.email && !r.data.user.password);
    r = await call("GET", "/auth/me");
    check("protected route blocks no token", r.status === 401);
    r = await call("GET", "/auth/me", { token: "garbage" });
    check("protected route blocks bad token", r.status === 401);

    console.log("PROJECTS");
    r = await call("POST", "/projects", { token: ta, body: { name: "Alpha App", description: "Alpha description text", category: "Web", techStack: "React, Node.js" } });
    check("create project", r.status === 201);
    const pid = r.data?._id;
    r = await call("POST", "/projects", { token: ta, body: { name: "x" } });
    check("invalid project rejected", r.status === 400);
    r = await call("POST", "/projects", { body: { name: "No Auth", description: "Needs a token here", category: "Web" } });
    check("create project needs auth", r.status === 401);
    r = await call("GET", "/projects/my", { token: ta });
    check("my projects", r.status === 200 && r.data.some((p) => p._id === pid));
    r = await call("GET", "/projects/my", { token: tb });
    check("my projects is per-user", r.status === 200 && !r.data.some((p) => p._id === pid));
    r = await call("GET", "/projects?search=alpha");
    check("search projects", r.status === 200 && r.data.some((p) => p._id === pid));
    r = await call("GET", "/projects?search=(");
    check("regex chars in search are safe", r.status === 200);
    r = await call("GET", `/projects/${pid}`);
    check("get one project", r.status === 200 && r.data._id === pid);
    r = await call("GET", "/projects/not-an-id");
    check("invalid ObjectId -> 400", r.status === 400);
    r = await call("PATCH", `/projects/${pid}`, { token: tb, body: { name: "Hacked" } });
    check("non-owner cannot update", r.status === 403);
    r = await call("DELETE", `/projects/${pid}`, { token: tb });
    check("non-owner cannot delete", r.status === 403);
    r = await call("PATCH", `/projects/${pid}`, { token: ta, body: { name: "Alpha Renamed", owner: "000000000000000000000000", status: "Completed" } });
    check("owner can update, owner field protected", r.status === 200 && r.data.name === "Alpha Renamed" && r.data.owner._id !== "000000000000000000000000" && r.data.status === "Completed");

    console.log("TEAMS");
    r = await call("POST", "/teams", { token: ta, body: { name: "Team Rocket", description: "We build" } });
    check("create team", r.status === 201);
    const tid = r.data?.team?._id;
    r = await call("POST", `/teams/${tid}/join`, { token: tb });
    check("join team", r.status === 200);
    r = await call("POST", `/teams/${tid}/join`, { token: tb });
    check("cannot join twice", r.status === 400);
    r = await call("GET", "/teams");
    const team = r.data.find((t) => t._id === tid);
    check("teams list shows 2 members", r.status === 200 && team?.members.length === 2);
    r = await call("POST", `/teams/${tid}/leave`, { token: ta });
    check("owner cannot leave", r.status === 400);
    r = await call("POST", `/teams/${tid}/leave`, { token: tb });
    check("member can leave", r.status === 200);
    r = await call("POST", `/teams/${tid}/leave`, { token: tb });
    check("non-member cannot leave", r.status === 400);

    console.log("HACKATHONS + RAG");
    r = await call("GET", "/hackathons");
    check("list hackathons", r.status === 200 && r.data.length > 0 && !("embedding" in r.data[0]));
    const hid = r.data[0]?._id;
    r = await call("GET", `/hackathons/${hid}`);
    check("hackathon details", r.status === 200);
    r = await call("POST", "/hackathons/recommend", { body: { techStack: [] } });
    check("recommend validates empty input", r.status === 400);
    r = await call("POST", "/hackathons/recommend", { body: { techStack: ["React", "Node.js", "MongoDB"] } });
    check("recommend returns ranked results", r.status === 200 && r.data.recommendations?.length > 0, `(status ${r.status}: ${r.data?.message})`);
    if (r.status === 200) {
        const recs = r.data.recommendations;
        check("recommend reports search method", ["atlas-vector-search", "local-cosine"].includes(r.data.method));
        check("recommend reports embedding model", typeof r.data.model === "string" && r.data.model.length > 0);
        check("recommend reports embedded doc count", Number(r.data.total) > 0);
        check("recommendations are sorted by score", recs.every((x, i) => i === 0 || recs[i - 1].score >= x.score));
        check("recommendations never leak embeddings", recs.every((x) => !("embedding" in x)));
        console.log(`        method=${r.data.method} model=${r.data.model} top="${recs[0]?.name}" score=${recs[0]?.score?.toFixed(3)}`);
    }
    r = await call("POST", "/hackathons/recommend", { body: { techStack: Array.from({ length: 31 }, (_, i) => `s${i}`) } });
    check("recommend rejects too many skills", r.status === 400);

    console.log("CLEANUP");
    r = await call("DELETE", `/projects/${pid}`, { token: ta });
    check("owner can delete", r.status === 200);
    r = await call("GET", `/projects/${pid}`);
    check("deleted project is gone", r.status === 404);

    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed ? 1 : 0);
})();
