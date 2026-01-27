# AGENTS.md

This repo has two apps:
- Frontend: React + Vite + Tailwind in `Frontend/`
- Backend: Express + Mongoose in `Backend/`

No Cursor rules or Copilot instructions were found.

## Docker Deployment (VPS)

Single-image Docker setup (backend serves frontend build):
- `Dockerfile` (root) builds frontend + backend and serves on port 5000.
- `docker-compose.yml` expects Traefik on `dokploy-network` and routes the
  domain directly to port 5000.

Required docker-compose env vars (set in VPS or compose):
- `APP_DOMAIN` (e.g. `gabtrotter.org`)
- `VITE_API_URL` (e.g. `https://gabtrotter.org`)
- `VITE_RECAPTCHA_SITE_KEY`
- `FRONTEND_URL`
- `MONGO_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

## Commands

### Frontend (`Frontend/`)
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`

Single test:
- No test runner configured in `Frontend/package.json`.
- If you add tests later, document the single-test command here.

### Backend (`Backend/`)
- Install: `npm install`
- Dev server: `npm run dev` (nodemon)
- Start: `npm run start`

Single test:
- No test runner configured in `Backend/package.json`.
- If you add tests later, document the single-test command here.

### Full repo
- Run frontend and backend from their folders.
- No root-level scripts are defined.

## Code Style Guide

### General
- Language: JavaScript (ES modules), no TypeScript.
- Node version is not pinned; use a modern LTS.
- Keep changes focused; avoid unrelated refactors.
- Prefer small, composable functions over long ones.
- Keep side effects (I/O, network, DB) contained.

### Imports
- Use ES module `import`/`export` everywhere.
- Group imports in this order:
  1) External packages
  2) Internal modules
  3) Styles/assets
- Use relative imports inside a feature folder.
- Frontend supports alias `@/*` via `Frontend/jsconfig.json`.

### Formatting
- Use 2-space indentation (current files follow this).
- Use semicolons.
- Prefer single quotes for strings; use double quotes only
  when the string contains single quotes or HTML content.
- Keep line length reasonable (~100–120).
- JSX: keep props on one line when short; wrap when long.
- Prefer trailing commas in multi-line objects/arrays.

### Naming
- React components: PascalCase (e.g., `EventPage`).
- Hooks: `useX` prefix.
- Context providers: `XProvider`.
- Variables and functions: camelCase.
- Constants: SCREAMING_SNAKE_CASE.
- Files:
  - Components/pages in PascalCase.
  - Utilities in camelCase or kebab-case.
  - Backend routes/controllers/models in dot-separated names
    (e.g., `user.routes.js`).

### Frontend (React + Vite)
- Use function components and hooks.
- Keep components in `Frontend/src/components` or `pages`.
- Use React Router for routing (`Frontend/src/App.jsx`).
- Keep UI logic inside components; move shared logic to
  `Frontend/src/lib` or `Frontend/src/hooks`.
- Prefer controlled components for forms.
- Tailwind:
  - Co-locate class strings with the component.
  - Use `clsx`/`tailwind-merge` when composing classes.
- UI components under `Frontend/src/components/ui` are shared
  primitives; avoid re-implementing them.

### Backend (Express + Mongoose)
- Keep route handlers in `Backend/controllers`.
- Keep route definitions in `Backend/routes`.
- Keep models in `Backend/models`.
- Use `dotenv` for secrets (`process.env`).
- Keep request/response logging minimal in production.
- Prefer async/await over promise chains.

### Error Handling
- Validate inputs early and return 4xx on client errors.
- Use try/catch in async handlers and return 5xx on failures.
- Include a concise `message` field in JSON error responses.
- Avoid leaking secrets or stack traces to clients.
- In backend controllers, always return after sending a response.

### API Responses
- Return JSON for API endpoints unless otherwise required.
- Use consistent response shapes:
  - Success: `{ message, data }` or `{ data }`.
  - Failure: `{ message, error? }`.
- Use standard HTTP status codes (200, 201, 400, 401, 404, 500).

### State and Data Flow
- Keep React state minimal and local where possible.
- Use context only for truly global state (auth, theme, etc.).
- Favor derived data over duplicated state.

### Security & Secrets
- Do not commit `.env` or credentials.
- Access secrets via `process.env` only.
- Never log tokens or passwords.

### Tests (future)
- If you introduce tests, add scripts in each package and
  document single-test commands here.
- Keep tests close to the code they validate.

### Git Hygiene
- Do not modify unrelated files.
- Keep diffs minimal and purposeful.

## Quick File Pointers
- Frontend entry: `Frontend/src/main.jsx`
- Frontend routes: `Frontend/src/App.jsx`
- Backend entry: `Backend/index.js`
- Backend DB: `Backend/db/connectDB.js`

## Notes for Agents
- There is no repo-wide build/test runner.
- Run commands from the correct subfolder.
- Follow existing patterns instead of introducing new frameworks.
