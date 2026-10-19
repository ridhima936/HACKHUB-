# HackHub: The Developer Academy

A full-stack student developer platform with an original magical-academy interface.
Discover projects, form teams, browse hackathons and get **AI-powered hackathon recommendations (RAG)**.

**Stack:** React + Vite, Node.js + Express, MongoDB + Mongoose, JWT + bcrypt,
`@xenova/transformers` (Xenova/all-MiniLM-L6-v2, 384-dim) + MongoDB Atlas Vector Search, Docker.

## 1. Configure `.env` (project root)
Copy `.env.example` to `.env` and fill in:
```
MONGO_URI=<your Atlas connection string, with database name e.g. /hackhub>
JWT_SECRET=<any long random string>
```

## 2. Install
```
npm run install:all
```

## 3. Seed hackathons + embeddings (once)
```
npm run seed
```
The first run downloads the embedding model (~90 MB) and generates 384-dim vectors for every hackathon.

## 4. Create the Atlas Vector Search index (once)
```
npm run create-index
```
or manually in Atlas: collection `hackathons` -> Create Search Index -> **Vector Search** (JSON editor):
```json
{ "fields": [ { "type": "vector", "path": "embedding", "numDimensions": 384, "similarity": "cosine" } ] }
```
Index name must be `hackathon_vector_index`. It takes about a minute to become READY.
(Until it is ready, the API automatically falls back to cosine similarity over the same stored embeddings.)

## 5. Run
```
npm start              # backend  -> http://localhost:5000
npm run client         # frontend -> http://localhost:5173
```

## Tests
With the backend running: `npm test` (33 API checks: auth, projects + ownership, teams, hackathons, RAG).

## Docker (backend)
```
docker build -t hackhub . && docker run --env-file .env -p 5000:5000 hackhub
```
