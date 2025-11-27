# Single Sign-On (SSO) Guide

Complete guide to configuring and using Single Sign-On (SSO) for enterprise authentication in NeuroElemental.

## Table of Contents

- [Overview](#overview)
- [Supported Providers](#supported-providers)
- [Configuration](#configuration)
- [SAML Setup](#saml-setup)
- [OAuth/OIDC Setup](#oauthoidc-setup)
- [User Provisioning](#user-provisioning)
- [Authentication Flow](#authentication-flow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

## Overview

NeuroElemental supports enterprise Single Sign-On (SSO) through industry-standard protocols:

- **SAML 2.0** - Works with Okta, OneLogin, Azure AD, and other SAML identity providers
- **OAuth 2.0** - Works with Google, GitHub, GitLab, and other OAuth providers
- **OpenID Connect (OIDC)** - Works with Auth0, Keycloak, and other OIDC providers

### Key Features

✅ **Domain-based SSO Enforcement** - Automatically require SSO for specific email domains
✅ **Just-in-Time (JIT) Provisioning** - Automatically create user accounts on first login
✅ **Flexible Attribute Mapping** - Map identity provider attributes to user fields
✅ **Audit Logging** - Track all SSO authentication attempts
✅ **Multiple Identity Providers** - Support for major enterprise IdPs
✅ **Single Logout (SLO)** - SAML Single Logout support (coming soon)

## Supported Providers

### SAML 2.0 Providers

- **Okta** - Full support
- **OneLogin** - Full support
- **Azure AD (Microsoft Entra ID)** - Full support
- **Google Workspace** - Full support
- **PingIdentity** - Full support
- **Auth0** - Full support (SAML)
- **Any SAML 2.0 compliant IdP**

### OAuth/OIDC Providers

- **Google Workspace** - Full support (OIDC)
- **Azure AD (Microsoft Entra ID)** - Full support (OIDC)
- **Auth0** - Full support (OIDC)
- **Keycloak** - Full support (OIDC)
- **GitHub** - Full support (OAuth 2.0)
- **GitLab** - Full support (OAuth 2.0)
- **Any OAuth 2.0/OIDC compliant provider**

## Configuration

### Prerequisites

1. Organization owner or admin access
2. Identity provider admin access (to configure SSO)
3. Email domains you want to enable SSO for

### Configuration Steps

1. **Navigate to SSO Settings**
   ```
   Organization Dashboard → SSO
   ```

2. **Click "Configure SSO"**

3. **Select Provider Type**
   - SAML 2.0 (recommended for enterprises)
   - OAuth 2.0
   - OpenID Connect (OIDC)

4. **Enter Provider Details**
   - Provider name (e.g., "Okta", "Azure AD")
   - Email domains (e.g., `acme.com`, `acme.co.uk`)

5. **Configure Provider-Specific Settings**
   - See [SAML Setup](#saml-setup) or [OAuth/OIDC Setup](#oauthoidc-setup)

6. **Set User Provisioning Options**
   - **Auto-provision users**: Create accounts automatically on first login
   - **Default role**: Role assigned to auto-provisioned users (member, admin, owner)
   - **Enforce SSO**: Require SSO for configured domains

7. **Test Configuration**
   - Click "Test Connection" to validate settings

8. **Save Configuration**

## SAML Setup

### Step 1: Configure NeuroElemental as Service Provider (SP)

1. Navigate to **Organization Dashboard → SSO**
2. Note the following Service Provider details:

```
Entity ID (Issuer):
https://app.neuroelemental.com/api/sso/saml/sp/{organizationId}

Assertion Consumer Service (ACS) URL:
https://app.neuroelemental.com/api/sso/saml/acs

Name ID Format:
urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
```

3. Download SP metadata:
   - Click "Download Metadata" button
   - Upload to your Identity Provider

### Step 2: Configure Identity Provider (IdP)

Configure your IdP with the following:

#### Okta Configuration

1. **Create new SAML 2.0 App Integration**
2. **General Settings**:
   - App name: `NeuroElemental`
   - App logo: (optional)
3. **SAML Settings**:
   - Single sign on URL: `https://app.neuroelemental.com/api/sso/saml/acs`
   - Audience URI (SP Entity ID): `https://app.neuroelemental.com/api/sso/saml/sp/{orgId}`
   - Name ID format: `EmailAddress`
   - Application username: `Email`
4. **Attribute Statements** (optional):
   ```
   firstName  → user.firstName
   lastName   → user.lastName
   email      → user.email
   ```
5. **Assign Users**: Assign users/groups who should have access

#### Azure AD Configuration

1. **Add Enterprise Application**
2. **Create your own application**:
   - Name: `NeuroElemental`
   - Select: `Integrate any other application you don't find in the gallery (Non-gallery)`
3. **Set up Single Sign-On**:
   - Select SAML
   - **Basic SAML Configuration**:
     - Identifier (Entity ID): `https://app.neuroelemental.com/api/sso/saml/sp/{orgId}`
     - Reply URL (ACS): `https://app.neuroelemental.com/api/sso/saml/acs`
   - **User Attributes & Claims**:
     ```
     Unique User Identifier: user.mail
     email: user.mail
     firstName: user.givenname
     lastName: user.surname
     ```
4. **Assign users and groups**

#### Google Workspace Configuration

1. **Add custom SAML app**
2. **Google Identity Provider details**:
   - Download IdP metadata or note:
     - SSO URL
     - Entity ID
     - Certificate
3. **Service Provider details**:
   - ACS URL: `https://app.neuroelemental.com/api/sso/saml/acs`
   - Entity ID: `https://app.neuroelemental.com/api/sso/saml/sp/{orgId}`
   - Name ID format: `EMAIL`
4. **Attribute Mapping**:
   ```
   Basic Information:
   - First name → firstName
   - Last name → lastName
   - Primary email → email
   ```

### Step 3: Configure NeuroElemental with IdP Details

1. **Return to NeuroElemental SSO Settings**
2. **Enter IdP Configuration**:

   - **IdP Entity ID**: From your IdP metadata
     ```
     Example (Okta): http://www.okta.com/exk1234567890
     Example (Azure): https://sts.windows.net/tenant-id/
     Example (Google): https://accounts.google.com/o/saml2?idpid=C12345
     ```

   - **IdP SSO URL**: From your IdP metadata
     ```
     Example (Okta): https://yourcompany.okta.com/app/yourapp/exk123/sso/saml
     Example (Azure): https://login.microsoftonline.com/tenant-id/saml2
     Example (Google): https://accounts.google.com/o/saml2/idp?idpid=C12345
     ```

   - **X.509 Certificate**: Copy-paste the certificate (PEM format)
     ```
     -----BEGIN CERTIFICATE-----
     MIIDpDCCAoygAwIBAgIGAXoK...
     ...
     -----END CERTIFICATE-----
     ```

3. **Configure Attribute Mapping** (match your IdP):
   ```
   Email: email (or mail, emailAddress)
   First Name: firstName (or givenName, given_name)
   Last Name: lastName (or surname, family_name)
   User ID: nameID (or sub, email)
   ```

4. **Save Configuration**

## OAuth/OIDC Setup

### Google Workspace (OIDC)

#### Step 1: Create OAuth 2.0 Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services → Credentials**
3. **Create Credentials → OAuth client ID**
4. **Application type**: Web application
5. **Authorized redirect URIs**:
   ```
   https://app.neuroelemental.com/api/sso/oauth/callback
   ```
6. **Note your credentials**:
   - Client ID: `123456789-abc123.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-...`

#### Step 2: Configure NeuroElemental

1. **Provider Type**: OpenID Connect (OIDC)
2. **Provider Name**: Google Workspace
3. **Domains**: Your Google Workspace domains
4. **OAuth Configuration**:
   ```
   Client ID: [Your Client ID]
   Client Secret: [Your Client Secret]
   Authorize URL: https://accounts.google.com/o/oauth2/v2/auth
   Token URL: https://oauth2.googleapis.com/token
   UserInfo URL: https://openidconnect.googleapis.com/v1/userinfo
   Scopes: openid, profile, email
   ```
5. **Attribute Mapping**:
   ```
   Email: email
   First Name: given_name
   Last Name: family_name
   User ID: sub
   ```

### Azure AD (OIDC)

#### Step 1: Register Application

1. **Azure Portal → Azure Active Directory**
2. **App registrations → New registration**
3. **Name**: NeuroElemental
4. **Redirect URI**:
   ```
   Web: https://app.neuroelemental.com/api/sso/oauth/callback
   ```
5. **Certificates & secrets → New client secret**
   - Note the secret value immediately

#### Step 2: Configure API Permissions

1. **API permissions → Add a permission**
2. **Microsoft Graph → Delegated permissions**:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
3. **Grant admin consent** (if required)

#### Step 3: Configure NeuroElemental

1. **Provider Type**: OpenID Connect (OIDC)
2. **Provider Name**: Azure AD
3. **Domains**: Your Azure AD domains
4. **OAuth Configuration**:
   ```
   Client ID: [Application (client) ID]
   Client Secret: [Client secret value]
   Authorize URL: https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize
   Token URL: https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token
   UserInfo URL: https://graph.microsoft.com/oidc/userinfo
   Scopes: openid, profile, email
   ```
5. **Attribute Mapping**:
   ```
   Email: email
   First Name: given_name
   Last Name: family_name
   User ID: sub
   ```

### Auth0 (OIDC)

#### Step 1: Create Application

1. **Auth0 Dashboard → Applications → Create Application**
2. **Name**: NeuroElemental
3. **Type**: Regular Web Application
4. **Settings**:
   - **Allowed Callback URLs**:
     ```
     https://app.neuroelemental.com/api/sso/oauth/callback
     ```
   - **Allowed Logout URLs**:
     ```
     https://app.neuroelemental.com
     ```

#### Step 2: Configure NeuroElemental

1. **Provider Type**: OpenID Connect (OIDC)
2. **Provider Name**: Auth0
3. **Domains**: Your company domains
4. **OAuth Configuration**:
   ```
   Client ID: [Your Client ID]
   Client Secret: [Your Client Secret]
   Authorize URL: https://yourcompany.auth0.com/authorize
   Token URL: https://yourcompany.auth0.com/oauth/token
   UserInfo URL: https://yourcompany.auth0.com/userinfo
   Scopes: openid, profile, email
   ```
5. **Attribute Mapping**:
   ```
   Email: email
   First Name: given_name
   Last Name: family_name
   User ID: sub
   ```

## User Provisioning

### Just-in-Time (JIT) Provisioning

When **Auto-provision users** is enabled:

1. User attempts to log in via SSO
2. IdP authenticates the user
3. NeuroElemental receives user attributes
4. If user doesn't exist:
   - New user account is created
   - User is added to organization with default role
   - SSO mapping is created
5. User is logged in

### Manual Provisioning

When **Auto-provision users** is disabled:

1. Admin must manually invite users to the organization first
2. Users can then log in via SSO
3. SSO login will be rejected if user doesn't exist in the organization

### Default Roles

Choose the default role for auto-provisioned users:

- **Member** (recommended) - Standard access
- **Admin** - Administrative access (use carefully)
- **Owner** - Full control (not recommended for auto-provisioning)

## Authentication Flow

### SAML Flow

```
1. User enters email on login page
2. System checks if SSO is required for email domain
3. If SSO required:
   a. Generate SAML AuthnRequest
   b. Redirect user to IdP SSO URL
4. User authenticates at IdP
5. IdP sends SAML Response to ACS endpoint
6. System validates SAML assertion and signature
7. System extracts user attributes
8. System provisions/updates user account
9. User is logged in and redirected to dashboard
```

### OAuth/OIDC Flow

```
1. User enters email on login page
2. System checks if SSO is required for email domain
3. If SSO required:
   a. Generate OAuth authorization URL with state
   b. Redirect user to IdP authorization endpoint
4. User authenticates at IdP
5. IdP redirects to callback URL with authorization code
6. System exchanges code for access token
7. System fetches user info from IdP
8. System provisions/updates user account
9. User is logged in and redirected to dashboard
```

## Testing

### Test SSO Configuration

1. **Use the Test Button**:
   - Navigate to **SSO Settings**
   - Click **Test Connection**
   - System validates:
     - SAML: Entity ID, SSO URL, Certificate format
     - OAuth: Client credentials, URLs
     - Domains configured

2. **Test Authentication Flow**:
   - Log out of NeuroElemental
   - Go to login page
   - Enter an email from configured domain
   - Follow SSO redirect
   - Verify successful login

3. **Check Authentication Attempts Log**:
   - Navigate to **SSO Settings**
   - Scroll to **Authentication Attempts**
   - Filter by status to see successes and failures
   - Review error messages for failed attempts

### Common Test Scenarios

✅ **Successful Login**
- Status: Success (green)
- User account created (if auto-provisioning enabled)
- User redirected to dashboard

❌ **Failed - Invalid Signature**
- SAML signature validation failed
- Check certificate is correct and matches IdP

❌ **Failed - Domain Mismatch**
- User's email domain not in configured domains
- Add domain to SSO configuration

❌ **Failed - User Not Found**
- Auto-provisioning is disabled
- User must be manually invited first

## Troubleshooting

### SAML Issues

#### "Invalid SAML signature"

**Cause**: Certificate mismatch or invalid format

**Solution**:
1. Download latest certificate from IdP
2. Ensure certificate is in PEM format:
   ```
   -----BEGIN CERTIFICATE-----
   MIIDpDCCAoygAwIBAgIGAXoK...
   -----END CERTIFICATE-----
   ```
3. Remove any extra whitespace or characters
4. Update configuration and test again

#### "SAML response expired"

**Cause**: Clock skew between IdP and SP

**Solution**:
1. Check server time is synchronized (NTP)
2. IdP response should be within 5 minutes
3. Contact support if issue persists

#### "Invalid audience"

**Cause**: Entity ID mismatch

**Solution**:
1. Verify Entity ID in NeuroElemental matches IdP configuration
2. Entity ID should be: `https://app.neuroelemental.com/api/sso/saml/sp/{orgId}`
3. Update IdP configuration and retry

### OAuth/OIDC Issues

#### "Invalid client credentials"

**Cause**: Incorrect Client ID or Client Secret

**Solution**:
1. Verify Client ID and Secret from IdP
2. Ensure no extra spaces when copy-pasting
3. Generate new client secret if needed
4. Update NeuroElemental configuration

#### "Redirect URI mismatch"

**Cause**: Callback URL not configured in IdP

**Solution**:
1. Add callback URL to IdP allowed redirects:
   ```
   https://app.neuroelemental.com/api/sso/oauth/callback
   ```
2. Save IdP configuration
3. Retry authentication

#### "Insufficient scopes"

**Cause**: Missing required OAuth scopes

**Solution**:
1. Ensure scopes include at minimum:
   - `openid` (for OIDC)
   - `profile`
   - `email`
2. Update IdP application configuration
3. Update NeuroElemental SSO configuration

### General Issues

#### "Email domain not allowed"

**Cause**: User's email domain not configured

**Solution**:
1. Add user's domain to SSO configuration
2. Multiple domains supported (e.g., `acme.com`, `acme.co.uk`)

#### "User not found"

**Cause**: Auto-provisioning disabled and user doesn't exist

**Solution**:
- **Option 1**: Enable auto-provisioning
- **Option 2**: Manually invite user to organization first

#### "Failed to provision user"

**Cause**: Database error or email already exists in different org

**Solution**:
1. Check authentication attempts log for details
2. Verify email isn't already used in another organization
3. Contact support if issue persists

## Security

### Best Practices

✅ **Certificate Management**
- Regularly update SAML certificates before expiry
- Store certificates securely
- Rotate certificates according to security policy

✅ **Client Secret Rotation**
- Rotate OAuth client secrets periodically (every 90 days)
- Use separate credentials for dev/staging/production

✅ **Domain Enforcement**
- Only configure domains you control
- Enable "Enforce SSO" to prevent password-based logins

✅ **Audit Logging**
- Regularly review authentication attempts
- Monitor for suspicious patterns
- Set up alerts for failed attempts

✅ **Least Privilege**
- Set default role to "member" for auto-provisioned users
- Grant elevated permissions manually when needed

### Security Features

🔒 **Signature Validation**
- SAML assertions are cryptographically validated
- Prevents tampering and replay attacks

🔒 **State Parameter**
- OAuth flows use secure state parameter
- Prevents CSRF attacks

🔒 **HTTPS Enforcement**
- All SSO endpoints require HTTPS
- Credentials encrypted in transit

🔒 **Secure Storage**
- Client secrets encrypted at rest
- Certificates stored securely in database

🔒 **Rate Limiting**
- SSO endpoints protected by rate limiting
- Prevents brute force attacks

### Compliance

NeuroElemental SSO supports compliance with:

- **SOC 2** - Audit logging, secure credential storage
- **GDPR** - Data minimization, user consent
- **HIPAA** - Encrypted storage and transmission
- **ISO 27001** - Security controls and monitoring

## API Reference

### Check if SSO Required

```bash
POST /api/sso/login
Content-Type: application/json

{
  "email": "user@acme.com"
}
```

**Response**:
```json
{
  "sso_required": true,
  "provider": {
    "type": "saml",
    "name": "Okta"
  },
  "redirect_url": "https://yourcompany.okta.com/app/..."
}
```

### Get SSO Provider Configuration

```bash
GET /api/organizations/{organizationId}/sso
Authorization: Bearer {api-key}
```

**Response**:
```json
{
  "id": "uuid",
  "provider_type": "saml",
  "provider_name": "Okta",
  "domains": ["acme.com"],
  "enforce_sso": true,
  "auto_provision_users": true,
  "default_role": "member",
  "is_active": true
}
```

### Get Authentication Attempts

```bash
GET /api/organizations/{organizationId}/sso/attempts?status=success&limit=50
Authorization: Bearer {api-key}
```

**Response**:
```json
{
  "attempts": [
    {
      "id": "uuid",
      "email": "user@acme.com",
      "status": "success",
      "duration_ms": 1250,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 125
}
```

## Support

For SSO configuration assistance:

- **Documentation**: https://docs.neuroelemental.com/sso
- **Email**: enterprise-support@neuroelemental.com
- **Slack**: #enterprise-support (for enterprise customers)

### Enterprise Support

Enterprise customers receive:
- Dedicated SSO setup assistance
- Custom IdP integration support
- 24/7 authentication monitoring
- SLA-backed response times
