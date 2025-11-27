/**
 * SAML Service Provider Metadata Endpoint
 * Provides SP metadata for IdP configuration
 * This is a public endpoint (no auth required - used by IdP admins)
 */

import { NextResponse } from 'next/server'
import { getSSOProvider } from '@/lib/sso/manage'
import { generateSAMLMetadata } from '@/lib/sso/saml'
import { createPublicRoute, notFoundError, badRequestError } from '@/lib/api'
import { getAppUrl } from '@/lib/utils'
/**
 * GET /api/sso/saml/metadata/[organizationId]
 * SAML Service Provider metadata
 * Returns XML metadata for IdP configuration
 */
export const GET = createPublicRoute<{ organizationId: string }>(async (request, context) => {
  const { organizationId } = await context.params

  // Get SSO provider configuration
  const provider = await getSSOProvider(organizationId)

  if (!provider) {
    throw notFoundError('SSO provider')
  }

  if (provider.provider_type !== 'saml') {
    throw badRequestError('Not a SAML provider')
  }

  // Generate metadata
  const baseUrl = getAppUrl()
  const entityId = `${baseUrl}/api/sso/saml/sp/${organizationId}`
  const acsUrl = `${baseUrl}/api/sso/saml/acs`

  const metadata = generateSAMLMetadata(entityId, acsUrl)

  // Return XML with proper content type
  return new NextResponse(metadata, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="saml-sp-metadata-${organizationId}.xml"`,
    },
  })
})
