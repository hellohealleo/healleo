// ═══════════════════════════════════════════════════════
// HEALLEO — Vite entry point (Phase 1)
//
// Responsibilities that build.py used to handle inline:
//   1. Inject HEALLEO_API_PROXY onto window (from VITE_* env)
//   2. Install the fetch interceptor that rewrites Anthropic calls
//   3. Install the window.storage localStorage polyfill
//   4. Load the Supabase adapter (sets window.healleoAuth / window.healleoData)
//   5. Mount AuthGate
// ═══════════════════════════════════════════════════════

import React from "react";
import { createRoot } from "react-dom/client";

// ─── 1. API proxy URL (required for AI features) ───
const API_PROXY = import.meta.env.VITE_HEALLEO_API_PROXY || "";
window.HEALLEO_API_PROXY = API_PROXY;

// ─── 2. Fetch interceptor: rewrite api.anthropic.com → our Cloudflare Worker ───
const _origFetch = window.fetch.bind(window);
window.fetch = function (url, opts) {
  if (typeof url === "string" && url.includes("api.anthropic.com") && window.HEALLEO_API_PROXY) {
    url = url.replace("https://api.anthropic.com", window.HEALLEO_API_PROXY);
  }
  return _origFetch(url, opts);
};

// ─── 3. Storage polyfill (localStorage-backed) ───
if (!window.storage) {
  window.storage = {
    async get(key) {
      const val = localStorage.getItem(key);
      return val !== null ? { key, value: val } : null;
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!prefix || k.startsWith(prefix)) keys.push(k);
      }
      return { keys };
    },
  };
}

// ─── 4. Supabase adapter (side-effect import — sets window.healleoAuth etc.) ───
import "./supabase-adapter.js";

// ─── 5. Mount the app ───
import AuthGate from "./App.jsx";

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(AuthGate));
