#!/usr/bin/env python3
"""
Healleo Build Script
Assembles src/ files + .env config → dist/index.html

Usage:
  python3 build.py          # Build for production
  python3 build.py --check  # Verify .env is configured
"""

import os
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
DIST = os.path.join(ROOT, "dist")
DEPLOY = os.path.join(ROOT, "deploy")
ENV_FILE = os.path.join(ROOT, ".env")

def load_env():
    """Load .env file into a dict."""
    env = {}
    if not os.path.exists(ENV_FILE):
        print(f"⚠️  No .env file found. Copy .env.example to .env and configure it.")
        print(f"   cp .env.example .env")
        sys.exit(1)
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                # Strip quotes
                val = val.strip().strip('"').strip("'")
                env[key.strip()] = val
    return env

def read_file(path):
    with open(path, "r") as f:
        return f.read()

def build():
    env = load_env()

    # Required
    proxy_url = env.get("HEALLEO_API_PROXY", "")
    if not proxy_url:
        print("❌ HEALLEO_API_PROXY is not set in .env")
        print("   This is required for AI features.")
        sys.exit(1)

    # Optional (Supabase)
    supabase_url = env.get("SUPABASE_URL", "")
    supabase_anon = env.get("SUPABASE_ANON_KEY", "")

    if "--check" in sys.argv:
        print(f"✓ HEALLEO_API_PROXY: {proxy_url}")
        print(f"{'✓' if supabase_url else '○'} SUPABASE_URL: {supabase_url or '(not set — standalone mode)'}")
        print(f"{'✓' if supabase_anon else '○'} SUPABASE_ANON_KEY: {'***' + supabase_anon[-8:] if supabase_anon else '(not set)'}")
        return

    # Read source files
    app_code = read_file(os.path.join(SRC, "health-companion.jsx"))
    adapter_code = read_file(os.path.join(SRC, "supabase-adapter.js"))

    # Transform for browser
    app_code = app_code.replace(
        'import { useState, useEffect, useRef } from "react";',
        'const { useState, useEffect, useRef } = React;'
    )
    app_code = app_code.replace(
        'export default function AuthGate()',
        'function AuthGate()'
    )

    # Inject Supabase config into adapter
    if supabase_url and supabase_anon:
        adapter_code = adapter_code.replace(
            'const SUPABASE_URL = "";',
            f'const SUPABASE_URL = "{supabase_url}";'
        )
        adapter_code = adapter_code.replace(
            'const SUPABASE_ANON_KEY = "";',
            f'const SUPABASE_ANON_KEY = "{supabase_anon}";'
        )

    # Assemble HTML
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="description" content="Healleo — Healthcare Optimized by You. Your personal AI health team.">
  <meta name="theme-color" content="#f7f7ef">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>Healleo — Healthcare Optimized by You</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='28' font-size='28'>⚕️</text></svg>">
  <style>body{{margin:0;background:#f7f7ef;font-family:sans-serif}}#loading{{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;color:#8a7a4a}}#loading .spinner{{width:32px;height:32px;border:3px solid #e2ddd5;border-top-color:#8a7a4a;border-radius:50%;animation:spin .8s linear infinite}}@keyframes spin{{to{{transform:rotate(360deg)}}}}</style>
</head>
<body>
  <div id="root"><div id="loading"><div class="spinner"></div><p style="margin-top:16px;font-size:14px">Loading Healleo...</p></div></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js" crossorigin></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js" crossorigin></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js" crossorigin></script>

  <script>
    // ═══ HEALLEO CONFIGURATION (injected by build.py from .env) ═══
    window.HEALLEO_API_PROXY = "{proxy_url}";

    const _origFetch = window.fetch;
    window.fetch = function(url, opts) {{
      if (typeof url === 'string' && url.includes('api.anthropic.com') && window.HEALLEO_API_PROXY) {{
        url = url.replace('https://api.anthropic.com', window.HEALLEO_API_PROXY);
      }}
      return _origFetch.call(this, url, opts);
    }};
  </script>

  <script>
    // ═══ SUPABASE ADAPTER {"(configured)" if supabase_url else "(standalone mode — no cloud sync)"} ═══
    ''' + '{adapter_code}' + '''
  </script>

  <script>
    // ═══ STORAGE POLYFILL (localStorage fallback) ═══
    if (typeof window !== 'undefined' && !window.storage) {{
      window.storage = {{
        async get(key) {{ const val = localStorage.getItem(key); return val !== null ? {{ key, value: val }} : null; }},
        async set(key, value) {{ localStorage.setItem(key, value); return {{ key, value }}; }},
        async delete(key) {{ localStorage.removeItem(key); return {{ key, deleted: true }}; }},
        async list(prefix) {{ const keys = []; for (let i = 0; i < localStorage.length; i++) {{ const k = localStorage.key(i); if (!prefix || k.startsWith(prefix)) keys.push(k); }} return {{ keys }}; }}
      }};
    }}
  </script>

  <script type="text/babel" data-type="module">
    ''' + '{app_code}' + '''

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(AuthGate));
  </script>
</body>
</html>'''

    # The f-string above can't directly embed the large code blocks with braces,
    # so we use placeholder replacement instead
    html = html.replace('{adapter_code}', adapter_code)
    html = html.replace('{app_code}', app_code)

    # Write output
    os.makedirs(DIST, exist_ok=True)
    output_path = os.path.join(DIST, "index.html")
    with open(output_path, "w") as f:
        f.write(html)

    # Copy .htaccess
    htaccess_src = os.path.join(DEPLOY, ".htaccess")
    htaccess_dst = os.path.join(DIST, ".htaccess")
    if os.path.exists(htaccess_src):
        import shutil
        shutil.copy2(htaccess_src, htaccess_dst)

    size_kb = len(html) / 1024
    print(f"✅ Built successfully!")
    print(f"   dist/index.html  ({size_kb:.0f} KB)")
    print(f"   dist/.htaccess")
    print(f"")
    print(f"   API Proxy: {proxy_url}")
    print(f"   Supabase:  {'✓ cloud sync enabled' if supabase_url else '○ standalone mode (localStorage)'}")
    print(f"")
    print(f"   Upload dist/ contents to Hostinger public_html/")

if __name__ == "__main__":
    build()
