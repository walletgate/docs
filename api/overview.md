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
    "verificationUrl": "openid4vp://verify?request_uri=https://...",
    "qrCode": "data:image/png;base64,...",
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
| `expired` | Session expired (15 minutes timeout) |
| `cancelled` | User cancelled verification |

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
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid check type",
    "field": "checks[0].type",
    "details": {
      "allowed": ["age_over", "residency_eu", "identity_verified"]
    }
  }
}
```

[View all error codes →](/api/error-codes)

## Rate Limits

Rate limits are based on your plan:

| Plan | Requests/Second | Requests/Month |
|------|----------------|----------------|
| **Free Trial** | No limit | 100 (test only) |
| **Starter** | 10/s | 1,000 |
| **Growth** | 50/s | 10,000 |
| **Scale** | 200/s | 50,000 |
| **Enterprise** | Custom | Custom |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1609459200
```

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
- 💬 [Book a demo](mailto:henry@walletgate.app)
