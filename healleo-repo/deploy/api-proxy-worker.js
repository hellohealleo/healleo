// Healleo API Proxy — Cloudflare Worker
// Setup: Workers & Pages → Create → paste this → Settings → Variables → ANTHROPIC_API_KEY
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
    const url = new URL(request.url);
    if (request.method !== "POST" || !url.pathname.startsWith("/v1/messages")) {
      return new Response("Not found", { status: 404 });
    }
    const response = await fetch("https://api.anthropic.com" + url.pathname, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: request.body,
    });
    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  },
};
