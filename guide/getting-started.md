# Getting Started

Get up and running with WalletGate in less than 5 minutes.

## Prerequisites

- Node.js 18+ or any modern JavaScript environment
- A WalletGate account

## Step 1: Get Your API Key

1. [Create an account](https://walletgate.app) if you haven't already
2. Navigate to the **Keys** section in your dashboard
3. Copy your test API key (starts with `wg_test_`)

::: tip Free Test Environment
Test keys come with 100 free verifications per month and never expire. No credit card required!
:::

::: info Getting an API Key
- New user? [Register](https://walletgate.app) to get a test key (`wg_test_*`)
- Returning? [Log in](https://walletgate.app/login) to view/manage keys
- Live keys (`wg_live_*`) are available on paid plans and used for production requests
:::

## Step 2: Choose Your Integration Method

### Option A: TypeScript/JavaScript SDK (Recommended)

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

### Option B: REST API (Any Language)

For **Ruby, Go, Java, PHP**, and other languages, use our REST API directly. No SDK installation required — just HTTP requests.

```bash
# Works with any language that can make HTTP requests
curl -X POST https://api.walletgate.app/v1/verify/sessions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"checks":[{"type":"age_over","value":18}]}'
```

See [REST API examples](#rest-api-examples) below for Ruby, Go, Java, and more.

## Step 3: Create Your First Verification

```typescript
import { WalletGate } from '@walletgate/eudi';

// Initialize the client
const client = new WalletGate({
  apiKey: process.env.WALLETGATE_API_KEY, // wg_test_...
});

// Create a verification session
const session = await client.startVerification({
  checks: [
    { type: 'age_over', value: 18 },
    { type: 'residency_eu' },
  ],
  redirectUrl: 'https://your-app.com/success',
  webhookUrl: 'https://your-app.com/webhook',
});

console.log('Verification URL:', session.verificationUrl);
console.log('Session ID:', session.id);
```

## Step 4: Display QR Code to User

Show the `verificationUrl` as a QR code for users to scan with their EU Digital Identity Wallet:

```typescript
import QRCode from 'qrcode';

// Generate QR code
const qrCodeDataUrl = await QRCode.toDataURL(session.verificationUrl);

// Display in your UI
// <img src={qrCodeDataUrl} alt="Scan with your EU Digital Identity Wallet" />
```

## Step 5: Handle Verification Results

### Option A: Webhooks (Recommended)

Receive real-time updates when verification completes:

```typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  // Verify webhook signature
  const signature = req.headers['wg-signature'];
  const timestamp = req.headers['wg-timestamp'];
  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }

  // Process the webhook
  const { event, data } = req.body;

  if (event === 'verification.completed') {
    console.log('Verification completed:', data.sessionId);
    console.log('Results:', data.results);
    // Update your database, notify user, etc.
  }

  res.status(200).send('OK');
});
```

### Option B: Polling

Query the session status periodically:

```typescript
// Poll every 2 seconds
const pollSession = setInterval(async () => {
  const session = await client.getSession(sessionId);

  if (session.status === 'completed') {
    console.log('Verification results:', session.results);
    clearInterval(pollSession);
  } else if (session.status === 'failed') {
    console.error('Verification failed:', session.error);
    clearInterval(pollSession);
  }
}, 2000);
```

## What's Next?

- 📖 Learn about [Test vs Live environments](/guide/test-vs-live)
- 🔄 Understand the [Verification Flow](/guide/verification-flow)
- 🔔 Set up [Webhooks](/guide/webhooks)
- 📚 Browse the [API Reference](/api/overview)
- 🎮 Try the [Interactive API](/api/interactive)

## REST API Examples

For languages without an SDK, use the REST API directly:

### Ruby

```ruby
require 'net/http'
require 'json'

uri = URI('https://api.walletgate.app/v1/verify/sessions')
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request['Authorization'] = "Bearer #{ENV['WALLETGATE_API_KEY']}"
request['Content-Type'] = 'application/json'
request.body = { checks: [{ type: 'age_over', value: 18 }] }.to_json

response = http.request(request)
session = JSON.parse(response.body)['data']
puts "Verification URL: #{session['verificationUrl']}"
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "os"
)

func main() {
    body, _ := json.Marshal(map[string]interface{}{
        "checks": []map[string]interface{}{
            {"type": "age_over", "value": 18},
        },
    })

    req, _ := http.NewRequest("POST", "https://api.walletgate.app/v1/verify/sessions", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer "+os.Getenv("WALLETGATE_API_KEY"))
    req.Header.Set("Content-Type", "application/json")

    resp, _ := http.DefaultClient.Do(req)
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)

    session := result["data"].(map[string]interface{})
    fmt.Println("Verification URL:", session["verificationUrl"])
}
```

### Java

```java
import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
String body = "{\"checks\":[{\"type\":\"age_over\",\"value\":18}]}";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.walletgate.app/v1/verify/sessions"))
    .header("Authorization", "Bearer " + System.getenv("WALLETGATE_API_KEY"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());
```

### Python

```python
import requests
import os

response = requests.post(
    'https://api.walletgate.app/v1/verify/sessions',
    headers={'Authorization': f'Bearer {os.getenv("WALLETGATE_API_KEY")}'},
    json={'checks': [{'type': 'age_over', 'value': 18}]}
)

session = response.json()['data']
print(f"Verification URL: {session['verificationUrl']}")
```

## Need Help?

- 📧 Email: [support@walletgate.app](mailto:support@walletgate.app)
- 💬 Join our [Discord community](https://discord.gg/KZ8sP5Ua)
- 📖 Check the [FAQ](https://walletgate.app#faq)
