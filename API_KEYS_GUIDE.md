# API Keys Guide

Complete guide to using API keys for programmatic access to NeuroElemental.

## Table of Contents

- [Overview](#overview)
- [Key Format](#key-format)
- [Creating API Keys](#creating-api-keys)
- [Available Scopes](#available-scopes)
- [Rate Limits](#rate-limits)
- [Using API Keys](#using-api-keys)
- [API Routes](#api-routes)
- [Security Best Practices](#security-best-practices)
- [Code Examples](#code-examples)

## Overview

NeuroElemental uses **unified authentication** - the same API routes work with both:
- **Session authentication** (web app, cookies)
- **API key authentication** (programmatic access, Bearer tokens)

Each API key:

- Has a unique identifier starting with `ne_live_`
- Is associated with a specific organization
- Has granular permissions via scopes
- Can have an optional expiration date
- Tracks last usage timestamp
- Can be revoked at any time

**Key Benefit:** You can test API routes in your browser (session auth) and use them programmatically (API key auth) without any code changes!

## Key Format

API keys follow this format:

```
ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- `ne` = NeuroElemental prefix
- `live` = Environment (live or test)
- `x...` = 32 random characters

The actual key is only shown once during creation. After that, only a prefix is stored for identification purposes.

## Creating API Keys

### Via UI

1. Navigate to your organization dashboard
2. Click "API Keys" in the navigation
3. Click "Create API Key"
4. Fill in the form:
   - **Name**: A descriptive name (e.g., "Production API", "Mobile App")
   - **Scopes**: Select required permissions
   - **Expiration** (optional): Set expiration in days (1-365)
5. Copy the generated key immediately - you won't see it again!

### Via API

```bash
POST /api/organizations/{organizationId}/api-keys
Content-Type: application/json
Authorization: Bearer {session-token}

{
  "name": "Production API",
  "scopes": ["credits:read", "members:read"],
  "expiresInDays": 90
}
```

**Response:**

```json
{
  "success": true,
  "apiKey": "ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "keyData": {
    "id": "uuid",
    "name": "Production API",
    "key_prefix": "ne_live_xxxx...",
    "scopes": ["credits:read", "members:read"],
    "expires_at": "2024-12-31T23:59:59Z",
    "is_active": true,
    "created_at": "2024-09-15T10:30:00Z"
  }
}
```

## Available Scopes

### Credits Management

- **`credits:read`** - Read credit balance and transaction history
- **`credits:write`** - Add or subtract credits

### Member Management

- **`members:read`** - View organization members and their roles
- **`members:write`** - Invite and manage members

### Organization

- **`org:read`** - Read organization details and settings
- **`org:write`** - Update organization settings

### Analytics & Reporting

- **`analytics:read`** - Access analytics data and reports

### Courses

- **`courses:read`** - View course information
- **`courses:enroll`** - Enroll users in courses

## Rate Limits

All API requests are subject to rate limiting to ensure fair usage and platform stability. Rate limits are enforced **per organization** and vary by tier.

### Rate Limit Tiers

| Tier | Per Minute | Per Hour | Per Day | Webhooks/Minute | Price |
|------|------------|----------|---------|-----------------|-------|
| **Free** | 10 | 100 | 1,000 | 5 | Free |
| **Starter** | 30 | 500 | 5,000 | 10 | $29/mo |
| **Professional** | 100 | 2,000 | 20,000 | 20 | $99/mo |
| **Enterprise** | 500 | 10,000 | 100,000 | 50 | Custom |

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

- **X-RateLimit-Limit**: Total requests allowed in current window
- **X-RateLimit-Remaining**: Requests remaining in current window
- **X-RateLimit-Reset**: Unix timestamp when limit resets

### Rate Limit Errors

When you exceed your rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 45 seconds.",
  "limit": 100,
  "remaining": 0,
  "reset": 1634567890
}
```

**Response Headers:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1634567890
```

### Best Practices

1. **Monitor headers**: Check `X-RateLimit-Remaining` to avoid hitting limits
2. **Implement backoff**: Respect `Retry-After` header when rate limited
3. **Batch requests**: Combine multiple operations when possible
4. **Upgrade tier**: Choose a tier that matches your usage patterns
5. **Cache responses**: Reduce unnecessary API calls

### Upgrade Your Tier

To increase your rate limits:

1. Navigate to **Organization → Rate Limits** in the dashboard
2. View current usage and available tiers
3. Select **Upgrade** on your desired tier
4. Complete the payment process

Enterprise customers can contact sales for custom limits.

## Using API Keys

API keys can be provided in two ways:

### Authorization Header (Recommended)

```bash
Authorization: Bearer ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Custom Header

```bash
X-API-Key: ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## API Routes

All API routes support **both session and API key authentication**. Use whichever is appropriate:
- **Web app**: Session cookies (automatic)
- **External apps**: API keys (explicit)

### Get Organization Credits

```bash
GET /api/organizations/{organizationId}/credits
Authorization: Bearer {api-key}
```

**Required Scope:** `credits:read` (API key only, session bypasses)

**Response:**

```json
{
  "organization_id": "uuid",
  "organization_name": "Acme Inc",
  "credits": {
    "course": 150,
    "api": 1000,
    "storage": 500
  },
  "updated_at": "2024-09-15T10:30:00Z"
}
```

### Add Organization Credits

```bash
POST /api/organizations/{organizationId}/credits
Authorization: Bearer {api-key}
Content-Type: application/json

{
  "credit_type": "course",
  "amount": 100,
  "notes": "Bulk purchase"
}
```

**Required Scope:** `credits:write` (API key only)

**Response:**

```json
{
  "success": true,
  "organization_id": "uuid",
  "credit_type": "course",
  "amount_added": 100,
  "new_balance": 250,
  "timestamp": "2024-09-15T10:30:00Z"
}
```

### Get Organization Members

```bash
GET /api/organizations/{organizationId}/members
Authorization: Bearer {api-key}
```

**Required Scope:** `members:read` (API key only)

**Query Parameters:**
- `role` - Filter by role (owner, admin, member)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**

```json
{
  "members": [
    {
      "user_id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "admin",
      "joined_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0,
  "has_more": false
}
```

### Invite Organization Member

```bash
POST /api/organizations/{organizationId}/members
Authorization: Bearer {api-key}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "member"
}
```

**Required Scope:** `members:write` (API key only)

**Response:**

```json
{
  "success": true,
  "invitation_id": "uuid",
  "email": "newuser@example.com",
  "role": "member",
  "expires_at": "2024-09-22T10:30:00Z",
  "message": "Invitation sent successfully",
  "timestamp": "2024-09-15T10:30:00Z"
}
```

## Security Best Practices

### Storage

✅ **DO:**
- Store API keys in environment variables
- Use secrets management systems (AWS Secrets Manager, HashiCorp Vault)
- Encrypt keys at rest

❌ **DON'T:**
- Commit keys to version control
- Hardcode keys in application code
- Share keys via email or chat

### Permissions

✅ **DO:**
- Use minimal required scopes (principle of least privilege)
- Create separate keys for different applications
- Set expiration dates for temporary access

❌ **DON'T:**
- Use wildcard or "admin" scopes unless absolutely necessary
- Share keys between applications
- Use production keys in development/testing

### Monitoring

✅ **DO:**
- Monitor API key usage via the dashboard
- Set up alerts for unusual activity
- Regularly rotate keys
- Revoke unused keys

❌ **DON'T:**
- Ignore "last used" timestamps
- Keep inactive keys enabled
- Skip regular security audits

### Key Rotation

Best practices for rotating API keys:

1. Create a new API key with same scopes
2. Update your application to use the new key
3. Monitor for 24 hours to ensure everything works
4. Revoke the old key
5. Document the rotation in your security log

## Code Examples

### Node.js / TypeScript

```typescript
import axios from 'axios'

const API_KEY = process.env.NEUROELEMENTAL_API_KEY
const ORG_ID = process.env.ORG_ID
const BASE_URL = 'https://app.neuroelemental.com/api'

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
})

// Get organization credits
async function getCredits() {
  try {
    const response = await client.get(`/organizations/${ORG_ID}/credits`)
    console.log('Credits:', response.data.credits)
    return response.data
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

// Add credits to organization
async function addCredits(creditType: string, amount: number) {
  try {
    const response = await client.post(
      `/organizations/${ORG_ID}/credits`,
      { credit_type: creditType, amount, notes: 'API purchase' }
    )
    console.log('Credits added:', response.data)
    return response.data
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

// Get organization members
async function getMembers() {
  try {
    const response = await client.get(`/organizations/${ORG_ID}/members`)
    console.log('Members:', response.data.members)
    return response.data
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

// Invite new member
async function inviteMember(email: string, role: string = 'member') {
  try {
    const response = await client.post(
      `/organizations/${ORG_ID}/members`,
      { email, role }
    )
    console.log('Invitation sent:', response.data)
    return response.data
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

// Run examples
getCredits()
```

### Python

```python
import os
import requests

API_KEY = os.getenv('NEUROELEMENTAL_API_KEY')
ORG_ID = os.getenv('ORG_ID')
BASE_URL = 'https://app.neuroelemental.com/api'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
}

def get_credits():
    """Get organization credits"""
    response = requests.get(
        f'{BASE_URL}/organizations/{ORG_ID}/credits',
        headers=headers
    )
    response.raise_for_status()
    return response.json()

def add_credits(credit_type: str, amount: int):
    """Add credits to organization"""
    response = requests.post(
        f'{BASE_URL}/organizations/{ORG_ID}/credits',
        headers=headers,
        json={'credit_type': credit_type, 'amount': amount, 'notes': 'API purchase'}
    )
    response.raise_for_status()
    return response.json()

def get_members(role: str = None, limit: int = 50):
    """Get organization members"""
    params = {'limit': limit}
    if role:
        params['role'] = role

    response = requests.get(
        f'{BASE_URL}/organizations/{ORG_ID}/members',
        headers=headers,
        params=params
    )
    response.raise_for_status()
    return response.json()

def invite_member(email: str, role: str = 'member'):
    """Invite new member"""
    response = requests.post(
        f'{BASE_URL}/organizations/{ORG_ID}/members',
        headers=headers,
        json={'email': email, 'role': role}
    )
    response.raise_for_status()
    return response.json()

if __name__ == '__main__':
    credits = get_credits()
    print(f"Credits: {credits['credits']}")
```

### cURL

```bash
# Get organization credits
curl -X GET \
  "https://app.neuroelemental.com/api/organizations/{ORG_ID}/credits" \
  -H "Authorization: Bearer ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Add credits
curl -X POST \
  "https://app.neuroelemental.com/api/organizations/{ORG_ID}/credits" \
  -H "Authorization: Bearer ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "credit_type": "course",
    "amount": 100,
    "notes": "Bulk purchase"
  }'

# Get members
curl -X GET \
  "https://app.neuroelemental.com/api/organizations/{ORG_ID}/members?limit=50" \
  -H "Authorization: Bearer ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Invite member
curl -X POST \
  "https://app.neuroelemental.com/api/organizations/{ORG_ID}/members" \
  -H "Authorization: Bearer ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "member"
  }'
```

### Error Handling

All API errors follow a consistent format:

```json
{
  "error": "Missing required scope: credits:write",
  "code": "FORBIDDEN",
  "timestamp": "2024-09-15T10:30:00Z"
}
```

Common error codes:

- **401 UNAUTHORIZED** - Missing or invalid API key
- **403 FORBIDDEN** - Insufficient permissions (missing scope)
- **404 NOT_FOUND** - Resource not found
- **429 TOO_MANY_REQUESTS** - Rate limit exceeded
- **500 INTERNAL_SERVER_ERROR** - Server error

## Managing API Keys

### List All Keys

```bash
GET /api/organizations/{organizationId}/api-keys
Authorization: Bearer {session-token}
```

### Revoke a Key

```bash
PATCH /api/organizations/{organizationId}/api-keys/{keyId}
Authorization: Bearer {session-token}
```

This soft-deletes the key (sets `is_active` to false). The key can no longer be used but remains in the database for audit purposes.

### Delete a Key Permanently

```bash
DELETE /api/organizations/{organizationId}/api-keys/{keyId}
Authorization: Bearer {session-token}
```

This permanently removes the key from the database. Cannot be undone.

## Troubleshooting

### "Invalid API key" Error

- Verify the key is correct (check for typos)
- Ensure the key hasn't been revoked
- Check if the key has expired

### "Missing required scope" Error

- Check which scope is required in the error message
- Verify your API key has that scope
- Create a new key with additional scopes if needed

### "Organization not found" Error

- Verify the organization ID in the URL is correct
- Ensure your API key is associated with the correct organization

## Support

For additional help:

- Email: api-support@neuroelemental.com
- Documentation: https://docs.neuroelemental.com/api
- Status Page: https://status.neuroelemental.com
