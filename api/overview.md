# API Reference

Complete reference for the WalletGate REST API.

## Base URL

```
https://api.walletgate.app
```

## Authentication

All API requests require an API key in the `Authorization` header:

```http
Authorization: Bearer wg_test_your_api_key_here
```

::: tip Getting an API Key
- New? [Create an account](https://walletgate.app) to get a test key (`wg_test_*`, free 100/month)
- Existing user? [Log in](https://walletgate.app/login) to view your keys
- Live keys (`wg_live_*`) are available on all plans (Free tier includes 100/month)
:::

## API Key Format

```
wg_<environment>_<publicId>.<secret>
```

**Examples:**
- Test: `wg_test_abc123xyz.def456uvw`
- Live: `wg_live_xyz789abc.uvw012def`

[Learn about Test vs Live →](/guide/test-vs-live)

## Endpoints

### Create Verification Session

<span class="api-method post">POST</span> `/v1/verify/sessions`

Create a new verification session for a user to complete.

**Request:**

```json
{
  "checks": [
    { "type": "age_over", "value": 18 },
    { "type": "residency_eu" },
    { "type": "identity_verified" }
  ],
  "redirectUrl": "https://your-app.com/success",
  "webhookUrl": "https://your-app.com/webhook",
  "metadata": {
    "userId": "user_123",
    "orderId": "order_456"
  },
  "enableAI": true
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "environment": "test",
    "testMode": true,
    "hostedUrl": "https://api.walletgate.app/verify/550e8400-e29b-41d4-a716-446655440000",
    "verificationUrl": "openid4vp://?client_id=...&presentation_definition=...",
    "nonce": "c7d3f5...",
    "expiresAt": "2024-12-31T23:59:59Z",
    "createdAt": "2024-12-31T12:00:00Z"
  }
}
```

[View detailed endpoint docs →](/api/create-session)

---

### Get Verification Session

<span class="api-method get">GET</span> `/v1/verify/sessions/{sessionId}`

Retrieve the status and results of a verification session.

**Parameters:**
- `sessionId` (path, required): The UUID of the session

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "environment": "test",
    "results": {
      "age_over_18": true,
      "residency_eu": true,
      "identity_verified": true
    },
    "riskScore": 0.05,
    "aiInsights": [
      "Low risk transaction",
      "Identity confidence: 99.5%"
    ],
    "metadata": {
      "userId": "user_123"
    },
    "completedAt": "2024-12-31T12:05:30Z",
    "createdAt": "2024-12-31T12:00:00Z"
  }
}
```

[View detailed endpoint docs →](/api/get-session)

---

### Health Check

<span class="api-method get">GET</span> `/health`

Check API health status (no authentication required).

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2024-12-31T12:00:00Z",
  "version": "1.0.0"
}
```

## Check Types

### Age Verification

Verify that a user is over a specific age.

```json
{ "type": "age_over", "value": 18 }
```

**Supported values:** 13, 16, 18, 21, or any custom age

**Result field:** `age_over_<value>` (e.g., `age_over_18`)

### Residency Verification

Verify that a user is a resident of an EU member state.

```json
{ "type": "residency_eu" }
```

**Result field:** `residency_eu`

### Identity Verification

Verify that the user's identity has been confirmed.

```json
{ "type": "identity_verified" }
```

**Result field:** `identity_verified`

## Verification Status

| Status | Description |
|--------|-------------|
| `pending` | Session created, awaiting user action |
| `in_progress` | User is currently verifying |
| `completed` | Verification successfully completed |
| `failed` | Verification failed |
| `expired` | Session expired (default: 30 minutes) |
| `canceled` | User cancelled verification |

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid API key) |
| 403 | Forbidden (quota exceeded) |
| 404 | Resource not found |
| 429 | Too many requests (rate limited) |
| 500 | Internal server error |

## Error Response Format

```json
{
  "error": "Invalid request data",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "path": ["checks", 0, "type"],
      "message": "Invalid enum value. Expected 'age_over' | 'residency_eu' | 'identity_verified'"
    }
  ]
}
```

[View all error codes →](/api/error-codes)

## Rate Limits

All plans share the same per-key rate limit. Monthly verification quotas vary by plan:

| Plan | Per-Key Rate Limit | Live Verifications/Month |
|------|-------------------|--------------------------|
| **Free** | 60 req/min | 100 |
| **Pro** | 60 req/min | 1,000 |
| **Business** | 60 req/min | 10,000 |
| **Enterprise** | Custom | Custom |

Test verifications are **unlimited** on all plans.

Rate limit headers are included in all responses:

```http
RateLimit-Limit: 300
RateLimit-Remaining: 299
RateLimit-Reset: 60
Retry-After: 45
```

When rate limited (HTTP 429), the response includes a `Retry-After` header and `retryAfterSeconds` in the body.

## Webhooks

Receive real-time notifications when verification events occur.

[Learn about webhooks →](/api/webhooks)

## Interactive API Explorer

Try the API directly in your browser with our interactive Swagger UI:

[Open API Explorer →](/api/interactive)

## SDK Integration

For easier integration, use our TypeScript SDK:

```typescript
import { WalletGate } from '@walletgate/eudi';

const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
});
```

[View SDK documentation →](/sdk/installation)

## Need Help?

- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)
- 📖 Check the [FAQ](https://walletgate.app#faq)
- 💬 [Book a demo](mailto:hello@walletgate.app)
