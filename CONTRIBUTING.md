# Contributing to HackHub

Thanks for your interest in improving HackHub! This is a student-friendly project,
so questions are welcome - please open an issue if anything is unclear.

## Getting set up

```bash
git clone https://github.com/ridhima936/HACKHUB-.git
cd HACKHUB-
cp .env.example .env          # then fill in MONGO_URI and JWT_SECRET
npm run install:all
npm run seed                  # hackathon data + embeddings
npm run create-index          # Atlas Vector Search (once)
npm start                     # API  -> http://localhost:5000
npm run client                # web  -> http://localhost:5173
```

## Before you open a pull request

```bash
npm run check                 # backend syntax check
npm test                      # offline unit tests
npm run lint:client           # frontend lint
npm run build:client          # make sure the client builds
```

If your change touches the API, also run the integration suite against a running
server + seeded database:

```bash
npm run test:api
```

## Guidelines

- Keep pull requests small and focused; one feature or fix per PR.
- Match the existing code style (4-space indentation in the backend, 2 spaces in
  the frontend package config) and keep the "magical academy" copy consistent.
- Never commit `.env`, secrets, `node_modules`, or build output.
- Add or update tests when you change behaviour.
- Update the README if you add an endpoint, script, or environment variable.

## Commit messages

Short and imperative, for example:

```
fix(rag): fall back to local cosine when the Atlas index is missing
feat(frontend): full-page artwork on the auth screens
docs: document the deployment steps
```
