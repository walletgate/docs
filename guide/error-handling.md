# Error Handling

Handle errors gracefully and provide clear feedback to users.

## Error Response Format

All WalletGate API errors follow this consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "field": "fieldName",  // Optional: which field caused the error
    "details": {           // Optional: additional context
      "key": "value"
    }
  }
}
```

## HTTP Status Codes

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| `200` | Success | Request completed successfully |
| `201` | Created | Resource created (e.g., new session) |
| `400` | Bad Request | Invalid input or validation error |
| `401` | Unauthorized | Missing or invalid API key |
| `403` | Forbidden | Quota exceeded or insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Something went wrong on our end |

## Common Errors

### Authentication Errors

#### Missing API Key

```json
{
  "success": false,
  "error": {
    "code": "MISSING_API_KEY",
    "message": "No API key provided. Include Authorization header with Bearer token."
  }
}
```

**Fix:**
```typescript
// ✅ Correct
headers: {
  'Authorization': `Bearer ${apiKey}`,
}

// ❌ Wrong - missing header
headers: {}
```

#### Invalid API Key

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
- Typo in key
- Key format incorrect

**Fix:** Verify key in [dashboard](https://walletgate.app/admin)

### Validation Errors

#### Invalid Check Type

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

**Fix:**
```typescript
// ✅ Correct
checks: [{ type: 'age_over', value: 18 }]

// ❌ Wrong
checks: [{ type: 'age_check', value: 18 }]
```

#### Missing Required Field

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "checks is required",
    "field": "checks"
  }
}
```

#### Invalid URL Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid redirect URL",
    "field": "redirectUrl",
    "details": {
      "value": "not-a-url",
      "expected": "Valid HTTPS URL"
    }
  }
}
```

### Quota Errors

#### Monthly Limit Exceeded

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly verification quota exceeded. Upgrade your plan or wait for reset.",
    "details": {
      "used": 1000,
      "limit": 1000,
      "resetAt": "2024-02-01T00:00:00Z",
      "upgradeUrl": "https://walletgate.app/admin"
    }
  }
}
```

**Fix:** Upgrade plan or wait for monthly reset

### Rate Limit Errors

#### Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please slow down.",
    "details": {
      "limit": 10,
      "remaining": 0,
      "resetAt": 1704067260000
    }
  }
}
```

**Headers included:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067260
```

**Fix:** Implement exponential backoff

### Resource Errors

#### Session Not Found

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Verification session not found or expired."
  }
}
```

**Causes:**
- Session ID doesn't exist
- Session expired (15 min timeout)
- Typo in session ID

### Verification Errors

#### User Declined

```json
{
  "success": false,
  "error": {
    "code": "USER_DECLINED",
    "message": "User cancelled verification in wallet."
  }
}
```

#### Session Expired

```json
{
  "success": false,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Verification session expired after 15 minutes."
  }
}
```

#### Invalid Credentials

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Certificate validation failed",
    "details": {
      "reason": "Certificate revoked by issuer",
      "issuer": "DE Trust Service Provider"
    }
  }
}
```

## Error Handling Patterns

### Basic Try-Catch

```typescript
import { WalletGate } from '@walletgate/eudi';

const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
});

try {
  const session = await client.createSession({
    checks: [{ type: 'age_over', value: 18 }],
  });

  console.log('Session created:', session.id);
} catch (error) {
  if (error.response) {
    // API returned an error response
    const { code, message } = error.response.data.error;

    switch (code) {
      case 'QUOTA_EXCEEDED':
        console.error('Quota exceeded. Upgrade plan.');
        break;

      case 'INVALID_API_KEY':
        console.error('Invalid API key. Check configuration.');
        break;

      default:
        console.error(`API error: ${message}`);
    }
  } else {
    // Network error or other issue
    console.error('Network error:', error.message);
  }
}
```

### Retry with Exponential Backoff

```typescript
async function createSessionWithRetry(
  checks: any[],
  maxRetries: number = 3
): Promise<VerificationSession> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.createSession({ checks });
    } catch (error) {
      lastError = error;

      // Don't retry on validation errors or quota errors
      if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
        throw error;
      }
      if (error.response?.data?.error?.code === 'QUOTA_EXCEEDED') {
        throw error;
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### User-Friendly Error Messages

```typescript
function getUser FriendlyErrorMessage(error: any): string {
  const errorCode = error.response?.data?.error?.code;

  const messages: Record<string, string> = {
    QUOTA_EXCEEDED: 'We\'ve reached our verification limit. Please try again later or contact support.',
    USER_DECLINED: 'Verification was cancelled. Please try again when you\'re ready.',
    SESSION_EXPIRED: 'Verification link expired. Click below to generate a new one.',
    INVALID_CREDENTIALS: 'We couldn\'t verify your credentials. Please ensure your wallet is up to date.',
    RATE_LIMIT_EXCEEDED: 'Too many attempts. Please wait a moment and try again.',
  };

  return messages[errorCode] || 'Something went wrong. Please try again or contact support.';
}

// Usage in UI
try {
  await createSession();
} catch (error) {
  showErrorToast(getUserFriendlyErrorMessage(error));
}
```

## Frontend Error Handling

### React Example

```typescript
import { useState } from 'react';

function VerificationButton() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/verify/create', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error.message);
      }

      const { sessionId } = await response.json();
      // Show QR code...
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Creating session...' : 'Verify Age'}
      </button>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
```

## Logging Best Practices

### What to Log

```typescript
// ✅ Log these
console.error('Verification failed:', {
  sessionId: session.id,
  errorCode: error.code,
  timestamp: new Date().toISOString(),
  userId: metadata.userId, // If applicable
});

// ❌ Don't log these
console.error('Error:', {
  apiKey: process.env.WALLETGATE_API_KEY, // NEVER log API keys!
  rawCredentials: credentials, // NEVER log PII!
});
```

### Structured Logging

```typescript
import pino from 'pino';

const logger = pino();

try {
  await client.createSession({ checks });
} catch (error) {
  logger.error({
    msg: 'Session creation failed',
    errorCode: error.response?.data?.error?.code,
    errorMessage: error.response?.data?.error?.message,
    endpoint: '/v1/verify/sessions',
    method: 'POST',
    timestamp: Date.now(),
  });
}
```

## Monitoring & Alerts

### Set Up Alerts

Monitor these error rates:

- **High priority:**
  - Authentication errors > 5%
  - Internal server errors > 0.1%
  - Quota exceeded (upgrade needed)

- **Medium priority:**
  - Validation errors > 10%
  - Rate limit errors > 1%

- **Low priority:**
  - User declined > 20%
  - Session expired > 10%

### Error Rate Calculation

```typescript
const errorRate = (failedRequests / totalRequests) * 100;

if (errorRate > 5) {
  alertTeam({
    message: `High error rate: ${errorRate}%`,
    severity: 'high',
    details: {
      totalRequests,
      failedRequests,
      timeWindow: '5 minutes',
    },
  });
}
```

## Complete Error Code Reference

| Code | HTTP | Description | Action |
|------|------|-------------|--------|
| `MISSING_API_KEY` | 401 | No Authorization header | Add API key |
| `INVALID_API_KEY` | 401 | Key invalid or revoked | Check dashboard |
| `QUOTA_EXCEEDED` | 403 | Monthly limit reached | Upgrade plan |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Implement backoff |
| `VALIDATION_ERROR` | 400 | Invalid input | Fix request body |
| `SESSION_NOT_FOUND` | 404 | Session doesn't exist | Check session ID |
| `SESSION_EXPIRED` | 400 | Session timed out (15min) | Create new session |
| `USER_DECLINED` | 400 | User cancelled in wallet | Retry |
| `INVALID_CREDENTIALS` | 400 | Certificate validation failed | Check wallet |
| `INTERNAL_ERROR` | 500 | Server error | Retry, contact support |

[View interactive API reference →](/api/error-codes)

## Testing Error Scenarios

### Force Errors in Test Mode

```typescript
// Force validation error
await client.createSession({
  checks: [{ type: 'invalid_type', value: 18 }], // Wrong type
});

// Force session not found
await client.getSession('nonexistent-session-id');
```

### Simulate Network Errors

```typescript
// Simulate timeout
const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
  timeout: 1, // 1ms timeout - will always fail
});

// Simulate network error
// (disconnect internet, use invalid base URL, etc.)
```

## Next Steps

- 🔄 [Verification Flow](/guide/verification-flow)
- 🔐 [Authentication](/guide/authentication)
- 🔔 [Webhooks](/guide/webhooks)
- 📚 [API Reference](/api/overview)

## Need Help?

- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)
- 📖 [FAQ](https://walletgate.app#faq)
- 💬 [Book a demo](mailto:hello@walletgate.app)
