---
layout: home

hero:
  name: WalletGate
  text: EU Digital Identity Verification
  tagline: Developer-first API for accepting EU Digital Identity Wallet credentials
  image:
    src: /hero-logo.svg
    alt: WalletGate
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/overview
    - theme: alt
      text: Interactive API
      link: /api/interactive

features:
  - icon: ⚡
    title: 5-Line Integration
    details: Install our SDK and start verifying EU Digital Identity credentials in minutes with just 5 lines of code.

  - icon: 🔒
    title: Enterprise Security
    details: SOC 2 Type II certified with end-to-end encryption, zero-knowledge architecture, and GDPR compliance by design.

  - icon: 🇪🇺
    title: Full EU Coverage
    details: Supports all 27 EU member states plus EEA countries. Direct integration with official EU LOTL infrastructure.

  - icon: 🎯
    title: Test Environment
    details: Free test environment with 100 verifications per month. No credit card required to get started.

  - icon: 📊
    title: Real-time Dashboard
    details: Monitor verifications, manage API keys, and track usage with our intuitive admin console.

  - icon: 🔔
    title: Webhooks & Events
    details: Get real-time notifications for verification events with secure HMAC-SHA256 signed webhooks.
---

## Quick Start

Install the SDK and create your first verification session:

::: code-group

```bash [npm]
npm install @walletgate/eudi
```

```bash [yarn]
yarn add @walletgate/eudi
```

```bash [pnpm]
pnpm add @walletgate/eudi
```

:::

```typescript
import { WalletGate } from '@walletgate/eudi';

const client = new WalletGate({
  apiKey: 'wg_test_your_key_here',
});

const session = await client.createSession({
  checks: [
    { type: 'age_over', value: 18 },
    { type: 'residency_eu' },
  ],
});

console.log(session.verificationUrl); // Show QR code to user
```

## Why WalletGate?

We handle the complexity of EU Digital Identity verification so you can focus on building your product.

### What You Get

- ✅ **eIDAS 2.0 Compliant** - Full regulatory compliance
- ✅ **99.9% Uptime SLA** - Enterprise reliability
- ✅ **<200ms Response** - Fast verification
- ✅ **24/7 Support** - Technical support when you need it

## Get Started in Minutes

1. [Sign up](https://walletgate.app/register) for a free account
2. Get your test API key (100 free verifications/month)
3. Follow our [Getting Started guide](/guide/getting-started)
4. Integrate with our [TypeScript SDK](/sdk/installation)

<div style="margin-top: 3rem; text-align: center;">
  <a href="/guide/getting-started" class="vp-button" style="margin-right: 1rem;">Read the Docs</a>
  <a href="https://walletgate.app/register" class="vp-button alt">Start Building</a>
</div>
