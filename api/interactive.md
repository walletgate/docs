# Interactive API Explorer

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Load Swagger UI CSS
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css'
  document.head.appendChild(link)

  // Load Swagger UI JS
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js'
  script.onload = () => {
    window.SwaggerUIBundle({
      url: '/openapi.yaml',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        window.SwaggerUIBundle.presets.apis,
        window.SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: 'BaseLayout',
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai'
      }
    })
  }
  document.body.appendChild(script)
})
</script>

<style scoped>
#swagger-ui {
  margin-top: 2rem;
}
</style>

Try the WalletGate API directly in your browser. No code required!

::: tip Try it Live
Use your test API key (`wg_test_*`) to make real API calls directly from this page. Click "Authorize" and paste your key.
:::

<div id="swagger-ui"></div>

## Quick Start

1. **Get Your API Key**: Sign up at [walletgate.app](https://walletgate.app/register)
2. **Click "Authorize"** above (green button)
3. **Paste Your Key**: Use format `Bearer wg_test_your_key_here`
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
