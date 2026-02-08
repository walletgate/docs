# Test vs Live Environments

WalletGate provides two distinct environments to support your entire development workflow: **Test** for development and **Live** for production.

## Overview

| Feature | Test Environment | Live Environment |
|---------|-----------------|------------------|
| **API Key Prefix** | `wg_test_*` | `wg_live_*` |
| **Trust Infrastructure** | Mock TSL (fake certificates) | Real EU LOTL |
| **Verification** | Simulated | Real credentials |
| **Usage Tracking** | None | Full tracking |
| **Cost** | Free forever | Based on your plan |
| **Rate Limits** | None | Based on your plan |

## Test Environment 🧪

### Purpose

The test environment is designed for **safe development and testing** without using real EU Digital Identity credentials.

### Key Characteristics

- **API Keys**: Start with `wg_test_`
- **Mock TSL**: Uses fake Trust Service Lists with synthetic certificates
- **No Usage Limits**: Unlimited verifications
- **Free Forever**: Never counts towards billing
- **Clear Warnings**: All responses include test mode indicators
- **Perfect For**: Development, CI/CD, staging environments, demos

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "completed",
    "environment": "test",
    "testMode": true,
    "warning": "⚠️ THIS IS A TEST VERIFICATION - NOT A REAL CREDENTIAL CHECK",
    "results": {
      "age_over_18": true,
      "residency_eu": true
    }
  }
}
```

### Test Mode Indicators

Every test response includes:

- `environment: "test"` field
- `testMode: true` flag
- Warning message in responses

### Use Cases

✅ **Do use test keys for:**
- Local development
- CI/CD pipelines
- Staging environments
- Integration testing
- Demo applications
- Learning the API

❌ **Don't use test keys for:**
- Production applications
- Real user verifications
- Compliance requirements
- Legal verification needs

### Sandbox Toolkit

Use the dashboard playground to simulate wallet flows before EUDI rollouts:

- 20+ pre-built test scenarios (Pro+): pass/fail, expired, revoked, and network-error simulations.
- Build your own scenarios (Business): create reusable custom scenarios for your own checks.
- Compliance report (Business): download an HTML readiness report for audits.
- Webhook inspector (Pro+): review deliveries, payloads, and retry failed webhooks.

## Live Environment 🚀

### Purpose

The live environment uses **real EU Digital Identity infrastructure** for production-grade verification.

### Key Characteristics

- **API Keys**: Start with `wg_live_`
- **Real EU LOTL**: Official List of Trusted Lists from EU Commission
- **Real Credentials**: Validates actual government-issued credentials
- **Usage Quotas**: Based on your subscription plan
- **Production SLA**: 99.9% uptime guarantee
- **Paid Plans Only**: Requires active subscription

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "987fcdeb-51a9-43f8-b456-426614174000",
    "status": "completed",
    "environment": "live",
    "results": {
      "age_over_18": true,
      "residency_eu": true,
      "identity_verified": true
    },
    "riskScore": 0.05,
    "aiInsights": ["Low risk transaction", "Identity confidence: 99.5%"]
  }
}
```

### Security Features

- **Certificate Chain Validation**: Full X.509 chain verification
- **Revocation Checking**: Real-time OCSP/CRL checks
- **Cryptographic Validation**: RSA-PSS, ECDSA signature verification
- **Audit Trail**: Complete logs with IP tracking
- **Compliance**: Full eIDAS 2.0 and GDPR compliance

### Use Cases

✅ **Do use live keys for:**
- Production applications
- Real user verifications
- Legal compliance
- Age-restricted services
- KYC/AML requirements
- Government integrations

❌ **Don't use live keys for:**
- Development
- Testing
- Staging environments
- Demo applications

## Switching Between Environments

### Code-Based Switching

Use environment variables to switch between test and live:

```typescript
import { WalletGate } from '@walletgate/eudi';

const apiKey = process.env.NODE_ENV === 'production'
  ? process.env.WALLETGATE_LIVE_KEY  // wg_live_...
  : process.env.WALLETGATE_TEST_KEY; // wg_test_...

const client = new WalletGate({ apiKey });
```

### Environment Configuration

::: code-group

```bash [.env.development]
WALLETGATE_API_KEY=wg_test_your_test_key_here
```

```bash [.env.production]
WALLETGATE_API_KEY=wg_live_your_live_key_here
```

:::

### Zero Code Changes

When switching from test to live, you **don't need to change any code**. Just swap the API key:

```typescript
// This code works in both environments
const session = await client.createSession({
  checks: [{ type: 'age_over', value: 18 }],
});
```

## Best Practices

### Development Workflow

1. **Start with Test**: Build and test your integration with test keys
2. **Staging**: Use test keys in staging to validate deployment
3. **Production**: Only use live keys in production with real users

### Key Management

```typescript
// ✅ Good: Environment-based keys
const apiKey = process.env.WALLETGATE_API_KEY;

// ❌ Bad: Hardcoded keys
const apiKey = 'wg_live_abc123...'; // Never do this!
```

### Security

::: danger Never Expose Live Keys
- ❌ Don't commit live keys to git
- ❌ Don't use live keys in client-side code
- ❌ Don't share live keys via email/Slack
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Store in secure secret management
:::

### Testing Strategy

```typescript
// Use test keys for unit/integration tests
describe('Verification Flow', () => {
  const testClient = new WalletGate({
    apiKey: 'wg_test_for_ci_testing',
  });

  it('should create verification session', async () => {
    const session = await testClient.createSession({
      checks: [{ type: 'age_over', value: 18 }],
    });

    expect(session.environment).toBe('test');
    expect(session.testMode).toBe(true);
  });
});
```

## Environment Isolation

### Complete Separation

- **Separate Databases**: Test and live data never mix
- **Separate Keys**: Test keys cannot access live verification
- **Separate Audit Logs**: Independent tracking and compliance
- **Separate Rate Limits**: Live limits don't affect test usage

### No Cross-Contamination

A test key will **never**:
- Access live verification data
- Count towards your billing quota
- Validate real credentials
- Appear in production audit logs

## Monitoring & Debugging

### Dashboard Views

Your [WalletGate dashboard](https://walletgate.app) shows:

- **Test Usage**: Free, unlimited, not tracked towards quota
- **Live Usage**: Real-time quota tracking with alerts
- **Separate Logs**: Filter by environment

### Debugging Test Verifications

Test mode provides detailed debug information:

```json
{
  "environment": "test",
  "testMode": true,
  "debug": {
    "mockCertificate": "CN=Test Issuer, C=EU",
    "simulatedChecks": ["age_over_18", "residency_eu"],
    "hint": "This verification used mock data"
  }
}
```

## Upgrading to Live

Ready to go live? Follow these steps:

1. **Upgrade Your Plan** - Choose a paid plan in the dashboard
2. **Get Live API Key** - Generate `wg_live_*` key from Keys section
3. **Update Environment Variables** - Add live key to production config
4. **Deploy** - Push to production with new env vars
5. **Monitor** - Watch dashboard for usage and errors

[Learn how to upgrade →](https://walletgate.app/admin)

## FAQ

**Q: Can I use test keys in production?**
A: Technically yes, but you shouldn't. Test keys use mock data and don't provide real verification.

**Q: Do test verifications count towards my quota?**
A: No, test verifications are completely free and unlimited.

**Q: How do I know which environment I'm using?**
A: Check the `environment` field in the API response: `"test"` or `"live"`.

**Q: Can I switch a session from test to live?**
A: No, sessions are tied to the environment of the API key used to create them.

**Q: Are there any feature differences?**
A: The core API is the same in test and live. Sandbox tooling (pre-built test scenarios, compliance reports, webhook inspector) is plan-based, not environment-based.

## Next Steps

- 📖 Learn about [Authentication](/guide/authentication)
- 🔄 Understand the [Verification Flow](/guide/verification-flow)
- 🔔 Set up [Webhooks](/guide/webhooks)
- 📊 View [API Reference](/api/overview)
