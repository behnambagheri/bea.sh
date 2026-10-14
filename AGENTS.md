# Repository Guidelines

## Project Structure
- Static personal site with no build step: `index.html`, `styles.css`, and `script.js` live in the repo root.
- Static assets (fonts, images) go under `public/`.
- `functions/[[path]].js` is a Cloudflare Pages Function that returns a plain-text reply to `curl`/`wget`/`httpie`.
- `Dockerfile`, `nginx.conf`, and `docker-compose.yml` serve the same site from an nginx container; `nginx.conf` returns a plain-text resume to CLI user agents.

## Development
- Open `index.html` directly, or serve the root with any static server (e.g., `python3 -m http.server`).
- Docker: `docker compose up -d --build` serves the site on `127.0.0.1:81`.
- The Dockerfile copies an explicit allowlist (`index.html`, `styles.css`, `script.js`, `public/`). Add any new served file there, or it will be missing from the image.

## Coding Style
- Plain HTML, CSS, and vanilla JavaScript; no frameworks or dependencies.
- 2-space indentation, single quotes in JS, trailing commas in multi-line literals.
- Theme colors are CSS custom properties on `:root`, with dark overrides via `prefers-color-scheme` and `body[data-theme]`; keep both in sync.
- Keep the curl/CLI responses in `nginx.conf` and `functions/[[path]].js` consistent with page content when profile details change.

## Commits
- Present tense; Conventional Commits preferred (`feat: add hero section`, `fix: ...`, `chore: ...`).
- Keep commits small and scoped.

## Security
- Never commit secrets. Only site assets should be published — never repo or config files.
