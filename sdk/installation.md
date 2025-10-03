# Installation

Install the WalletGate TypeScript SDK for seamless EU Digital Identity verification.

## Requirements

- Node.js 18+ or modern browser
- TypeScript 4.5+ (recommended)
- npm, yarn, or pnpm

## Installation

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

## Quick Start

```typescript
import { WalletGate } from '@walletgate/eudi';

const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
});

// Create verification session
const session = await client.createSession({
  checks: [{ type: 'age_over', value: 18 }],
});

console.log(session.verificationUrl);
```

## Browser Usage

The SDK works in both Node.js and browser environments:

```html
<script type="module">
  import { WalletGate } from 'https://cdn.skypack.dev/@walletgate/eudi';

  const client = new WalletGate({
    apiKey: 'wg_test_your_key_here',
  });

  // Use client...
</script>
```

::: danger Never Expose Live Keys in Browser
Only use test keys (`wg_test_*`) in client-side code. Live keys should stay on your backend.
:::

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import { WalletGate, CreateSessionInput, VerificationSession } from '@walletgate/eudi';

const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY,
});

const input: CreateSessionInput = {
  checks: [{ type: 'age_over', value: 18 }],
  redirectUrl: 'https://your-app.com/success',
};

const session: VerificationSession = await client.createSession(input);
```

## Environment Variables

Store your API keys securely using environment variables:

::: code-group

```bash [.env.local]
WALLETGATE_API_KEY=wg_test_your_test_key_here
```

```bash [.env.production]
WALLETGATE_API_KEY=wg_live_your_live_key_here
```

:::

## Next Steps

Continue with these guides:

- [Getting Started](/guide/getting-started) - Quick start guide
- [Verification Flow](/guide/verification-flow) - Understanding the flow
- [API Reference](/api/overview) - Full API documentation
- [Interactive API](/api/interactive) - Try the API in your browser

## Verification

Check that the SDK is installed correctly:

```bash
npm list @walletgate/eudi
```

Expected output:
```
your-project@1.0.0 /path/to/your/project
└── @walletgate/eudi@1.0.0
```

## Next Steps

- 📘 [Quick Start Guide](/sdk/quick-start)
- ⚙️ [Configuration Options](/sdk/configuration)
- 📚 [API Reference](/sdk/api-reference)
- 💡 [Examples](/sdk/examples/age-verification)

## Troubleshooting

### Module not found

If you see `Cannot find module '@walletgate/eudi'`:

1. Ensure the package is installed: `npm install @walletgate/eudi`
2. Restart your development server
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### TypeScript errors

If you see TypeScript errors:

1. Ensure TypeScript 4.5+ is installed: `npm install -D typescript@latest`
2. Update tsconfig.json:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

## Need Help?

- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)
- 💬 [GitHub Issues](https://github.com/walletgate/docs/issues)
- 📖 [FAQ](https://walletgate.app#faq)
