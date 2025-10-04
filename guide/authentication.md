# Authentication

Secure your API requests with WalletGate API keys.

## Overview

All WalletGate API requests require authentication using **API keys** sent in the `Authorization` header using Bearer token format.

```http
Authorization: Bearer wg_test_abc123xyz789.def456uvw012
```

## API Key Format

API keys follow this structure:

```
wg_<environment>_<publicId>.<secret>
```

**Components:**
- `wg_` - Prefix identifying WalletGate keys
- `<environment>` - Either `test` or `live`
- `<publicId>` - Public identifier (safe to log)
- `.` - Separator
- `<secret>` - Secret portion (never log this!)

**Examples:**
```
wg_test_pk_1a2b3c4d5e6f.sk_9z8y7x6w5v4u3t2s1r
wg_live_pk_9f8e7d6c5b4a.sk_1q2w3e4r5t6y7u8i9o
```

## Getting Your API Keys

### Test Keys (Free Forever)

1. Sign up at [walletgate.app](https://walletgate.app)
2. Navigate to **Keys** section
3. Copy your test key (starts with `wg_test_`)

**Test keys:**
- ✅ Free unlimited use
- ✅ No usage tracking
- ✅ Mock verification (fake data)
- ✅ Perfect for development, CI/CD, staging

### Live Keys (Paid Plans)

1. Upgrade to a paid plan in [Billing](https://walletgate.app/admin)
2. Navigate to **Keys** section
3. Click **"Create Live Key"**
4. Copy and store securely

**Live keys:**
- ✅ Real EU Digital Identity verification
- ✅ Production-ready with SLAs
- ✅ Usage quotas based on your plan
- ✅ Requires active subscription

## Using API Keys

### Basic Authentication

Include your API key in the `Authorization` header:

::: code-group

```typescript [TypeScript/JavaScript]
const response = await fetch('https://api.walletgate.app/v1/verify/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.WALLETGATE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    checks: [{ type: 'age_over', value: 18 }],
  }),
});
```

```python [Python]
import os
import requests

response = requests.post(
    'https://api.walletgate.app/v1/verify/sessions',
    headers={
        'Authorization': f'Bearer {os.getenv("WALLETGATE_API_KEY")}',
        'Content-Type': 'application/json',
    },
    json={
        'checks': [{'type': 'age_over', 'value': 18}],
    },
)
```

```bash [cURL]
curl -X POST https://api.walletgate.app/v1/verify/sessions \
  -H "Authorization: Bearer $WALLETGATE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"checks":[{"type":"age_over","value":18}]}'
```

```php [PHP]
<?php
$apiKey = getenv('WALLETGATE_API_KEY');

$response = file_get_contents(
    'https://api.walletgate.app/v1/verify/sessions',
    false,
    stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                "Authorization: Bearer $apiKey",
                'Content-Type: application/json',
            ],
            'content' => json_encode([
                'checks' => [['type' => 'age_over', 'value' => 18]],
            ]),
        ],
    ])
);
```

```go [Go]
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "os"
)

func main() {
    apiKey := os.Getenv("WALLETGATE_API_KEY")

    body := map[string]interface{}{
        "checks": []map[string]interface{}{
            {"type": "age_over", "value": 18},
        },
    }

    jsonBody, _ := json.Marshal(body)

    req, _ := http.NewRequest(
        "POST",
        "https://api.walletgate.app/v1/verify/sessions",
        bytes.NewBuffer(jsonBody),
    )

    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()
}
```

:::

### With WalletGate SDK

The SDK handles authentication automatically:

```typescript
import { WalletGate } from '@walletgate/eudi';

const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
});

// API key is automatically included in all requests
const session = await client.createSession({
  checks: [{ type: 'age_over', value: 18 }],
});
```

## Environment Variables

**Always store API keys in environment variables, never in code.**

### Local Development

::: code-group

```bash [.env.local]
# Test environment
WALLETGATE_API_KEY=wg_test_your_test_key_here
```

```bash [.env.production]
# Production environment
WALLETGATE_API_KEY=wg_live_your_live_key_here
```

:::

### Framework-Specific

::: code-group

```typescript [Next.js]
// next.config.js
module.exports = {
  env: {
    WALLETGATE_API_KEY: process.env.WALLETGATE_API_KEY,
  },
};

// Use in API routes only (server-side)
// pages/api/verify.ts
const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
});
```

```typescript [Vite/Vue]
// vite.config.ts
export default defineConfig({
  define: {
    'process.env.WALLETGATE_API_KEY': JSON.stringify(process.env.WALLETGATE_API_KEY),
  },
});
```

```typescript [Node.js/Express]
// Load dotenv at app start
require('dotenv').config();

const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
});
```

:::

## Key Management

### Creating Keys

1. Go to your [dashboard](https://walletgate.app/admin) and navigate to **API Keys**
2. Click **"Create New Key"**
3. Select environment (Test or Live)
4. Add description (e.g., "Production API", "Staging Server")
5. Copy key immediately (shown only once!)

### Rotating Keys

Regularly rotate keys for security:

1. Create new API key
2. Deploy new key to production
3. Verify new key works
4. Delete old key

**Recommended rotation schedule:**
- Test keys: As needed (when compromised)
- Live keys: Every 90 days

### Deleting Keys

::: danger Warning
Deleting a key immediately invalidates it. All requests using that key will fail with `401 Unauthorized`.
:::

1. Go to [walletgate.app/admin](https://walletgate.app/admin)
2. Click **"Delete"** next to the key
3. Confirm deletion

**Before deleting:**
- ✅ Ensure key is not used in production
- ✅ Update all systems using the key
- ✅ Have a replacement key ready

## Security Best Practices

### ✅ Do

- **Use environment variables** for all API keys
- **Rotate keys regularly** (every 90 days recommended)
- **Use test keys** for development, CI/CD, and staging
- **Use live keys** only in production
- **Restrict key access** to authorized team members only
- **Log key usage** for audit trails
- **Delete unused keys** immediately
- **Use HTTPS** for all API requests

### ❌ Don't

- **Never commit keys to git** (check with `git grep wg_`)
- **Never expose keys in frontend** code or public repos
- **Never share keys via email** or Slack
- **Never use live keys in test environments**
- **Never log full API keys** (log public ID only)
- **Never reuse compromised keys**

## Error Responses

### Missing API Key

```http
HTTP/1.1 401 Unauthorized
```

```json
{
  "success": false,
  "error": {
    "code": "MISSING_API_KEY",
    "message": "No API key provided. Include Authorization header with Bearer token."
  }
}
```

**Fix:** Include `Authorization: Bearer wg_...` header

### Invalid API Key

```http
HTTP/1.1 401 Unauthorized
```

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API key is invalid or has been revoked."
  }
}
```

**Causes:**
- Key was deleted
- Key format is incorrect
- Key doesn't exist

**Fix:** Verify key in dashboard, create new key if needed

### Wrong Environment

```http
HTTP/1.1 403 Forbidden
```

```json
{
  "success": false,
  "error": {
    "code": "ENVIRONMENT_MISMATCH",
    "message": "This endpoint requires a live API key. You provided a test key."
  }
}
```

**Fix:** Use correct key for environment (test vs live)

### Quota Exceeded

```http
HTTP/1.1 403 Forbidden
```

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly verification quota exceeded. Upgrade your plan or wait for reset.",
    "details": {
      "used": 1000,
      "limit": 1000,
      "resetAt": "2024-02-01T00:00:00Z"
    }
  }
}
```

**Fix:** Upgrade plan or wait for monthly reset

## Monitoring Key Usage

View key usage in your dashboard:

1. Go to [walletgate.app/admin](https://walletgate.app/admin)
2. See usage stats for each key:
   - Total requests this month
   - Successful vs failed requests
   - Last used timestamp
   - Environment (test/live)

**Metrics available:**
- Request count
- Success rate
- Error rate
- Quota usage
- Geographic distribution
- Endpoint usage breakdown

## Advanced: Multiple Keys

Use different keys for different environments or services:

```typescript
// Development
const devClient = new WalletGate({
  apiKey: process.env.WALLETGATE_TEST_KEY,
});

// Staging
const stagingClient = new WalletGate({
  apiKey: process.env.WALLETGATE_STAGING_KEY,
});

// Production
const prodClient = new WalletGate({
  apiKey: process.env.WALLETGATE_LIVE_KEY,
});
```

**Benefits:**
- Isolate environments
- Track usage per service
- Easy key rotation
- Granular access control

## Webhook Signing Secrets

Webhooks use a separate signing secret for HMAC verification.

**Get your webhook secret:**
1. Go to [walletgate.app/admin)
2. Copy **Signing Secret**
3. Store in `WALLETGATE_WEBHOOK_SECRET` env var

**Use in webhook verification:**
```typescript
import crypto from 'crypto';

const signature = req.headers['wg-signature'];
const timestamp = req.headers['wg-timestamp'];
const payload = JSON.stringify(req.body);

const expectedSignature = crypto
  .createHmac('sha256', process.env.WALLETGATE_WEBHOOK_SECRET)
  .update(`${timestamp}.${payload}`)
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).send('Invalid signature');
}
```

[Learn more about webhooks →](/guide/webhooks)

## Compliance & Auditing

### PCI DSS Compliance

If you handle payment data:
- ✅ Store API keys in PCI-compliant secret managers (AWS Secrets Manager, Vault)
- ✅ Rotate keys every 90 days
- ✅ Log all API key usage
- ✅ Restrict access with IAM policies

### GDPR Compliance

- ✅ API keys are not personal data
- ✅ Usage logs may contain user IPs (retain per your DPA)
- ✅ Delete keys when services are decommissioned

### Audit Logs

View all API key operations:
- Key created
- Key deleted
- Key rotated
- Failed authentication attempts

Access logs at: [walletgate.app/admin)

## Troubleshooting

### "API key not found"

**Problem:** Key doesn't exist in database
**Solution:** Verify key is correct, check for typos, create new key if needed

### "API key has been revoked"

**Problem:** Key was deleted
**Solution:** Create new key and update your app

### "Cannot use test key in production"

**Problem:** Using `wg_test_*` key with live data
**Solution:** Use `wg_live_*` key for production

### Rate limit errors

**Problem:** Too many requests
**Solution:** Implement exponential backoff, upgrade plan

## Next Steps

- 🔄 [Verification Flow](/guide/verification-flow)
- 🔔 [Set up Webhooks](/guide/webhooks)
- ⚠️ [Error Handling](/guide/error-handling)
- 📚 [API Reference](/api/overview)

## Need Help?

- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)
- 🔒 Security issues: [security@walletgate.app](mailto:security@walletgate.app)
- 📖 [FAQ](https://walletgate.app#faq)
