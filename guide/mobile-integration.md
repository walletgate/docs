# Mobile Integration

Integrate WalletGate verification into your iOS and Android apps.

## How It Works

```
Your Mobile App          WalletGate API          User's EUDI Wallet
      │                        │                        │
      │  1. Create Session     │                        │
      │───────────────────────>│                        │
      │                        │                        │
      │  2. verificationUrl    │                        │
      │<───────────────────────│                        │
      │                        │                        │
      │  3. Show QR / Open Deep Link                    │
      │─────────────────────────────────────────────────>
      │                        │                        │
      │                        │  4. User Verifies      │
      │                        │<───────────────────────│
      │                        │                        │
      │  5. Poll Status        │                        │
      │───────────────────────>│                        │
      │                        │                        │
      │  6. Results ✅          │                        │
      │<───────────────────────│                        │
```

## iOS (Swift)

### Installation

Add WalletGate API calls using native URLSession:

```swift
import Foundation

class WalletGateClient {
    private let apiKey: String
    private let baseURL = "https://api.walletgate.app"

    init(apiKey: String) {
        self.apiKey = apiKey
    }

    func createSession(checks: [[String: Any]]) async throws -> VerificationSession {
        var request = URLRequest(url: URL(string: "\(baseURL)/v1/verify/sessions")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["checks": checks])

        let (data, _) = try await URLSession.shared.data(for: request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        let sessionData = json["data"] as! [String: Any]

        return VerificationSession(
            id: sessionData["id"] as! String,
            verificationUrl: sessionData["verificationUrl"] as! String,
            expiresAt: sessionData["expiresAt"] as! String
        )
    }

    func getSession(id: String) async throws -> VerificationResult {
        var request = URLRequest(url: URL(string: "\(baseURL)/v1/verify/sessions/\(id)")!)
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await URLSession.shared.data(for: request)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        let resultData = json["data"] as! [String: Any]

        return VerificationResult(
            status: resultData["status"] as! String,
            results: resultData["results"] as? [String: Bool]
        )
    }
}

struct VerificationSession {
    let id: String
    let verificationUrl: String
    let expiresAt: String
}

struct VerificationResult {
    let status: String
    let results: [String: Bool]?
}
```

### SwiftUI Example

```swift
import SwiftUI
import CoreImage.CIFilterBuiltins

struct VerificationView: View {
    @State private var session: VerificationSession?
    @State private var result: VerificationResult?
    @State private var isPolling = false

    let client = WalletGateClient(apiKey: "wg_test_your_key")

    var body: some View {
        VStack(spacing: 20) {
            if let result = result {
                // Show result
                Image(systemName: result.status == "completed" ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(result.status == "completed" ? .green : .red)
                Text(result.status == "completed" ? "Verified!" : "Verification Failed")
                    .font(.title)
            } else if let session = session {
                // Show QR code
                if let qrImage = generateQRCode(from: session.verificationUrl) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .frame(width: 200, height: 200)
                }
                Text("Scan with EUDI Wallet")
                    .font(.caption)
                    .foregroundColor(.secondary)

                // Deep link button (for same-device verification)
                Button("Open in Wallet App") {
                    if let url = URL(string: session.verificationUrl) {
                        UIApplication.shared.open(url)
                    }
                }
                .buttonStyle(.borderedProminent)
            } else {
                // Start verification
                Button("Verify Age (18+)") {
                    Task { await startVerification() }
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .padding()
    }

    func startVerification() async {
        do {
            session = try await client.createSession(checks: [
                ["type": "age_over", "value": 18]
            ])
            await pollForResult()
        } catch {
            print("Error: \(error)")
        }
    }

    func pollForResult() async {
        guard let sessionId = session?.id else { return }
        isPolling = true

        while isPolling {
            do {
                let pollResult = try await client.getSession(id: sessionId)
                if ["completed", "failed", "expired"].contains(pollResult.status) {
                    result = pollResult
                    isPolling = false
                    return
                }
                try await Task.sleep(nanoseconds: 2_000_000_000)
            } catch {
                print("Poll error: \(error)")
            }
        }
    }

    func generateQRCode(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)

        if let outputImage = filter.outputImage,
           let cgImage = context.createCGImage(outputImage, from: outputImage.extent) {
            return UIImage(cgImage: cgImage)
        }
        return nil
    }
}
```

## Android (Kotlin)

### Gradle Dependencies

```kotlin
// build.gradle.kts
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.json:json:20231013")

    // For QR code generation
    implementation("com.journeyapps:zxing-android-embedded:4.3.0")
}
```

### WalletGate Client

```kotlin
package com.example.walletgate

import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

class WalletGateClient(private val apiKey: String) {
    private val client = OkHttpClient()
    private val baseUrl = "https://api.walletgate.app"
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    data class VerificationSession(
        val id: String,
        val verificationUrl: String,
        val expiresAt: String
    )

    data class VerificationResult(
        val status: String,
        val results: Map<String, Boolean>?
    )

    suspend fun createSession(checks: List<Map<String, Any>>): VerificationSession {
        return withContext(Dispatchers.IO) {
            val checksJson = JSONArray(checks.map { JSONObject(it) })
            val body = JSONObject().put("checks", checksJson).toString()

            val request = Request.Builder()
                .url("$baseUrl/v1/verify/sessions")
                .addHeader("Authorization", "Bearer $apiKey")
                .post(body.toRequestBody(jsonMediaType))
                .build()

            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "")
            val data = json.getJSONObject("data")

            VerificationSession(
                id = data.getString("id"),
                verificationUrl = data.getString("verificationUrl"),
                expiresAt = data.getString("expiresAt")
            )
        }
    }

    suspend fun getSession(id: String): VerificationResult {
        return withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url("$baseUrl/v1/verify/sessions/$id")
                .addHeader("Authorization", "Bearer $apiKey")
                .build()

            val response = client.newCall(request).execute()
            val json = JSONObject(response.body?.string() ?: "")
            val data = json.getJSONObject("data")

            val results = data.optJSONObject("results")?.let { resultsJson ->
                resultsJson.keys().asSequence().associateWith { key ->
                    resultsJson.getBoolean(key)
                }
            }

            VerificationResult(
                status = data.getString("status"),
                results = results
            )
        }
    }
}
```

### Jetpack Compose Example

```kotlin
@Composable
fun VerificationScreen() {
    val scope = rememberCoroutineScope()
    var session by remember { mutableStateOf<WalletGateClient.VerificationSession?>(null) }
    var result by remember { mutableStateOf<WalletGateClient.VerificationResult?>(null) }

    val client = remember { WalletGateClient("wg_test_your_key") }
    val context = LocalContext.current

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        when {
            result != null -> {
                // Show result
                Icon(
                    imageVector = if (result!!.status == "completed")
                        Icons.Default.CheckCircle else Icons.Default.Cancel,
                    contentDescription = null,
                    modifier = Modifier.size(80.dp),
                    tint = if (result!!.status == "completed") Color.Green else Color.Red
                )
                Spacer(Modifier.height(16.dp))
                Text(
                    text = if (result!!.status == "completed") "Verified!" else "Verification Failed",
                    style = MaterialTheme.typography.headlineMedium
                )
            }
            session != null -> {
                // Show QR code
                QrCodeImage(
                    content = session!!.verificationUrl,
                    modifier = Modifier.size(200.dp)
                )
                Spacer(Modifier.height(16.dp))
                Text("Scan with EUDI Wallet", style = MaterialTheme.typography.bodyMedium)

                Spacer(Modifier.height(24.dp))

                // Deep link button
                Button(onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(session!!.verificationUrl))
                    context.startActivity(intent)
                }) {
                    Text("Open in Wallet App")
                }
            }
            else -> {
                // Start verification
                Button(onClick = {
                    scope.launch {
                        session = client.createSession(
                            listOf(mapOf("type" to "age_over", "value" to 18))
                        )
                        // Start polling
                        while (result == null) {
                            val pollResult = client.getSession(session!!.id)
                            if (pollResult.status in listOf("completed", "failed", "expired")) {
                                result = pollResult
                                break
                            }
                            delay(2000)
                        }
                    }
                }) {
                    Text("Verify Age (18+)")
                }
            }
        }
    }
}

@Composable
fun QrCodeImage(content: String, modifier: Modifier = Modifier) {
    val bitmap = remember(content) {
        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, 512, 512)
        val width = bitMatrix.width
        val height = bitMatrix.height
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
        for (x in 0 until width) {
            for (y in 0 until height) {
                bitmap.setPixel(x, y, if (bitMatrix[x, y]) Color.BLACK else Color.WHITE)
            }
        }
        bitmap.asImageBitmap()
    }

    Image(bitmap = bitmap, contentDescription = "QR Code", modifier = modifier)
}
```

## React Native

For React Native apps, you can use the TypeScript SDK directly:

```bash
npm install @walletgate/eudi
```

```tsx
import { WalletGate } from '@walletgate/eudi';
import { Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const client = new WalletGate({ apiKey: 'wg_test_your_key' });

function VerificationScreen() {
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);

  const startVerification = async () => {
    const newSession = await client.startVerification({
      checks: [{ type: 'age_over', value: 18 }]
    });
    setSession(newSession);

    // Poll for result
    const pollResult = await client.getResult(newSession.id, { poll: true });
    setResult(pollResult);
  };

  return (
    <View style={styles.container}>
      {result ? (
        <Text style={styles.status}>
          {result.status === 'completed' ? '✅ Verified!' : '❌ Failed'}
        </Text>
      ) : session ? (
        <>
          <QRCode value={session.verificationUrl} size={200} />
          <TouchableOpacity
            onPress={() => Linking.openURL(session.verificationUrl)}
          >
            <Text>Open in Wallet App</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Button title="Verify Age" onPress={startVerification} />
      )}
    </View>
  );
}
```

## Flutter

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class WalletGateClient {
  final String apiKey;
  final String baseUrl = 'https://api.walletgate.app';

  WalletGateClient(this.apiKey);

  Future<Map<String, dynamic>> createSession(List<Map<String, dynamic>> checks) async {
    final response = await http.post(
      Uri.parse('$baseUrl/v1/verify/sessions'),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'checks': checks}),
    );
    return jsonDecode(response.body)['data'];
  }

  Future<Map<String, dynamic>> getSession(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/v1/verify/sessions/$id'),
      headers: {'Authorization': 'Bearer $apiKey'},
    );
    return jsonDecode(response.body)['data'];
  }
}

// Usage in Widget
class VerificationScreen extends StatefulWidget { /* ... */ }

class _VerificationScreenState extends State<VerificationScreen> {
  final client = WalletGateClient('wg_test_your_key');
  Map<String, dynamic>? session;
  Map<String, dynamic>? result;

  Future<void> startVerification() async {
    session = await client.createSession([
      {'type': 'age_over', 'value': 18}
    ]);
    setState(() {});

    // Poll for result
    while (result == null) {
      final pollResult = await client.getSession(session!['id']);
      if (['completed', 'failed', 'expired'].contains(pollResult['status'])) {
        result = pollResult;
        setState(() {});
        break;
      }
      await Future.delayed(Duration(seconds: 2));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (result != null) {
      return Center(
        child: Icon(
          result!['status'] == 'completed' ? Icons.check_circle : Icons.cancel,
          size: 80,
          color: result!['status'] == 'completed' ? Colors.green : Colors.red,
        ),
      );
    }

    if (session != null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          QrImageView(data: session!['verificationUrl'], size: 200),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => launchUrl(Uri.parse(session!['verificationUrl'])),
            child: Text('Open in Wallet App'),
          ),
        ],
      );
    }

    return Center(
      child: ElevatedButton(
        onPressed: startVerification,
        child: Text('Verify Age (18+)'),
      ),
    );
  }
}
```

## Best Practices

### 1. Keep API Keys Secure

Never hardcode API keys in your mobile app. Use:
- Environment variables at build time
- Secure storage (Keychain on iOS, Keystore on Android)
- Backend proxy for production apps

### 2. Handle Deep Links

For same-device verification (when wallet is on same phone):

**iOS** - Add URL scheme handler:
```swift
// Info.plist
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>eudi-wallet</string>
</array>
```

**Android** - Add intent filter:
```xml
<!-- AndroidManifest.xml -->
<queries>
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="eudi-wallet" />
    </intent>
</queries>
```

### 3. Graceful Fallbacks

Always handle cases where:
- User doesn't have EUDI Wallet installed
- Verification times out
- Network errors occur

### 4. Test Mode

Use test keys (`wg_test_*`) during development. Test sessions can be simulated through the dashboard playground.

## Need Help?

- [API Reference](/api/overview)
- [Interactive Playground](/admin/playground) - Test in browser
- [Email Support](mailto:support@walletgate.app)
