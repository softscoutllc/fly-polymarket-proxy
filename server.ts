/**
 * Transparent HTTPS forwarder for Polymarket's CLOB API.
 *
 * Compose tasks can't reach clob.polymarket.com directly because of Deno
 * network permission restrictions in the Compose runtime. This proxy runs
 * on Fly.io and forwards every request path 1:1 to clob.polymarket.com.
 *
 * Used by the bot-composer copy-trader template — hardcoded URL, no setup
 * required from users who fork the example.
 */
const TARGET = "https://clob.polymarket.com";

Deno.serve({ port: 8080 }, async (req: Request) => {
  const url = new URL(req.url);

  // Health check
  if (url.pathname === "/_health") {
    return new Response("ok", { status: 200 });
  }

  const target = `${TARGET}${url.pathname}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("fly-forwarded-port");
  headers.delete("fly-forwarded-proto");
  headers.delete("fly-forwarded-ssl");
  headers.delete("fly-region");
  headers.delete("fly-request-id");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-proto");
  headers.delete("x-forwarded-ssl");

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.body && req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  try {
    const upstream = await fetch(target, init);
    const resHeaders = new Headers(upstream.headers);
    resHeaders.delete("strict-transport-security");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "proxy upstream failed", detail: String(err) }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
});
