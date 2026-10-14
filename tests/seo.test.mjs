import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { onRequest } from '../functions/[[path]].js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(new URL(file, `file://${root}`));
const html = read('index.html').toString();
const head = html.slice(0, html.indexOf('</head>'));

const metaContent = (attr, name) => {
  const match = head.match(new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]*)"`));
  return match?.[1];
};

const pngSize = (buffer) => {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
};

test('title and meta description target search keywords', () => {
  const title = head.match(/<title>([^<]+)<\/title>/)[1];
  assert.match(title, /Behnam Bagheri/);
  assert.match(title, /DevOps Engineer/);
  assert.ok(title.length <= 80, `title is ${title.length} chars`);

  const description = head.match(/name="description"\s+content="([^"]+)"/)[1];
  assert.match(description, /Kubernetes/);
  assert.ok(description.length >= 70 && description.length <= 160, `description is ${description.length} chars`);
});

test('canonical, Open Graph and Twitter tags point at bea.sh', () => {
  assert.match(head, /<link rel="canonical" href="https:\/\/bea\.sh\/">/);
  assert.equal(metaContent('property', 'og:url'), 'https://bea.sh/');
  assert.equal(metaContent('property', 'og:type'), 'profile');
  assert.ok(metaContent('property', 'og:title'));
  assert.ok(metaContent('property', 'og:description'));
  assert.equal(metaContent('property', 'og:image'), 'https://bea.sh/public/og-image.png');
  assert.equal(metaContent('name', 'twitter:card'), 'summary_large_image');
  assert.equal(metaContent('name', 'twitter:image'), metaContent('property', 'og:image'));
  assert.doesNotMatch(head, /noindex/);
});

test('Open Graph image exists at the declared size', () => {
  const [width, height] = pngSize(read('public/og-image.png'));
  assert.equal(String(width), metaContent('property', 'og:image:width'));
  assert.equal(String(height), metaContent('property', 'og:image:height'));
});

test('JSON-LD is valid and describes the person', () => {
  const blocks = [...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const data = JSON.parse(blocks[0][1]);
  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(data['@type'], 'ProfilePage');
  assert.equal(data.mainEntity['@type'], 'Person');
  assert.equal(data.mainEntity.name, 'Behnam Bagheri');
  assert.equal(data.mainEntity.url, 'https://bea.sh/');
});

test('favicons are linked and present', () => {
  for (const [rel, href] of [['icon', '/favicon.ico'], ['icon', '/favicon.svg'], ['apple-touch-icon', '/apple-touch-icon.png']]) {
    assert.match(head, new RegExp(`<link rel="${rel}" href="${href}"`), `${href} not linked`);
    assert.ok(existsSync(`${root}${href.slice(1)}`), `${href} missing`);
  }
  assert.match(read('favicon.svg').toString(), /^<svg [^>]*viewBox="0 0 64 64"/);
  const ico = read('favicon.ico');
  assert.equal(ico.readUInt16LE(2), 1, 'not an ICO file');
  assert.ok(ico.readUInt16LE(4) >= 2, 'ICO should hold several sizes');
  assert.deepEqual(pngSize(read('apple-touch-icon.png')), [180, 180]);
});

test('robots.txt allows the site, hides Cloudflare internals and links the sitemap', () => {
  const robots = read('robots.txt').toString();
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Disallow: \/cdn-cgi\/$/m);
  assert.doesNotMatch(robots, /^Disallow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/bea\.sh\/sitemap\.xml$/m);
});

test('sitemap.xml lists the canonical page', () => {
  const sitemap = read('sitemap.xml').toString();
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  assert.match(sitemap, /<loc>https:\/\/bea\.sh\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/bea\.sh\/fa\/<\/loc>/);
  for (const [, date] of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test('English and Persian pages link to each other with hreflang', () => {
  const fa = read('fa/index.html').toString();
  const faHead = fa.slice(0, fa.indexOf('</head>'));
  assert.match(fa, /<html lang="fa" dir="rtl">/);
  assert.match(faHead, /<link rel="canonical" href="https:\/\/bea\.sh\/fa\/">/);
  for (const page of [head, faHead]) {
    assert.match(page, /<link rel="alternate" hreflang="en" href="https:\/\/bea\.sh\/">/);
    assert.match(page, /<link rel="alternate" hreflang="fa" href="https:\/\/bea\.sh\/fa\/">/);
    assert.match(page, /<link rel="alternate" hreflang="x-default" href="https:\/\/bea\.sh\/">/);
  }
  // The English page stays visually unchanged: no visible link to /fa/ in its body.
  assert.doesNotMatch(html.slice(html.indexOf('<body')), /href="[^"]*\/fa\/?"/);
});

// Minimal stand-in for the Pages ASSETS binding: serves repo files by path.
const env = {
  ASSETS: {
    fetch: async (request) => {
      const { pathname } = new URL(request.url);
      const file = pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : pathname.slice(1);
      if (!existsSync(`${root}${file}`)) return new Response('missing', { status: 404 });
      return new Response(read(file), { status: 200 });
    },
  },
};
const call = (path, { host = 'bea.sh', ua = 'Mozilla/5.0 (compatible; Googlebot/2.1)' } = {}) =>
  onRequest({ request: new Request(`https://${host}${path}`, { headers: { 'user-agent': ua } }), env, next: () => {} });

test('Pages function serves crawler files and icons, including to CLI clients', async () => {
  for (const path of ['/robots.txt', '/sitemap.xml', '/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/public/og-image.png']) {
    for (const ua of ['Mozilla/5.0 (compatible; Googlebot/2.1)', 'curl/8.7.1']) {
      const response = await call(path, { ua });
      assert.equal(response.status, 200, `${path} for ${ua}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), read(path.slice(1)), `${path} body for ${ua}`);
    }
  }
});

test('Pages function serves the Persian page', async () => {
  const response = await call('/fa/');
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), read('fa/index.html'));
});

test('Pages function marks pages.dev hosts noindex but not the canonical host', async () => {
  assert.equal((await call('/')).headers.get('x-robots-tag'), null);
  assert.equal((await call('/robots.txt')).headers.get('x-robots-tag'), null);
  for (const host of ['behnambagheri-ir.pages.dev', 'abc123.behnambagheri-ir.pages.dev']) {
    assert.equal((await call('/', { host })).headers.get('x-robots-tag'), 'noindex', host);
  }
});

test('Pages function redirects www to the canonical host, keeping path and query', async () => {
  for (const [path, location] of [['/', 'https://bea.sh/'], ['/fa/?ref=x', 'https://bea.sh/fa/?ref=x'], ['/missing', 'https://bea.sh/missing']]) {
    const response = await call(path, { host: 'www.bea.sh' });
    assert.equal(response.status, 301, path);
    assert.equal(response.headers.get('location'), location, path);
  }
});

test('Pages function keeps repo files out of the site', async () => {
  for (const path of ['/AGENTS.md', '/nginx.conf', '/package.json', '/tests/seo.test.mjs']) {
    assert.equal((await call(path)).status, 404, path);
  }
});

test('Docker image ships every file the Pages function serves', () => {
  const dockerfile = read('Dockerfile').toString();
  for (const file of ['robots.txt', 'sitemap.xml', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png']) {
    assert.match(dockerfile, new RegExp(`COPY [^\\n]*\\b${file.replace('.', '\\.')}\\b`), file);
  }
  assert.match(dockerfile, /COPY public \.\/public/);
  assert.match(dockerfile, /COPY fa \.\/fa/);
});
