# HackHub — The Developer Academy 🏰

> A full-stack student developer platform with an original **magical-academy** interface.
> Discover projects, form teams, browse hackathons, and get **AI-powered hackathon
> recommendations** using retrieval-augmented generation (RAG) over MongoDB Atlas
> Vector Search.

<p>
  <img alt="Node" src="https://img.shields.io/badge/Node.js-22-3c873a?logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47a248?logo=mongodb&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>

---

## 📌 Quick links

| | |
|---|---|
| 💻 **Repository** | [github.com/ridhima936/HACKHUB-](https://github.com/ridhima936/HACKHUB-) |
| 🐛 **Report a bug** | [github.com/ridhima936/HACKHUB-/issues](https://github.com/ridhima936/HACKHUB-/issues) |
| 🖥️ **API base URL** | `http://localhost:5000/api` (local) · `https://hackhub-api-86m6.onrender.com/api` (live) |
| 🔗 **Live demo** | [frontend-three-orpin-83.vercel.app](https://frontend-three-orpin-83.vercel.app) |

> The frontend runs on Vercel and the API on Render (Docker). Both are live —
> open the demo and try the **Hackathon Archives → skill search** flow.

> **Free-tier note:** the Render instance sleeps after 15 minutes idle, so the
> first request after a pause can take ~30 seconds to wake up.

> **Run it locally in 60 seconds**
>
> ```bash
> git clone https://github.com/ridhima936/HACKHUB-.git
> cd HACKHUB-
> cp .env.example .env      # add MONGO_URI + JWT_SECRET
> npm run install:all && npm run seed
> npm start                 # API  -> http://localhost:5000
> npm run client            # web  -> http://localhost:5173
> ```

---

## ✨ Features

- **🔐 Authentication** — register / login with bcrypt-hashed passwords and JWT sessions.
- **🏠 Landing page** — explains what HackHub does and previews three currently-open hackathons.
- **📜 Projects** — create, browse, search, filter, sort, edit and delete projects
  (ownership-protected: only the creator can update or delete).
- **🛡️ Teams** — create fellowships, join / leave, and view members with roles.
- **🔮 Hackathon discovery** — real, currently-open hackathons from Unstop with the
  organizer, deadline, mode, technology tags and a **"Register on Unstop"** button that
  opens the actual event page.
- **🤖 Skill-based recommendations (RAG)** — type your stack and get the closest
  hackathons ranked by semantic similarity, with a match score.
- **🎨 Original design** — a bespoke "magical academy" theme (no templates), with a
  full-page welcome artwork on the sign-in / create-account screens.
- **📱 Responsive** — desktop sidebar, mobile drawer, keyboard-accessible modals, toasts.

## 🏆 Hackathon data

The archive in `seed/hackathons.js` holds **real hackathons collected from
[unstop.com](https://unstop.com/hackathons)**. Each record stores the organizer, deadline,
mode, technology tags and the canonical Unstop URL, and the button on every card links
straight to that page.

The list is curated by hand rather than scraped — Unstop's listing pages are rendered
client-side, so a scraper would be brittle and would break the moment their markup
changes. To refresh the archive, update `seed/hackathons.js` and re-run `npm run seed`.
Records carry `source` and `lastChecked` fields so it is always clear when they were
verified. If fewer hackathons are open, fewer are shown — nothing is invented.

## 📸 Screenshots

| Create account | Sign in |
|---|---|
| ![Create Account screen](docs/screenshot-register.jpg) | ![Sign in screen](docs/screenshot-login.jpg) |

Both entry screens use a full-page academy artwork with a dark wash so the form stays readable.

## 🧠 How the RAG feature works

```
 "React, Node.js, MongoDB"
            │
            ▼
   @xenova/transformers  (Xenova/all-MiniLM-L6-v2, 384-dim, runs locally on CPU)
            │  query embedding
            ▼
 ┌───────────────────────────────────────────┐
 │  1. MongoDB Atlas Vector Search           │  ← cosine, index "hackathon_vector_index"
 │     $vectorSearch over hackathon.embedding│
 └───────────────────────────────────────────┘
            │  (if the index is missing or still building…)
            ▼
 ┌───────────────────────────────────────────┐
 │  2. In-process cosine fallback            │  ← same embeddings, same metric
 │     rankByCosine(queryVector, docs)       │
 └───────────────────────────────────────────┘
            │
            ▼
   Top 5 hackathons + similarity score
```

- Hackathon text (name + description + tech stack + skills) is embedded **once** at
  seed time and stored in the `embedding` field.
- At query time only the user's skills are embedded, so responses stay fast (~50 ms
  once the model is warm).
- Embeddings are **L2-normalized**, so the dot product equals cosine similarity. Atlas
  rescales cosine to `(1 + cos) / 2`; the local fallback uses the same scale, so the
  match percentage in the UI is comparable either way.
- The pipeline **degrades gracefully**: if the Atlas index is not ready, it falls back
  to an in-process cosine search, so the demo never breaks.

## 🏗️ Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Axios, hand-written CSS (no UI kit) |
| Backend | Node.js 22, Express 5, Mongoose 9 |
| Database | MongoDB / MongoDB Atlas (`$vectorSearch`) |
| AI / RAG | `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, 384 dimensions) |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` |
| Tooling | ESLint 10, Docker, GitHub Actions, Render + Vercel |

## 📂 Project structure

```
hackhub/
├── server.js                 # Express app, security headers, health, graceful shutdown
├── config/db.js              # Mongoose connection
├── controllers/              # auth, project, team, hackathon (RAG) logic
├── middleware/authMiddleware.js
├── models/                   # User, Project, Team, Hackathon (with embedding[])
├── routes/                   # /api/auth, /api/projects, /api/teams, /api/hackathons
├── services/embeddingService.js   # lazy-loaded MiniLM feature-extraction pipeline
├── utils/
│   ├── helpers.js            # regex escaping, ObjectId validation, list parsing
│   └── vector.js             # cosine similarity + ranking (unit-tested)
├── seed/
│   ├── hackathons.js         # sample hackathon data
│   ├── generateEmbeddings.js # 384-dim embeddings for every hackathon
│   └── createVectorIndex.js  # creates the Atlas Vector Search index
├── tests/
│   ├── vector.test.js        # offline unit tests (no DB) - `npm test`
│   └── smoke.test.js         # 39 end-to-end API checks - `npm run test:api`
├── scripts/check-syntax.js   # dependency-free backend syntax check
├── docs/                     # README screenshots
├── frontend/                 # React + Vite client (its own package.json)
└── Dockerfile, docker-compose.yml, render.yaml
```

## 🚀 Getting started

**Requirements:** Node.js ≥ 18 (22 recommended) and a MongoDB database
(MongoDB Atlas free tier is perfect — and required for native vector search).

### 1. Clone & configure the backend

```bash
git clone https://github.com/ridhima936/HACKHUB-.git
cd HACKHUB-
cp .env.example .env
```

Open `.env` and set at least:

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hackhub
JWT_SECRET=<any long random string>
```

Generate a secret quickly:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Install dependencies

```bash
npm run install:all        # backend + frontend
```

### 3. Seed the hackathon archive + embeddings

```bash
npm run seed               # real Unstop hackathons, then 384-dim embeddings
```

> The first run downloads the MiniLM model (~90 MB) into the transformers cache.

### 4. Create the Atlas Vector Search index (once)

```bash
npm run create-index
```

Or manually in Atlas: collection `hackathons` → *Create Search Index* → **Vector Search**
(JSON editor):

```json
{ "fields": [ { "type": "vector", "path": "embedding", "numDimensions": 384, "similarity": "cosine" } ] }
```

Index name must be `hackathon_vector_index`. It takes about a minute to become READY —
until then the API automatically uses the cosine fallback.

### 5. Run

```bash
npm start                  # API      -> http://localhost:5000
npm run client             # frontend -> http://localhost:5173
```

Open http://localhost:5173, create an account, and try the **AI Recommendation Chamber**.

## 🔌 API reference

Base URL: `/api`

| Method | Endpoint | Auth | Description |
|---|---|:--:|---|
| `GET` | `/health` | – | Service + database status |
| `POST` | `/auth/register` | – | Create an account (`name`, `email`, `password`) |
| `POST` | `/auth/login` | – | Sign in, returns a JWT |
| `GET` | `/auth/me` | ✅ | Current user profile |
| `GET` | `/projects` | – | List projects (`?search=&category=`) |
| `GET` | `/projects/my` | ✅ | Projects owned by the current user |
| `GET` | `/projects/:id` | – | Single project |
| `POST` | `/projects` | ✅ | Create a project |
| `PATCH` | `/projects/:id` | ✅ owner | Update a project |
| `DELETE` | `/projects/:id` | ✅ owner | Delete a project |
| `GET` | `/teams` | – | List teams with members |
| `POST` | `/teams` | ✅ | Create a team |
| `POST` | `/teams/:id/join` | ✅ | Join a team |
| `POST` | `/teams/:id/leave` | ✅ | Leave a team (owner cannot leave) |
| `GET` | `/hackathons` | – | List/search hackathons (`?search=&techStack=`) |
| `GET` | `/hackathons/:id` | – | Single hackathon |
| `POST` | `/hackathons/recommend` | – | **RAG**: `{ "techStack": ["React", "MongoDB"] }` → ranked hackathons |

Example:

```bash
curl -X POST http://localhost:5000/api/hackathons/recommend \
  -H "Content-Type: application/json" \
  -d '{"techStack":["React","Node.js","MongoDB"]}'
```

```json
{
  "message": "Hackathons recommended successfully",
  "method": "atlas-vector-search",
  "model": "Xenova/all-MiniLM-L6-v2",
  "total": 6,
  "recommendations": [
    { "_id": "…", "name": "Codex 48 - National-Level Hackathon", "score": 0.72, "…": "…" }
  ]
}
```

## 🧪 Testing

| Command | What it does | Needs |
|---|---|---|
| `npm test` / `npm run test:unit` | 10 unit tests for the RAG vector math | nothing |
| `npm run test:api` | 39 end-to-end API checks (auth, projects, teams, hackathons, RAG) | running server + seeded DB |
| `npm run check` | Syntax-checks every backend file | nothing |
| `npm run lint:client` | ESLint on the frontend | frontend deps |
| `npm run build:client` | Production build of the client | frontend deps |

```bash
npm test                                   # fast, offline
npm start                                  # then, in another terminal:
npm run test:api
```

## 🧪 Testing the API with Apidog

The endpoints above are quick to explore in [Apidog](https://apidog.com/) without writing any code.

1. Create a new project and set the environment base URL to `http://localhost:5000/api`.
2. Add a **Login** request: `POST /auth/login` with `{ "email": "you@college.edu", "password": "..." }`.
   Copy the `token` from the response.
3. In **Environments**, add a variable `token`, then set the Auth header on protected
   requests to `Bearer {{token}}`.
4. Save the folder and run the requests in order to walk through register → login →
   projects → teams → recommendations.

A useful smoke run:

| # | Request | Notes |
|---|---|---|
| 1 | `GET /health` | Confirms the API and DB are up |
| 2 | `POST /auth/register` | Use a throwaway email |
| 3 | `POST /auth/login` | Save the returned `token` |
| 4 | `GET /auth/me` | Needs the Bearer token |
| 5 | `GET /hackathons` | Public; real Unstop events |
| 6 | `POST /hackathons/recommend` | Body: `{ "techStack": ["React", "Node.js", "MongoDB"] }` |


## ☁️ Deployment

### ⚡ One-click deploy

<div>

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ridhima936/HACKHUB-)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fridhima936%2FHACKHUB-&root-directory=frontend&project-name=hackhub-frontend)

</div>

> You still need a free **MongoDB Atlas** cluster for `MONGO_URI` — Atlas Vector Search is
> what powers the RAG feature. Then deploy the backend with the Render button, copy its
> URL into the frontend's `VITE_API_URL`, and the frontend's URL back into `CLIENT_URL`.

### Backend → Render (Docker blueprint)

The repo includes `render.yaml`, which tells Render to build the **Dockerfile** on the
free plan. This is how the live API at
`https://hackhub-api-86m6.onrender.com` is deployed.

1. Go to [render.com](https://render.com) → **New → Blueprint** and pick
   `ridhima936/HACKHUB-`.
2. Render reads `render.yaml` and prompts for the two secret values:
   - `MONGO_URI` — your Atlas connection string
   - `CLIENT_URL` — `https://frontend-three-orpin-83.vercel.app`
     (add other origins comma-separated if needed)
3. Deploy. The service comes up at `https://<service-name>.onrender.com`.
4. Seed it **once** from the Render shell:
   ```bash
   npm run seed          # data + embeddings
   npm run create-index  # Atlas vector index (once per cluster)
   ```
   The embeddings are what the recommender searches, so a data-only seed will
   leave the RAG endpoint returning `503`.

> Free instances sleep after 15 minutes idle, so the first request after a pause
> takes ~30 seconds to wake. The RAG model is loaded lazily (`PRELOAD_MODEL=false`)
> to stay inside the 512 MB memory limit.

Finally, point the frontend at it:

```bash
cd frontend
vercel env add VITE_API_URL production   # https://<service-name>.onrender.com/api
vercel deploy --prod
```

### Frontend → Vercel

1. Import the repo and set the **root directory** to `frontend`.
2. Add the environment variable `VITE_API_URL=https://<your-api>.onrender.com/api`.
3. Deploy. `frontend/vercel.json` already configures the Vite build and SPA rewrites.

> Vite inlines `VITE_API_URL` at build time, so changing it requires a redeploy.
> Set it in the Vercel project settings — never put secrets in a `VITE_*` variable.

Current production frontend: **https://frontend-three-orpin-83.vercel.app**

Deploying the frontend first? That's fine — just add its URL to the backend's
`CLIENT_URL` afterwards so CORS allows it.

### Docker (backend only)

```bash
docker build -t hackhub .
docker run --env-file .env -p 5000:5000 hackhub
```

Or spin up the API **and** a local MongoDB with one command:

```bash
cp .env.example .env          # set JWT_SECRET (MONGO_URI is overridden by compose)
docker compose up --build
```

## ⚙️ Environment variables

| Variable | Scope | Required | Description |
|---|---|:--:|---|
| `MONGO_URI` | backend | ✅ | MongoDB / Atlas connection string (include the DB name) |
| `JWT_SECRET` | backend | ✅ | Signing secret for JWTs |
| `PORT` | backend | – | API port (default `5000`) |
| `CLIENT_URL` | backend | – | Comma-separated allowed CORS origins |
| `PRELOAD_MODEL` | backend | – | `false` skips the boot-time model download |
| `FORCE` | backend | – | `1` re-generates existing embeddings when seeding |
| `VITE_API_URL` | frontend | – | API base URL (default `http://localhost:5000/api`) |

## 🗺️ Roadmap

- [ ] Project ⇄ team linking and shared team project boards.
- [ ] Hackathon bookmarking and deadline reminders.
- [ ] Richer profile page (skills, GitHub links, avatar upload).
- [ ] LLM-written explanation for each recommendation ("why this matches you").
- [ ] Automated accessibility (axe) and API contract tests in CI.

## 🤝 Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Please open an
issue first for anything large, and keep pull requests focused.

## 📄 License

Released under the [MIT License](LICENSE).

---

<p align="center">
  Built for student developers · <em>HackHub — The Developer Academy</em>
</p>
