# Repository Guidelines

## Project Structure
- Static personal site with no build step: `index.html`, `styles.css`, and `script.js` live in the repo root.
- Static assets (fonts, images) go under `public/`.
- `llms.txt` is the Markdown profile for LLMs and AI agents (llmstxt.org format); `robots.txt` and `sitemap.xml` support crawlers; `index.html` carries schema.org `Person` JSON-LD and `<link>` tags pointing to `/llms.txt`.
- `functions/[[path]].js` is the Cloudflare Pages Function (production, bea.sh): it serves only allowlisted site files (Pages uploads the whole repo), returns `llms.txt` as plain text for `/` to `curl`/`wget`/`httpie` or `Accept: text/markdown`, and adds a `Link` header pointing to `/llms.txt`.
- `Dockerfile`, `nginx.conf`, and `docker-compose.yml` serve the same site from an nginx container with the same `/` and `Link` behavior.

## Development
- Open `index.html` directly, or serve the root with any static server (e.g., `python3 -m http.server`).
- Docker: `docker compose up -d --build` serves the site on `127.0.0.1:81`.
- The Dockerfile copies an explicit allowlist (`index.html`, `styles.css`, `script.js`, `llms.txt`, `robots.txt`, `sitemap.xml`, `public/`). Add any new served file there and to `PUBLIC_FILES` in `functions/[[path]].js`, or it will be missing or return 404.

## Coding Style
- Plain HTML, CSS, and vanilla JavaScript; no frameworks or dependencies.
- 2-space indentation, single quotes in JS, trailing commas in multi-line literals.
- Theme colors are CSS custom properties on `:root`, with dark overrides via `prefers-color-scheme` and `body[data-theme]`; keep both in sync.
- `styles.css` and `script.js` are linked with a `?v=YYYYMMDD` query because browsers cache them for 4 hours; bump it in `index.html` and `fa/index.html` whenever either file changes.
- When profile details change, update `index.html` (page and JSON-LD) and `llms.txt` together; bump `lastmod` in `sitemap.xml`.

## Commits
- Present tense; Conventional Commits preferred (`feat: add hero section`, `fix: ...`, `chore: ...`).
- Keep commits small and scoped.

## Security
- Never commit secrets. Only site assets should be published — never repo or config files.
