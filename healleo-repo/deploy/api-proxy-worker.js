// Healleo API Proxy — Cloudflare Worker
// Setup:
//   1. Workers & Pages → Create → paste this
//   2. Settings → Variables → Add:
//      - ANTHROPIC_API_KEY (your Anthropic key)
//      - HEALLEO_PROXY_SECRET (generate: openssl rand -hex 32)

const ALLOWED_ORIGINS = [
  "https://healleo.com",
  "https://www.healleo.com",
  "https://staging.healleo.com",
];
const ALLOWED_MODELS = [
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-5-20241022",
  "claude-haiku-4-5-20251001",
];
const MAX_TOKENS_CAP = 4096;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : null;

    // Allow localhost in development
    const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
    const corsOrigin = allowedOrigin || (isLocalhost ? origin : null);

    if (!corsOrigin) {
      return new Response("Forbidden", { status: 403 });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, x-healleo-token",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || !url.pathname.startsWith("/v1/messages")) {
      return new Response("Not found", { status: 404 });
    }

    // Verify shared secret
    const token = request.headers.get("x-healleo-token");
    if (!env.HEALLEO_PROXY_SECRET || token !== env.HEALLEO_PROXY_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Enforce model allowlist
    if (!body.model || !ALLOWED_MODELS.includes(body.model)) {
      return new Response("Model not allowed", { status: 400 });
    }

    // Cap max_tokens
    if (body.max_tokens > MAX_TOKENS_CAP) {
      body.max_tokens = MAX_TOKENS_CAP;
    }

    const response = await fetch("https://api.anthropic.com" + url.pathname, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  },
};
