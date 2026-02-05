---
title: Security Center (Business+)
outline: deep
---

# Security Center (Business+)

The Security Center provides AI‑powered anomaly detection and real‑time visibility into suspicious activity across your API usage.

Designed for operators and engineers, it highlights risk with clear actions so you can respond quickly.

## What You See

- Key metrics: total requests, failure rate, unique IPs, active/critical alerts
- Recent alerts: human‑readable descriptions with severity and risk score
- AI insights: consolidated patterns (e.g., brute force attempt)
- Traffic analysis: request volume and success trends

## Anomaly Types

- Velocity attacks — rapid requests over plan thresholds
- Geographic anomalies — “impossible travel” between distant locations
- High failure rate — elevated 4xx/5xx suggesting brute force or misconfig
- Bot traffic — suspicious user agents and automated behavior
- Credential sharing — one key used from many unique IPs

Each alert includes:
- Severity: low · medium · high · critical
- Risk score: 0.0–1.0 (weighted by severity)
- Recommended action: monitor · rate_limit · investigate · block

## How It Works

1. Request metadata (IP, user agent, response status/time) is captured after auth
2. AI heuristic engine evaluates multiple detectors in parallel
3. Risk is scored and insights are generated
4. Alerts and metrics are stored for dashboards and APIs
5. Optional enforcement applies soft throttling or blocks extreme risk (off by default)

Data is processed asynchronously and designed to fail‑open so normal traffic is never blocked by analysis errors.

## Access & Plans

- Available on: **Business** plan
- Admin Console: “Security” tab in the top navigation (appears automatically on eligible plans)
- API endpoints (admin):
  - `GET /admin/anomaly/alerts`
  - `PATCH /admin/anomaly/alerts/:id`
  - `GET /admin/anomaly/metrics`
  - `GET /admin/anomaly/dashboard`

## Enable / Configure

By default, anomaly tracking runs when Admin is enabled and feature flags are on. In production, ensure:

- Environment: `FEATURE_AI_RISK_SCORING=true` and `FEATURE_ANOMALY_DETECTION=true`
- Admin enabled: `ADMIN_ENABLED=true`
- Plan entitlements set to Business for the account

Optional:
- GeoIP provider (e.g., MaxMind) for higher‑accuracy geolocation
- Webhooks to receive critical alerts (Business+)

## Privacy & Security

- No PII in logs — we store minimal request metadata
- Signed webhooks with timestamped HMAC‑SHA256
- TLS enforced for all endpoints
- Plan‑gated access to prevent disclosure on Free/Pro

## FAQ

**Will this block traffic?**
No. Analysis is asynchronous and fails open. You can enable optional policies (throttle/block) for high‑risk scores.

**How do I get alerts programmatically?**
Use the admin anomaly APIs or set up webhooks on Business+.

**Is this included in Free or Pro?**
No. Security Center requires **Business** plan.

