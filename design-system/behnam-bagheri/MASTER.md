# Behnam Bagheri — Website design direction

Generated with UI/UX Pro Max and adapted to this repository on October 21, 2026.

## Direction

A restrained technical portfolio with an editorial layout. The keystone arch from the existing brand becomes a blueprint illustration: a visual connection between Persian architecture and reliable infrastructure. The illustration is conceptual, not a live infrastructure diagram or health indicator.

## Foundations

- Keep the shared `ds/v1/` tokens and public components compatible with consumers and the Figma design system. No shared token values change in this redesign.
- Use `--bb-bg`, `--bb-surface`, `--bb-text`, `--bb-muted`, `--bb-line`, and the existing blue accent. Use the existing gold keystone token only in the illustration.
- Use the self-hosted Space Grotesk and Vazirmatn fonts. Monospace labels add technical detail without becoming the primary reading font.
- Maintain a 1180px content limit, generous section spacing, 4px surface corners, thin dividers, and minimal shadows.
- The site remains plain HTML, CSS, and JavaScript with no build step, runtime framework, external fonts, or new dependencies.

## Page composition

1. Name, language switch, theme switch, and three section links.
2. A short statement, existing profile copy, one primary contact action, and keystone illustration.
3. Existing experience numbers and tools.
4. Experience with specific responsibilities and source profile links.
5. Three specialties: platform operations, delivery systems, reliability tooling.
6. All 18 existing services, searchable by name, tool, or domain and filterable by access.
7. Dedicated contact section with email, LinkedIn, GitHub, location, and availability.

## Bilingual behavior

Both pages share structure and interactions. Persian uses natural phrasing, logical CSS properties, Vazirmatn, and more generous line height. Domains, email, IP addresses, and code remain LTR. Every service retains its original URL and access classification. The Persian APT guide is available in place.

## Interaction and accessibility

- Keep all profile and service content in static HTML. Without JavaScript, the directory and native request disclosures stay usable; unavailable search/theme controls stay hidden.
- Use native `details` for access requests and a native modal `dialog` for the APT guide. Preserve Escape handling, focus containment, and return to the trigger.
- Combine access filters and search, announce the number of results, and provide an explicit reset for empty results.
- Keep focus visible, touch controls at least 44px tall, OS light/dark preference until a choice is saved, and an in-memory theme fallback if storage fails.
- Avoid entrance animations and hidden-until-observed content. Honor reduced motion for smooth scrolling and transitions.

## Validation

Run the existing SEO and serving tests. Check desktop and mobile layouts in both themes and languages. Verify filtering, empty/reset state, private service disclosures, the native dialog, copy feedback, language navigation, and unchanged crawler metadata and service URLs.

## Logo refinement

The keystone arch uses two filled supports, a gold wedge integrated into the crown, and a horizontal foundation. The mark retains navy `#0f172a`, gold `#d4a72c`, and white `#f4f7fb`. It uses solid SVG paths instead of strokes, making the silhouette more consistent across icon sizes.

- Canonical website icon: `favicon.svg`, mirrored at `public/brand/logo-icon.svg`.
- Color mark for light surfaces: `public/brand/logo-mark.svg`.
- Color mark for dark surfaces: `public/brand/logo-mark-inverse.svg`.
- Single-color mark: `public/brand/logo-monochrome.svg`.
- PNG exports: 1024px square icon and transparent mark under `public/brand/`.
- Browser ICO: dedicated 16px, 32px, and 48px PNG entries. Touch icon: 180px.
- Social preview: `public/og-image.png`, with its editable source at `public/brand/social-preview.svg`.

Keep the proportions and gaps intact. Give the standalone mark clear space of at least one pier width. Prefer the square icon for favicons and avatars; use transparent variants in layouts. The monochrome mark retains the stone seams so its meaning does not depend entirely on gold. Sizes of 16px, 32px, 48px, and 64px were rendered for visual inspection; use 24px or larger when space permits.
