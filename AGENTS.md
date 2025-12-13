# Repository Guidelines

## Project Structure & Module Organization
- Keep application code under `src/` (e.g., `src/app` for Next.js or `src/main.tsx` for Vite); group features by domain with co-located components, hooks, and styles.
- Store static assets in `public/` (move top-level assets like `Behnam Bagheri.png` here); keep build artifacts in `dist/` or `.next/` out of version control.
- Place shared configuration in the repo root (`package.json`, lint/format config) and add any docs or ADRs under `docs/`.
- Put automated tests in `tests/` or alongside code as `*.test.ts[x]` to keep behavior close to implementation.

## Build, Test, and Development Commands
- `npm install` — install dependencies (use Node 18+ for consistency).
- `npm run dev` — start the local dev server with hot reload.
- `npm run build` — create an optimized production bundle into `dist/` or `.next/`.
- `npm run lint` — run ESLint to catch style and quality issues.
- `npm run test` — run the unit/integration test suite; add `npm run coverage` if coverage reporting is configured.

## Coding Style & Naming Conventions
- Prefer TypeScript; use 2-space indentation, single quotes, and trailing commas (enforce via Prettier).
- Follow ESLint rules (extend `eslint:recommended` plus framework presets); fix warnings before pushing.
- Name React components and classes in `PascalCase`, hooks in `camelCase` prefixed with `use`, and utility modules in `kebab-case`.
- Keep files small and focused; extract shared logic into `/src/lib` or `/src/utils`.

## Testing Guidelines
- Use Vitest or Jest with Testing Library for components; name files `*.test.ts` or `*.spec.tsx`.
- Aim for meaningful coverage (≈80% functions/branches); cover edge cases and accessibility expectations.
- For UI changes, add a minimal smoke test to assert render and key interactions; prefer deterministic data over live API calls.

## Commit & Pull Request Guidelines
- Write commits in present tense, either Conventional Commits (`feat: add hero section`) or clear summaries if no scope fits.
- Keep commits small and scoped; include rationale in the body when behavior changes.
- PRs should describe the change, implementation notes, test evidence (`npm run test`/screenshots for UI), and any follow-ups; link related issues or tasks.
- Before requesting review, ensure `npm run lint` and `npm run test` are clean and that new files include typing and tests where practical.

## Security & Configuration Tips
- Never commit secrets; place runtime config in `.env.local` and provide safe defaults in `.env.example`.
- Review third-party dependencies for licenses and updates; pin versions in `package-lock.json`.
- If deploying via a static host or CDN, verify that only build output is published and that cache headers are set appropriately for assets.
