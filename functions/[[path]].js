// Advertise the Markdown profile so AI agents can find it from any response.
const CANONICAL_HOST = 'bea.sh';

const LINK_HEADER = '</llms.txt>; rel="describedby"; type="text/markdown", </sitemap.xml>; rel="sitemap"; type="application/xml"';

// Pages uploads the whole repo, so only site assets are served; everything else is a 404.
const PUBLIC_FILES = new Set([
  '/', '/index.html', '/styles.css', '/script.js', '/llms.txt', '/robots.txt', '/sitemap.xml',
  '/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/fa', '/fa/', '/fa/index.html',
  '/blog', '/fa/blog',
]);

// Directories whose whole contents are site content.
const PUBLIC_PREFIXES = ['/public/', '/blog/', '/fa/blog/'];

function isPublicPath(pathname) {
  return PUBLIC_FILES.has(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// CLI clients (and agents that fetch with them) or Markdown-preferring clients get the profile as text.
function wantsPlainProfile(request) {
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';
  return /curl|wget|httpie/i.test(ua) || /text\/markdown/i.test(accept);
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);

  // www.bea.sh duplicates the canonical host, so send visitors and crawlers to bea.sh.
  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  const fetchAsset = (req) => (env.ASSETS ? env.ASSETS.fetch(req) : next(req));

  const isRoot = url.pathname === '/';
  let response;
  if (!isPublicPath(url.pathname)) {
    response = new Response('Not found\n', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  } else if (isRoot && wantsPlainProfile(request)) {
    const profile = await fetchAsset(new Request(new URL('/llms.txt', url), request));
    response = new Response(profile.body, {
      status: profile.status,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  } else {
    const asset = await fetchAsset(request);
    response = new Response(asset.body, asset);
  }

  if (isRoot) {
    // The same URL serves HTML or text depending on the client, so it must not be shared-cached.
    response.headers.set('cache-control', 'no-store');
    response.headers.set('vary', 'User-Agent, Accept');
  }

  // Preview and *.pages.dev deployments duplicate https://bea.sh/, so keep them out of search results.
  if (url.hostname.endsWith('.pages.dev')) {
    response.headers.set('x-robots-tag', 'noindex');
  }

  response.headers.append('link', LINK_HEADER);
  return response;
}
