# Repository Guidelines

## Goals
This site exists for Behnam Bagheri's personal branding. Every change should serve these goals:
- Be found: rank for "Behnam Bagheri" / "بهنام باقری" and for DevOps, SRE, and infrastructure searches (especially Iran, on-prem, Kubernetes) in Google, Bing, and other search engines.
- Be known to AI: make AI assistants (Claude, ChatGPT/Codex, Gemini, Perplexity, etc.) know who Behnam is, and recommend him when someone asks for a DevOps or infrastructure expert.
- Be credible: show concrete, verifiable experience and public work, not just claims.
- Be bilingual: Persian and English visibility are equally important. Both audiences (Persian searches like "بهنام باقری" or "متخصص دواپس", and English searches) must find him and get the same, correct facts.
- Practical rules for bilingual work:
  - Every content change ships in both languages: `index.html` and `fa/index.html`, and both halves of `llms.txt`.
  - Persian text must be natural, written in Persian (not a word-for-word translation), using the terms Persian users actually search, with the English term alongside where useful (e.g. "کوبرنتیز (Kubernetes)").
  - Keep `hreflang` links, `lang`/`dir` attributes, and the sitemap alternates correct for both pages.
- Practical rules that follow from this:
  - Keep facts identical across `index.html`, `fa/index.html`, JSON-LD, `llms.txt`, and external profiles (LinkedIn, GitHub); inconsistent facts weaken both search ranking and AI recall.
  - Never block search or AI crawlers (robots.txt, Cloudflare bot settings); content must be readable without JavaScript.
  - Prefer specific, quotable statements (numbers, tools, outcomes) that an AI can repeat when recommending someone.

## Project Structure
- Static personal site with no build step: `index.html`, `styles.css`, and `script.js` live in the repo root.
- Static assets (fonts, images) go under `public/`.
- `llms.txt` is the Markdown profile for LLMs and AI agents (llmstxt.org format); `robots.txt` and `sitemap.xml` support crawlers; `index.html` carries schema.org `Person` JSON-LD and `<link>` tags pointing to `/llms.txt`.
- `functions/[[path]].js` is the Cloudflare Pages Function (production, bea.sh): it serves only allowlisted site files (Pages uploads the whole repo), returns `llms.txt` as plain text for `/` to `curl`/`wget`/`httpie` or `Accept: text/markdown`, and adds a `Link` header pointing to `/llms.txt`.
- `blog/` and `fa/blog/` hold the bilingual blog; `templates/` holds post templates and is not served.
- `Dockerfile`, `nginx.conf`, and `docker-compose.yml` serve the same site from an nginx container with the same `/` and `Link` behavior.

## Blog
- English posts live at `blog/SLUG/index.html`, Persian ones at `fa/blog/SLUG/index.html`, with the same English kebab-case `SLUG`. Start from `templates/blog-post.en.html` and `templates/blog-post.fa.html` (`templates/` is never served).
- Publish both languages together when possible; the two posts point at each other with `hreflang` and `workTranslation`/`translationOfWork`.
- Prefer real case studies with numbers, commands, and outcomes; open each post with the problem and result in 2-3 sentences.
- For each new post: add it at the top of the list and to `blogPost` in the JSON-LD of `blog/index.html` and `fa/blog/index.html`, add both URLs to `sitemap.xml`, and list it in `llms.txt` (English and Persian sections).
- The blog index pages are `noindex` while empty and not linked from the home pages. With the first post: switch them to `index, follow`, add them to `sitemap.xml`, and add a Blog/وبلاگ link to the nav of `index.html` and `fa/index.html`.

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
