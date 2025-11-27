/**
 * Single Sign-On Barrel Export
 * Centralizes all SSO functionality
 */

// SSO Management
export {
  getSSOProvider,
  createSSOProvider,
  updateSSOProvider,
  deleteSSOProvider,
  checkSSORequired,
  logSSOAuthAttempt,
  getSSOAuthAttempts,
  getSSOUserMapping,
  autoProvisionSSOUser,
  createSSOSession,
  getUserSSOSessions,
  logoutSSOSession,
  testSSOProvider,
  type SSOProvider,
  type SSOAuthAttempt,
  type SSOUserMapping,
} from './manage'

// SAML handlers
export {
  generateSAMLAuthnRequest,
  processSAMLResponse,
  validateSAMLSignature,
  generateSAMLMetadata,
  encodeSAMLRequest,
  decodeSAMLResponse,
  parseSAMLAssertion,
  buildSAMLSSOUrl,
} from './saml'

// OAuth handlers
export {
  generateOAuthAuthorizationUrl,
  processOAuthCallback,
  refreshOAuthToken,
  exchangeOAuthCode,
  fetchOAuthUserInfo,
  decodeJWT,
} from './oauth'
