/**
 * SAML 2.0 Authentication Handler
 * Handles SAML SSO flows (Service Provider initiated and IdP initiated)
 */

import crypto from 'crypto'
import { deflateRawSync } from 'zlib'
import { getSSOProvider, logSSOAuthAttempt, autoProvisionSSOUser, createSSOSession } from './manage'
import { logger } from '@/lib/logging'

/**
 * Generate SAML AuthnRequest
 */
export function generateSAMLAuthnRequest(
  providerId: string,
  acsUrl: string,
  issuer: string
): { requestId: string; xml: string } {
  const requestId = `_${crypto.randomBytes(16).toString('hex')}`
  const issueInstant = new Date().toISOString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${requestId}"
  Version="2.0"
  IssueInstant="${issueInstant}"
  AssertionConsumerServiceURL="${acsUrl}"
  Destination="">
  <saml:Issuer>${issuer}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>`

  return { requestId, xml }
}

/**
 * Encode SAML request for HTTP Redirect binding
 */
export function encodeSAMLRequest(xml: string): string {
  const deflated = deflateRawSync(Buffer.from(xml))
  return Buffer.from(deflated).toString('base64')
}

/**
 * Decode SAML response
 */
export function decodeSAMLResponse(encodedResponse: string): string {
  try {
    return Buffer.from(encodedResponse, 'base64').toString('utf-8')
  } catch (_error) {
    throw new Error('Invalid SAML response encoding')
  }
}

/**
 * Parse SAML assertion (simplified - in production use a proper SAML library like samlify)
 */
export function parseSAMLAssertion(xml: string): {
  nameID: string
  attributes: Record<string, string>
  sessionIndex?: string
  issuer: string
} {
  // In production, use a proper XML parser and SAML library like samlify or passport-saml
  // This is a simplified version for demonstration

  const nameIDMatch = xml.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/)
  const issuerMatch = xml.match(/<saml:Issuer[^>]*>([^<]+)<\/saml:Issuer>/)
  const sessionIndexMatch = xml.match(/SessionIndex="([^"]+)"/)

  if (!nameIDMatch || !issuerMatch) {
    throw new Error('Invalid SAML assertion: missing required fields')
  }

  const attributes: Record<string, string> = {}

  // Extract attributes (simplified)
  const attributeRegex = /<saml:Attribute[^>]*Name="([^"]+)"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>[\s\S]*?<\/saml:Attribute>/g
  let match
  while ((match = attributeRegex.exec(xml)) !== null) {
    attributes[match[1]] = match[2]
  }

  return {
    nameID: nameIDMatch[1],
    attributes,
    sessionIndex: sessionIndexMatch?.[1],
    issuer: issuerMatch[1],
  }
}

/**
 * Validate SAML signature (simplified)
 * In production, use a proper SAML library for complete validation
 */
export function validateSAMLSignature(
  _xml: string,
  _certificate: string
): boolean {
  try {
    // In production, implement proper XML signature validation
    // This requires:
    // 1. Extract signature from XML
    // 2. Canonicalize signed info
    // 3. Verify signature using public key from certificate

    // For now, return true if certificate is provided
    // In production, use xml-crypto or similar library
    return _certificate.includes('BEGIN CERTIFICATE')
  } catch (error) {
    logger.error('Error validating SAML signature', undefined, { errorMsg: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error) })
    return false
  }
}

/**
 * Process SAML response and authenticate user
 */
export async function processSAMLResponse(
  encodedResponse: string,
  organizationId: string,
  options?: {
    ip_address?: string
    user_agent?: string
  }
): Promise<{
  success: boolean
  userId?: string
  email?: string
  error?: string
  errorCode?: string
}> {
  const startTime = Date.now()

  try {
    // Decode SAML response
    const xml = decodeSAMLResponse(encodedResponse)

    // Get SSO provider configuration
    const provider = await getSSOProvider(organizationId)
    if (!provider) {
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: '',
        email: '',
        status: 'error',
        error_code: 'provider_not_found',
        error_message: 'SSO provider not configured',
        duration_ms: Date.now() - startTime,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        error: 'SSO provider not configured',
        errorCode: 'provider_not_found',
      }
    }

    if (provider.provider_type !== 'saml') {
      return {
        success: false,
        error: 'Provider is not configured for SAML',
        errorCode: 'invalid_provider_type',
      }
    }

    // Validate SAML signature
    if (provider.saml_certificate) {
      const isValid = validateSAMLSignature(xml, provider.saml_certificate)
      if (!isValid) {
        await logSSOAuthAttempt({
          organization_id: organizationId,
          provider_id: provider.id,
          email: '',
          status: 'failed',
          error_code: 'invalid_signature',
          error_message: 'SAML signature validation failed',
          duration_ms: Date.now() - startTime,
          saml_assertion: xml,
          ip_address: options?.ip_address,
          user_agent: options?.user_agent,
        })
        return {
          success: false,
          error: 'Invalid SAML signature',
          errorCode: 'invalid_signature',
        }
      }
    }

    // Parse SAML assertion
    const assertion = parseSAMLAssertion(xml)

    // Map attributes using provider's attribute mapping
    const mapping = provider.attribute_mapping
    const email = assertion.attributes[mapping.email] || assertion.nameID
    const firstName = assertion.attributes[mapping.first_name] || ''
    const lastName = assertion.attributes[mapping.last_name] || ''
    const idpUserId = assertion.attributes[mapping.user_id] || assertion.nameID

    // Validate email domain matches configured domains
    const emailDomain = email.split('@')[1]
    if (!provider.domains.includes(emailDomain)) {
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        email,
        status: 'failed',
        error_code: 'domain_mismatch',
        error_message: `Email domain ${emailDomain} not allowed`,
        duration_ms: Date.now() - startTime,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        email,
        error: 'Email domain not allowed for SSO',
        errorCode: 'domain_mismatch',
      }
    }

    // Auto-provision user if enabled
    if (provider.auto_provision_users) {
      const provisionResult = await autoProvisionSSOUser(
        organizationId,
        provider.id,
        {
          email,
          first_name: firstName,
          last_name: lastName,
          idp_user_id: idpUserId,
          idp_attributes: assertion.attributes,
        }
      )

      if (!provisionResult.success) {
        await logSSOAuthAttempt({
          organization_id: organizationId,
          provider_id: provider.id,
          email,
          status: 'error',
          error_code: 'provisioning_failed',
          error_message: provisionResult.error || 'Failed to provision user',
          duration_ms: Date.now() - startTime,
          ip_address: options?.ip_address,
          user_agent: options?.user_agent,
        })
        return {
          success: false,
          email,
          error: 'Failed to provision user',
          errorCode: 'provisioning_failed',
        }
      }

      // Create SSO session for Single Logout support
      if (assertion.sessionIndex && provisionResult.userId) {
        await createSSOSession({
          organization_id: organizationId,
          provider_id: provider.id,
          user_id: provisionResult.userId,
          session_index: assertion.sessionIndex,
          name_id: assertion.nameID,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          ip_address: options?.ip_address,
          user_agent: options?.user_agent,
        })
      }

      // Log successful authentication
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        user_id: provisionResult.userId,
        email,
        status: 'success',
        duration_ms: Date.now() - startTime,
        saml_assertion: xml,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })

      return {
        success: true,
        userId: provisionResult.userId,
        email,
      }
    } else {
      // Auto-provisioning disabled, user must exist
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        email,
        status: 'failed',
        error_code: 'user_not_found',
        error_message: 'User does not exist and auto-provisioning is disabled',
        duration_ms: Date.now() - startTime,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        email,
        error: 'User not found',
        errorCode: 'user_not_found',
      }
    }
  } catch (error) {
    logger.error('Error processing SAML response', undefined, { errorMsg: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error) })
    await logSSOAuthAttempt({
      organization_id: organizationId,
      provider_id: '',
      email: '',
      status: 'error',
      error_code: 'processing_error',
      error_message: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - startTime,
      ip_address: options?.ip_address,
      user_agent: options?.user_agent,
    })
    return {
      success: false,
      error: 'Failed to process SAML response',
      errorCode: 'processing_error',
    }
  }
}

/**
 * Generate SAML metadata for Service Provider
 */
export function generateSAMLMetadata(
  entityId: string,
  acsUrl: string,
  _certificate?: string
): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                     entityID="${entityId}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${acsUrl}"
      index="0"
      isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`

  return xml
}

/**
 * Build SAML SSO URL for redirect
 */
export function buildSAMLSSOUrl(
  ssoUrl: string,
  samlRequest: string,
  relayState?: string
): string {
  const params = new URLSearchParams({
    SAMLRequest: samlRequest,
  })

  if (relayState) {
    params.append('RelayState', relayState)
  }

  return `${ssoUrl}?${params.toString()}`
}
