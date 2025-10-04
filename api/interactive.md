# Interactive API Explorer

<script setup>
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const adminEnabled = ref(false)
const prodEnabled = ref(false)
const softWarning = ref('')
const adminCookie = ref('')
const helperOpen = ref(false)
const statusMsg = ref('')
const statusTone = ref('info')
const detectLabel = ref('Detect')
const pasteLabel = ref('Paste')
const copyLabel = ref('Copy')
const authorizeLabel = ref('Open Authorize')

// Legacy copy fallback helper (available to template)
const legacyCopy = (text) => {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

function persistFlags() {
  try {
    localStorage.setItem('wg_docs_enable_admin_try', adminEnabled.value ? '1' : '0')
    localStorage.setItem('wg_docs_enable_prod_try', prodEnabled.value ? '1' : '0')
  } catch {}
}

function readFlags() {
  try {
    adminEnabled.value = localStorage.getItem('wg_docs_enable_admin_try') === '1'
    prodEnabled.value = localStorage.getItem('wg_docs_enable_prod_try') === '1'
  } catch {}
}

onMounted(async () => {
  readFlags()
  // Load Swagger UI CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css'
  document.head.appendChild(link)

  // Helper to load a script tag
  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
  })

  // Load dependencies (Swagger UI + js-yaml for spec mutation)
  await loadScript('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js')
  await loadScript('https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js')

  // Fetch and prepare spec
  const specUrl = withBase('/openapi.yaml')
  const res = await fetch(specUrl)
  const yamlText = await res.text()
  const spec = window.jsyaml.load(yamlText)

  // Playground mode: prefer localhost server by default
  try {
    const playground = localStorage.getItem('wg_docs_playground') === '1'
    if (playground && Array.isArray(spec.servers)) {
      const dev = spec.servers.find((s) => String(s.url).includes('localhost:4000'))
      const prod = spec.servers.find((s) => String(s.url).includes('api.walletgate.app'))
      const others = spec.servers.filter((s) => s !== dev && s !== prod)
      spec.servers = [
        dev || { url: 'http://localhost:4000', description: 'Development' },
        prod || { url: 'https://api.walletgate.app', description: 'Production' },
        ...others,
      ]
    }
  } catch {}

  // Init Swagger UI
  window.SwaggerUIBundle({
    spec,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      window.SwaggerUIBundle.presets.apis,
      window.SwaggerUIBundle.SwaggerUIStandalonePreset
    ],
    layout: 'BaseLayout',
    tryItOutEnabled: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: 0,
    supportedSubmitMethods: ['get','post','patch','delete'],
    syntaxHighlight: {
      activate: true,
      theme: 'monokai'
    },
    requestInterceptor: (req) => {
      try {
        // Ensure relative URLs parse by providing base
        const url = new URL(req.url, window.location.origin)
        const isProd = url.hostname === 'api.walletgate.app'

        // Block production calls unless explicitly enabled
        if (isProd && !prodEnabled.value) {
          throw new Error('Production calls are disabled in docs. Toggle "Enable production" to proceed.')
        }

        // Block admin endpoints unless explicitly enabled
        if (/\/admin\//.test(url.pathname) && !adminEnabled.value) {
          throw new Error('Admin endpoints are disabled in docs. Toggle "Enable admin" to proceed.')
        }

        // Require test keys for public API calls in docs
        const authHeader = Object.entries(req.headers || {}).find(([k]) => k.toLowerCase() === 'authorization')?.[1]
        if (/^\/v1\//.test(url.pathname)) {
          if (!authHeader || !/^Bearer wg_test_/i.test(String(authHeader))) {
            throw new Error('Use a test API key (Bearer wg_test_...) for Try it out in docs.')
          }
        }

        // Basic payload guard (16 KB)
        if (req.body && typeof req.body === 'string' && req.body.length > 16384) {
          throw new Error('Request body too large for docs Try it out (max 16 KB).')
        }

        // Limit checks array length client-side to reduce abuse via docs
        if (/\/v1\/verify\/sessions$/.test(url.pathname) && req.body) {
          try {
            const parsed = JSON.parse(req.body)
            if (Array.isArray(parsed?.checks) && parsed.checks.length > 8) {
              throw new Error('Too many checks in a single request (max 8)')
            } else if (Array.isArray(parsed?.checks) && parsed.checks.length > 5) {
              // Soft nudge (non-blocking)
              softWarning.value = 'Heads up: requests with >5 checks may be slower or rejected by stricter servers.'
              setTimeout(() => { if (softWarning.value) softWarning.value = '' }, 4000)
            }
          } catch {}
        }

        // Token-bucket style rate limit: 10 requests/60s per browser
        try {
          const key = 'wg_docs_req_times'
          const now = Date.now()
          const windowMs = 60 * 1000
          let arr = []
          try { arr = JSON.parse(localStorage.getItem(key) || '[]') } catch {}
          // keep only timestamps within the last minute
          arr = arr.filter((t) => now - t < windowMs)
          if (arr.length >= 10) {
            const retryAfter = Math.ceil((windowMs - (now - arr[0])) / 1000)
            throw new Error(`Docs rate limit reached (10 req/min). Try again in ${retryAfter}s.`)
          }
          arr.push(now)
          try { localStorage.setItem(key, JSON.stringify(arr)) } catch {}
        } catch (e) {
          throw e
        }
      } catch (e) {
        // Surface message in UI by throwing; SwaggerUI shows it in the red error box
        throw e
      }
      return req
    }
  })
})

// Robustly open Swagger's Authorize modal
function openAuthorize() {
  try {
    authorizeLabel.value = 'Opening…'
    const selectors = [
      '.swagger-ui .auth-wrapper .authorize',
      '.swagger-ui .topbar .authorize',
      '.swagger-ui .btn.authorize',
      '#swagger-ui .authorize'
    ]
    const clickAttempt = (tries = 0) => {
      for (const sel of selectors) {
        const btn = document.querySelector(sel)
        if (btn && 'click' in btn) {
          btn.click()
          authorizeLabel.value = 'Open Authorize'
          return
        }
      }
      if (tries < 10) {
        setTimeout(() => clickAttempt(tries + 1), 150)
      } else {
        authorizeLabel.value = 'Open Authorize'
        const el = document.querySelector('#swagger-ui')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    clickAttempt()
  } catch {
    authorizeLabel.value = 'Open Authorize'
  }
}
</script>

<style scoped>
#swagger-ui {
  margin-top: 2rem;
}
.wg-guard {
  display: flex; gap: 1rem; align-items: center; margin: 1rem 0; padding: .75rem 1rem; border: 1px solid var(--vp-c-divider); border-radius: .5rem; background: var(--vp-c-bg-soft); flex-wrap: wrap;
}
.wg-guard label { display: inline-flex; align-items: center; gap: .5rem; font-weight: 500; }
.wg-guard small { color: var(--vp-c-text-2); }
.wg-soft { margin: .5rem 0 0; padding: .5rem .75rem; border-left: 4px solid #f59e0b; background: #fff7ed; color: #92400e; border-radius: .25rem; font-size: .9rem; }
.wg-img { display:block; max-width: 100%; height: auto; border: 1px solid var(--vp-c-divider); border-radius: .5rem; background: #fff; }
.wg-helper { margin-top: .75rem; padding: .9rem 1rem; border: 1px solid var(--vp-c-divider); border-radius: .75rem; background: var(--vp-c-bg-soft); }
.wg-details { overflow: hidden; }
.wg-summary { list-style: none; font-weight:700; cursor: pointer; outline: none; margin: 0; color: var(--vp-c-text-1); }
.wg-summary:hover { color: var(--vp-c-brand-1); }
.wg-summary::-webkit-details-marker { display:none; }
.wg-summary { position: relative; padding-left: 1rem; }
.wg-summary::before { content: '\25B6'; position: absolute; left: 0; top: .15rem; font-size: .85rem; color: #64748b; transition: transform .2s ease; }
.wg-details[open] .wg-summary::before { transform: rotate(90deg); }
.wg-helper-row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.wg-input {
  flex: 1 1 320px;
  min-width: 220px;
  max-width: 640px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  padding: .55rem .7rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: .5rem;
  background: #fff;
  word-break: break-all;
  overflow-wrap: anywhere;
  color: var(--vp-c-text-1) !important;
  -webkit-text-fill-color: var(--vp-c-text-1) !important;
  opacity: 1 !important;
  caret-color: var(--vp-c-brand-1);
}
.wg-input::placeholder { color: var(--vp-c-text-2); opacity: .9; }
.wg-btn { display: inline-flex; align-items: center; gap: .35rem; padding: .55rem .9rem; border: 1px solid var(--vp-c-divider); border-radius: .6rem; background: var(--vp-c-bg); cursor: pointer; font-weight: 700; font-size: .85rem; line-height: 1; box-shadow: 0 1px 1px rgba(0,0,0,.04); transition: background .15s ease, color .15s ease, border-color .15s ease; }
.wg-btn--primary { background: #61affe; border-color: #61affe; color: #fff; }
.wg-btn--primary:hover { background: #4b96e6; border-color: #4b96e6; }
.wg-btn--success { background: #49cc90; border-color: #49cc90; color: #ffffff; }
.wg-btn--success:hover { background: #3ab97f; border-color: #3ab97f; color: #062016; }
.wg-btn--info { background: #2dd4bf; border-color: #2dd4bf; color: #052e2b; }
.wg-btn--info:hover { background: #14b8a6; border-color: #14b8a6; color: #03201e; }
.wg-btn--ghost { background: #fff; color: #111827; }
.wg-btn--ghost:hover { background: var(--vp-c-bg-soft); color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-2); }
.wg-btn--lg { font-size: .95rem; padding: .7rem 1rem; }
.wg-btn:disabled { opacity: .5; cursor: not-allowed; }
.wg-copy-ok { color: #065f46; font-size: .85rem; }
.wg-status { margin-top:.5rem; font-size:.9rem; }
.wg-status.info { color:#0c4a6e; }
.wg-status.success { color:#065f46; }
.wg-status.warn { color:#92400e; }
.wg-status.error { color:#7f1d1d; }

@media (max-width: 560px) {
  .wg-input { flex-basis: 100%; min-width: 100%; }
  .wg-btn--lg { width: 100%; justify-content: center; }
}

@media (prefers-color-scheme: dark) {
  .wg-img { background: transparent; }
  .wg-helper { background: var(--vp-c-bg-soft); border-color: var(--vp-c-divider); }
  .wg-input { background: var(--vp-c-bg); color: var(--vp-c-text-1) !important; border-color: var(--vp-c-divider); -webkit-text-fill-color: var(--vp-c-text-1) !important; opacity: 1 !important; }
  .wg-input::placeholder { color: var(--vp-c-text-2); opacity: .9; }
  .wg-btn { background: var(--vp-c-bg); color: var(--vp-c-text-1); }
  .wg-btn--success { color: #0b1f17; }
  .wg-summary::before { color: #94a3b8; }
}

/* VitePress uses a .dark class toggle as well; ensure overrides apply */
.dark .wg-helper { background: var(--vp-c-bg-soft); border-color: var(--vp-c-divider); }
.dark .wg-input { background: var(--vp-c-bg); color: var(--vp-c-text-1); border-color: var(--vp-c-divider); }
.dark .wg-input::placeholder { color: var(--vp-c-text-2); opacity: .9; }
.dark .wg-btn { background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.dark .wg-summary { color: var(--vp-c-text-1); }
.dark .wg-summary:hover { color: var(--vp-c-brand-1); }
</style>

Try the WalletGate API directly in your browser. No code required!

::: tip Try it Live
Use your test API key (`wg_test_*`) to make real API calls directly from this page.

1) Click the green "Authorize" button
2) In the `ApiKeyAuth` field, paste your key value exactly as-is (e.g. `wg_test_abc123`)
3) Ensure the server is set to `https://api.walletgate.app`
4) Expand an endpoint and click "Try it out"
:::

## Before You Start (Auth Quick Guide)

To use "Try it out", provide credentials in the Authorize dialog:

- Public API (/v1/*): ApiKeyAuth only
  - Click Authorize → under "ApiKeyAuth" paste just your key value (example: `wg_test_abc123` — do not include `Bearer`).
  - Don’t have a key? Create an account at https://walletgate.app. A test key (100/mo) is shown once after sign‑up.

- Admin API (/admin/*): AdminSession cookie
  - Sign in to the admin console (local or hosted). After logging in, open DevTools → Application → Cookies and copy the value of `wg_admin_session`.
  - Click Authorize → under "AdminSession" paste that cookie value. For mutating admin calls, use the returned `csrfToken` from `/admin/auth/login` or `/admin/auth/status` as header `x-csrf-token` when prompted.

Notes
- The docs UI only accepts test keys (`wg_test_*`) for /v1/* calls.
- Admin endpoints and production calls are disabled by default; enable them with the toggles above only when needed.

### Where to find `wg_admin_session` (screenshot)

If you logged into the admin console in another tab, open DevTools → Application → Cookies, select the site, then copy the value of `wg_admin_session`.

<img src="/wg-admin-session.svg" alt="DevTools showing wg_admin_session cookie and its value" class="wg-img" />

<details class="wg-helper wg-details">
  <summary class="wg-summary">AdminSession helper</summary>
  <div class="wg-helper-row" style="margin-top:.5rem">
    <input class="wg-input" v-model="adminCookie" placeholder="wg_admin_session value (auto-detected when possible, otherwise paste here)" />
    <button class="wg-btn wg-btn--info" @click="() => { try { detectLabel.value='Detecting…'; const m = document.cookie.match(/(?:^|; )wg_admin_session=([^;]+)/); if (m) { adminCookie.value = decodeURIComponent(m[1]); statusMsg.value='Detected wg_admin_session from current origin.'; statusTone.value='success'; detectLabel.value='Detected ✓'; } else { statusMsg.value='No wg_admin_session cookie on this origin. Log into the admin app here, or paste it manually.'; statusTone.value='warn'; detectLabel.value='Not found'; } setTimeout(()=>detectLabel.value='Detect', 2000); } catch { statusMsg.value='Unable to read cookies in this context.'; statusTone.value='error'; detectLabel.value='Detect'; } }">{{ detectLabel }}</button>
    <button class="wg-btn wg-btn--primary" @click="async () => { try { pasteLabel.value='Pasting…'; const txt = await navigator.clipboard.readText(); if (txt) { adminCookie.value = txt.trim(); statusMsg.value='Pasted from clipboard.'; statusTone.value='success'; pasteLabel.value='Pasted'; } else { statusMsg.value='Clipboard empty.'; statusTone.value='warn'; pasteLabel.value='Empty'; } setTimeout(()=>pasteLabel.value='Paste', 1800); } catch { statusMsg.value='Clipboard read not permitted by the browser.'; statusTone.value='error'; pasteLabel.value='Paste'; } }">{{ pasteLabel }}</button>
    <button class="wg-btn wg-btn--success" :disabled="!adminCookie || adminCookie.trim().length===0" @click="async () => { try { copyLabel.value='Copying…'; let ok = false; try { await navigator.clipboard.writeText(adminCookie); ok = true; } catch { ok = legacyCopy(adminCookie); } copyLabel.value='Copied'; if (ok) { statusMsg.value='Copied to clipboard.'; statusTone.value='success'; } else { statusMsg.value='Clipboard copy failed.'; statusTone.value='error'; } setTimeout(()=>copyLabel.value='Copy', 2600); } catch { copyLabel.value='Copy'; } }">{{ copyLabel }}</button>
    <button class="wg-btn wg-btn--primary wg-btn--lg" @click="openAuthorize">{{ authorizeLabel }}</button>
  </div>
  <div v-if="statusMsg" :class="'wg-status ' + statusTone" role="status" aria-live="polite">{{ statusMsg }}</div>
  <small>Then paste into Authorize → AdminSession (cookie). For writes, include header <code>x-csrf-token</code> returned by <code>/admin/auth/login</code> or <code>/admin/auth/status</code>.</small>
  <div style="margin-top:.5rem; font-size:.9rem; color:var(--vp-c-text-2)">
    <strong>What this helper does:</strong>
    <ul style="margin:.3rem 0 0 .9rem; padding:0;">
      <li>Detect — grabs <code>wg_admin_session</code> from cookies (same-origin only)</li>
      <li>Paste/Copy — move cookie value to/from your clipboard safely</li>
      <li>Open Authorize — jumps you straight to Swagger’s auth modal</li>
    </ul>
    It never sends your cookie to our servers; everything runs in your browser.
  </div>
</details>

<div class="wg-guard">
  <label>
    <input type="checkbox" v-model="prodEnabled" @change="persistFlags()">
    Enable production calls
  </label>
  <label>
    <input type="checkbox" v-model="adminEnabled" @change="persistFlags()">
    Enable admin endpoints
  </label>
  <label>
    <input type="checkbox" @change="($event) => { try { localStorage.setItem('wg_docs_playground', $event.target.checked ? '1' : '0'); location.reload(); } catch {} }">
    Playground mode (prefer localhost server)
  </label>
  <small>For safety, docs only allow test keys (wg_test_…) and block large payloads.</small>
  <div style="flex:1"></div>
</div>

<div v-if="softWarning" class="wg-soft">{{ softWarning }}</div>

<div id="swagger-ui"></div>

## Quick Start

1. **Get Your API Key**: Sign up at [walletgate.app](https://walletgate.app)
2. **Click "Authorize"** above (green button)
3. **Paste Your Key** in `ApiKeyAuth` (just `wg_test_your_key_here` — no Bearer prefix)
4. **Try Endpoints**: Expand any endpoint and click "Try it out"

## Example Request

Expand the `POST /v1/verify/sessions` endpoint and try this payload:

```json
{
  "checks": [
    { "type": "age_over", "value": 18 },
    { "type": "residency_eu" }
  ]
}
```

## Need Help?

- 📖 [View API Overview](/api/overview)
- 📘 [Read Getting Started Guide](/guide/getting-started)
- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)

## Troubleshooting CORS (Try It Out)

If the in‑browser "Try it out" fails with a CORS error, verify your Origin is allowed by the API.

Run this preflight check (replace YOUR_ORIGIN with your site, e.g. https://docs.walletgate.app):

```bash
curl -i -X OPTIONS \
  https://api.walletgate.app/v1/verify/sessions \
  -H "Origin: YOUR_ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

Expected:
- 200 OK or 204 No Content
- An `Access-Control-Allow-Origin: YOUR_ORIGIN` header

If not present, add YOUR_ORIGIN to the backend `CORS_ORIGINS` environment variable and redeploy the API.
