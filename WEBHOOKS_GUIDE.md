# Webhooks Developer Guide

## Overview

Webhooks allow you to receive real-time notifications when events occur in your organization. Instead of polling the API for changes, webhooks push data to your server immediately when events happen.

## Table of Contents

- [Getting Started](#getting-started)
- [Event Types](#event-types)
- [Payload Structure](#payload-structure)
- [Security & Verification](#security--verification)
- [Retry Logic](#retry-logic)
- [Best Practices](#best-practices)
- [Example Implementations](#example-implementations)

---

## Getting Started

### 1. Create a Webhook Endpoint

First, create an HTTPS endpoint on your server that can receive POST requests. Your endpoint should:

- Accept POST requests with JSON payloads
- Return a 2xx status code (200-299) to acknowledge receipt
- Respond within 30 seconds to avoid timeout
- Validate webhook signatures for security

### 2. Register Your Webhook

Navigate to your organization dashboard:

1. Go to **Dashboard** → **Organizations** → **Your Organization**
2. Click **Webhooks** in the admin toolbar
3. Click **Create Webhook**
4. Fill in the details:
   - **Name**: A descriptive name for your webhook
   - **URL**: Your HTTPS endpoint (e.g., `https://yourapp.com/webhooks/neuroelemental`)
   - **Events**: Select which events you want to receive
5. **Save your secret!** This is shown only once and is required to verify webhook signatures

### 3. Test Your Webhook

After creating your webhook:

1. Click **Test** to send a test payload
2. Verify your endpoint receives and processes the test correctly
3. Check the **View Deliveries** link to see delivery status and debug any issues

---

## Event Types

Webhooks are organized into 6 categories with 24 total event types:

### Organization Events

| Event | Description |
|-------|-------------|
| `organization.created` | Organization was created |
| `organization.updated` | Organization settings were updated |
| `organization.deleted` | Organization was deleted |

### Member Events

| Event | Description |
|-------|-------------|
| `member.invited` | User was invited to join the organization |
| `member.joined` | User accepted invitation and joined |
| `member.removed` | Member was removed from the organization |
| `member.role_changed` | Member's role was changed (e.g., member → admin) |
| `member.left` | Member voluntarily left the organization |

### Credit Events

| Event | Description |
|-------|-------------|
| `credits.added` | Credits were added to the organization |
| `credits.purchased` | Credits were purchased |
| `credits.used` | Credits were consumed |
| `credits.expired` | Credits expired |
| `credits.refunded` | Credits were refunded |

### Invitation Events

| Event | Description |
|-------|-------------|
| `invitation.sent` | Invitation email was sent |
| `invitation.accepted` | Invitation was accepted |
| `invitation.declined` | Invitation was declined |
| `invitation.expired` | Invitation expired |
| `invitation.bulk_sent` | Bulk invitations were sent |

### API Key Events

| Event | Description |
|-------|-------------|
| `api_key.created` | New API key was created |
| `api_key.revoked` | API key was revoked |
| `api_key.deleted` | API key was permanently deleted |

### Course Events

| Event | Description |
|-------|-------------|
| `course.enrolled` | User enrolled in a course |
| `course.completed` | User completed a course |
| `course.progress` | User made progress in a course |

---

## Payload Structure

All webhook payloads follow this structure:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "event": "member.joined",
  "organization_id": "org_abc123",
  "timestamp": "2024-01-22T10:30:00.000Z",
  "data": {
    "entity_type": "member",
    "entity_id": "mem_xyz789",
    "description": "John Doe joined the organization",
    "user_id": "usr_123456",
    "metadata": {
      "role": "member",
      "invited_by": "usr_admin1"
    },
    "timestamp": "2024-01-22T10:30:00.000Z"
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for this webhook delivery |
| `event` | string | Event type (see [Event Types](#event-types)) |
| `organization_id` | string | ID of the organization where the event occurred |
| `timestamp` | string | ISO 8601 timestamp when the event occurred |
| `data` | object | Event-specific data (varies by event type) |
| `data.entity_type` | string | Type of entity (member, credit, invitation, etc.) |
| `data.entity_id` | string | ID of the affected entity |
| `data.description` | string | Human-readable description of the event |
| `data.user_id` | string | ID of the user who triggered the event (if applicable) |
| `data.metadata` | object | Additional event-specific information |

---

## Security & Verification

**IMPORTANT:** Always verify webhook signatures to ensure requests are from NeuroElemental.

### Signature Verification

Each webhook request includes an `X-Webhook-Signature` header containing an HMAC-SHA256 signature of the payload. Verify it using your webhook secret.

#### Node.js Example

```javascript
const crypto = require('crypto')

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(JSON.stringify(payload))
  const expectedSignature = hmac.digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Express.js example
app.post('/webhooks/neuroelemental', express.json(), (req, res) => {
  const signature = req.headers['x-webhook-signature']
  const secret = process.env.WEBHOOK_SECRET

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  // Process webhook...
  console.log('Received event:', req.body.event)

  res.status(200).json({ received: true })
})
```

#### Python Example

```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected_signature)

# Flask example
from flask import Flask, request, jsonify

@app.route('/webhooks/neuroelemental', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = os.environ['WEBHOOK_SECRET']

    if not verify_webhook_signature(request.json, signature, secret):
        return jsonify({'error': 'Invalid signature'}), 401

    # Process webhook...
    event = request.json['event']
    print(f'Received event: {event}')

    return jsonify({'received': True}), 200
```

#### Go Example

```go
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
    "net/http"
)

func verifyWebhookSignature(payload []byte, signature, secret string) bool {
    h := hmac.New(sha256.New, []byte(secret))
    h.Write(payload)
    expectedSignature := hex.EncodeToString(h.Sum(nil))

    return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
    signature := r.Header.Get("X-Webhook-Signature")
    secret := os.Getenv("WEBHOOK_SECRET")

    body, _ := ioutil.ReadAll(r.Body)

    if !verifyWebhookSignature(body, signature, secret) {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }

    var payload map[string]interface{}
    json.Unmarshal(body, &payload)

    // Process webhook...
    event := payload["event"].(string)
    fmt.Printf("Received event: %s\n", event)

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]bool{"received": true})
}
```

---

## Retry Logic

NeuroElemental implements automatic retry logic for failed webhook deliveries:

### Retry Schedule

| Attempt | Delay | Total Time |
|---------|-------|------------|
| 1 (initial) | Immediate | 0s |
| 2 | 1 minute | 1min |
| 3 | 5 minutes | 6min |
| 4 (final) | 30 minutes | 36min |

### Failure Conditions

A delivery is considered failed if:

- Your endpoint returns a non-2xx status code (not 200-299)
- The request times out (30 seconds)
- A network error occurs

### Maximum Attempts

After **3 retry attempts** (4 total deliveries), the webhook delivery is marked as permanently failed. You can view failed deliveries in the dashboard under **View Deliveries**.

### Idempotency

Since webhooks may be retried, ensure your endpoint is **idempotent** — processing the same webhook multiple times should have the same effect as processing it once. Use the `id` field to track which webhooks you've already processed.

---

## Best Practices

### 1. Respond Quickly

- Return a 200 status code **immediately** upon receiving the webhook
- Process heavy tasks **asynchronously** using a queue
- Don't wait for database writes or external API calls before responding

```javascript
// ❌ Bad - slow response
app.post('/webhooks', async (req, res) => {
  await processWebhook(req.body)  // This might take 10+ seconds
  res.status(200).send('OK')
})

// ✅ Good - fast response
app.post('/webhooks', (req, res) => {
  queue.add('process-webhook', req.body)  // Add to queue immediately
  res.status(200).send('OK')
})
```

### 2. Implement Idempotency

Track processed webhook IDs to avoid duplicate processing:

```javascript
const processedWebhooks = new Set()  // Use Redis/database in production

app.post('/webhooks', (req, res) => {
  const webhookId = req.body.id

  if (processedWebhooks.has(webhookId)) {
    return res.status(200).json({ received: true, duplicate: true })
  }

  processedWebhooks.add(webhookId)
  queue.add('process-webhook', req.body)

  res.status(200).json({ received: true })
})
```

### 3. Always Verify Signatures

Never process webhooks without verifying the signature:

```javascript
app.post('/webhooks', (req, res) => {
  // ALWAYS verify first
  if (!verifySignature(req.body, req.headers['x-webhook-signature'])) {
    return res.status(401).send('Invalid signature')
  }

  // Then process
  processWebhook(req.body)
  res.status(200).send('OK')
})
```

### 4. Handle Errors Gracefully

Return 5xx errors for temporary failures (will trigger retry), 2xx for successful processing:

```javascript
app.post('/webhooks', async (req, res) => {
  try {
    await processWebhook(req.body)
    res.status(200).send('OK')
  } catch (error) {
    if (isTemporaryError(error)) {
      // 5xx = retry
      res.status(500).send('Temporary error, please retry')
    } else {
      // Still return 200 to prevent retries for permanent errors
      console.error('Permanent error:', error)
      res.status(200).send('Logged error')
    }
  }
})
```

### 5. Monitor and Alert

Set up monitoring for:

- Failed webhook deliveries in the dashboard
- High error rates from your endpoint
- Slow processing times
- Duplicate webhook IDs

### 6. Use HTTPS Only

Webhook URLs **must** use HTTPS to ensure secure transmission. HTTP URLs will be rejected.

### 7. Rotate Secrets Periodically

Regenerate your webhook secret periodically for security:

1. Go to **Webhooks** dashboard
2. Click **Regenerate Secret** on your webhook
3. Update your server with the new secret
4. Verify deliveries are working

---

## Example Implementations

### Complete Express.js Server

```javascript
const express = require('express')
const crypto = require('crypto')

const app = express()
app.use(express.json())

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
const processedWebhooks = new Set()

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET)
  hmac.update(JSON.stringify(payload))
  const expected = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}

app.post('/webhooks/neuroelemental', (req, res) => {
  // Verify signature
  const signature = req.headers['x-webhook-signature']
  if (!signature || !verifySignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  // Check for duplicates
  const webhookId = req.body.id
  if (processedWebhooks.has(webhookId)) {
    return res.status(200).json({ received: true, duplicate: true })
  }

  processedWebhooks.add(webhookId)

  // Process event
  const { event, organization_id, data } = req.body

  console.log(`Received ${event} for org ${organization_id}`)

  // Add to queue for async processing
  switch (event) {
    case 'member.joined':
      console.log(`New member: ${data.user_id}`)
      // Add to processing queue
      break

    case 'credits.used':
      console.log(`Credits used: ${data.metadata?.amount}`)
      // Update internal tracking
      break

    default:
      console.log('Unhandled event type')
  }

  // Respond quickly
  res.status(200).json({ received: true })
})

app.listen(3000, () => {
  console.log('Webhook server listening on port 3000')
})
```

### Complete Flask Server

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os

app = Flask(__name__)

WEBHOOK_SECRET = os.environ['WEBHOOK_SECRET']
processed_webhooks = set()

def verify_signature(payload, signature):
    expected = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)

@app.route('/webhooks/neuroelemental', methods=['POST'])
def webhook():
    # Verify signature
    signature = request.headers.get('X-Webhook-Signature')
    if not signature or not verify_signature(request.json, signature):
        return jsonify({'error': 'Invalid signature'}), 401

    # Check for duplicates
    webhook_id = request.json['id']
    if webhook_id in processed_webhooks:
        return jsonify({'received': True, 'duplicate': True}), 200

    processed_webhooks.add(webhook_id)

    # Process event
    event = request.json['event']
    organization_id = request.json['organization_id']
    data = request.json['data']

    print(f'Received {event} for org {organization_id}')

    # Add to queue for async processing
    if event == 'member.joined':
        print(f"New member: {data['user_id']}")
        # Add to processing queue
    elif event == 'credits.used':
        print(f"Credits used: {data['metadata'].get('amount')}")
        # Update internal tracking
    else:
        print('Unhandled event type')

    # Respond quickly
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

---

## Troubleshooting

### Deliveries Failing

1. Check **View Deliveries** in the dashboard for error details
2. Verify your endpoint is returning 2xx status codes
3. Ensure your endpoint responds within 30 seconds
4. Check your signature verification logic

### Not Receiving Webhooks

1. Verify the webhook is **Active** in the dashboard
2. Ensure you've subscribed to the correct events
3. Check your endpoint URL is correct and publicly accessible
4. Test using the **Test** button in the dashboard

### Duplicate Webhooks

Implement idempotency checking using the webhook `id` field to track processed webhooks.

---

## Support

If you encounter issues with webhooks:

1. Check the **View Deliveries** page for detailed error logs
2. Review your endpoint logs for errors
3. Contact support with:
   - Your organization ID
   - Webhook ID
   - Delivery ID (from View Deliveries page)
   - Error message and timestamp

---

**Generated with Claude Code** • [View on GitHub](https://github.com/anthropics/claude-code)
