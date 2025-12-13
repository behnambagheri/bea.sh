export async function onRequest({ request, env, next }) {
  const ua = request.headers.get('user-agent') || '';
  if (/curl|wget|httpie/i.test(ua)) {
    const quip = [
      "Hey cli friend, here’s a 200 OK hug from the edge.",
      "You had me at curl. Keep shipping.",
      "Scripts welcome. Humans too. Stay hydrated.",
    ];
    const line = quip[Math.floor(Math.random() * quip.length)];
    return new Response(`${line}\n`, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  if (env.ASSETS) {
    return env.ASSETS.fetch(request);
  }

  return next();
}
