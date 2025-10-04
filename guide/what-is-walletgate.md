# What is WalletGate?

WalletGate is the premier **Verifier/Relying Party** solution for the EU Digital Identity Wallet ecosystem. We provide businesses with a complete platform to accept, verify, and process digital identity credentials from EU citizens and residents.

## The Problem We Solve

The EU is rolling out Digital Identity Wallets to all 450 million citizens by 2026. While this creates massive opportunities for businesses, implementing a compliant verifier system is incredibly complex:

- ❌ **Cryptographic complexity**: RSA-PSS, ECDSA, certificate chain validation
- ❌ **Regulatory compliance**: eIDAS 2.0, GDPR, national regulations
- ❌ **Infrastructure setup**: LOTL fetching, OCSP/CRL checking, trust anchors
- ❌ **Security requirements**: API key management, webhook signing, audit logs
- ❌ **Ongoing maintenance**: Certificate updates, regulatory changes, security patches

**Building this in-house costs €500K-€1M+ and takes 6-12 months.**

## Our Solution

WalletGate provides a **5-line SDK integration** that handles all the complexity:

```typescript
import { WalletGate } from '@walletgate/eudi';

const client = new WalletGate({ apiKey: 'wg_test_...' });

const session = await client.createSession({
  checks: [{ type: 'age_over', value: 18 }],
});
```

That's it. We handle everything else.

## Key Features

### 🚀 Developer Experience

- **5-line integration**: Start verifying in minutes
- **Test environment**: Free sandbox with 100 verifications/month
- **TypeScript SDK**: Fully typed with autocomplete
- **Framework agnostic**: Works with React, Vue, Node.js, Next.js, etc.
- **Comprehensive docs**: Interactive API reference, guides, examples

### 🔒 Enterprise Security

- **SOC 2 Type II certified**: Annual third-party security audits
- **ISO 27001 compliant**: Information security standards
- **GDPR by design**: Privacy-first architecture, data minimization
- **Zero-knowledge**: Never access actual credential data
- **End-to-end encryption**: TLS 1.3, API key hashing with Argon2id

### 🇪🇺 Full EU Coverage

- **All 27 EU member states** + EEA countries
- **Direct LOTL integration**: Official EU trust infrastructure
- **Real-time validation**: OCSP/CRL checks against government endpoints
- **eIDAS 2.0 compliant**: Full regulatory alignment

### 📊 Production Ready

- **99.9% uptime SLA**: Enterprise-grade reliability
- **<200ms response time**: Lightning-fast verification
- **Auto-scaling**: Handle millions of verifications
- **24/7 support**: Dedicated solution architects

## Use Cases

### Age Verification

Perfect for:
- 🍺 Alcohol and tobacco sales
- 🎰 Online gambling platforms
- 🔞 Adult content platforms
- 🎬 Streaming services

```typescript
await client.createSession({
  checks: [{ type: 'age_over', value: 18 }],
});
```

### Residency Verification

Ideal for:
- 🏦 Financial services (KYC/AML)
- 🏠 Real estate platforms
- 🚗 Car rental services
- 📱 Telecom providers

```typescript
await client.createSession({
  checks: [{ type: 'residency_eu' }],
});
```

### Identity Verification

Essential for:
- 💳 Payment processors
- 🏛️ Government services
- 🏥 Healthcare platforms
- 🎓 Education platforms

```typescript
await client.createSession({
  checks: [{ type: 'identity_verified' }],
});
```

## How It Works

1. **User initiates verification** on your platform
2. **Your backend** calls WalletGate API to create a session
3. **User scans QR code** with their EU Digital Identity Wallet
4. **Wallet presents credentials** to WalletGate
5. **WalletGate validates** cryptographic signatures, certificate chains, revocation status
6. **You receive results** via webhook or polling

[Learn more about the verification flow →](/guide/verification-flow)

## Why Businesses Choose WalletGate

| Traditional Approach | WalletGate |
|---------------------|------------|
| 6-12 months development | **5 minutes integration** |
| €500K-€1M+ cost | **$19/month** (starter plan) |
| Dedicated security team | **SOC 2 certified** |
| Manual LOTL updates | **Automatic updates** |
| Complex cryptography | **Simple API** |
| Regulatory risk | **Full compliance** |

## Pricing

- **Free Trial**: ✨ Unlimited test verifications - test for free, forever (no credit card)
- **Starter**: €29/month - ✨ Unlimited test + 150 live verifications
- **Growth**: €79/month - ✨ Unlimited test + 500 live verifications + AI fraud detection
- **Scale**: €149/month - ✨ Unlimited test + 2,000 live verifications + white-label
- **Enterprise**: Custom pricing with dedicated support

All plans include unlimited test verifications. You only pay for production (live) verifications.

[View full pricing →](https://walletgate.app#pricing)

## Ready to Get Started?

<div class="vp-button-container" style="margin-top: 2rem;">
  <a href="/guide/getting-started" class="vp-button">Read Getting Started Guide</a>
  <a href="https://walletgate.app/register" class="vp-button alt">Sign Up Free</a>
</div>

## Questions?

- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)
- 📖 Check our [FAQ](https://walletgate.app#faq)
- 💬 [Book a demo](mailto:hello@walletgate.app)
