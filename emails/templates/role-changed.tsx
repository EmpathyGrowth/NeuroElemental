/**
 * Role Changed Email Template
 * Sent when a user's role in an organization is updated
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface RoleChangedEmailProps {
  userName: string
  organizationName: string
  oldRole: string
  newRole: string
  changedBy: string
  dashboardUrl: string
}

export const RoleChangedEmail = ({
  userName = 'User',
  organizationName = 'Acme Corporation',
  oldRole = 'member',
  newRole = 'admin',
  changedBy = 'Organization Owner',
  dashboardUrl = 'https://example.com/dashboard',
}: RoleChangedEmailProps) => {
  const isPromotion =
    (oldRole === 'member' && (newRole === 'admin' || newRole === 'owner')) ||
    (oldRole === 'admin' && newRole === 'owner')

  const previewText = `Your role in ${organizationName} has been updated`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Role Update</Heading>

          <Text style={text}>
            Hi {userName},
          </Text>

          <Text style={text}>
            Your role in <strong>{organizationName}</strong> has been updated by{' '}
            <strong>{changedBy}</strong>.
          </Text>

          <Section style={roleChangeBox}>
            <Text style={roleChangeText}>
              <span style={oldRoleText}>{oldRole}</span>
              {' → '}
              <span style={newRoleText}>{newRole}</span>
            </Text>
          </Section>

          {isPromotion ? (
            <>
              <Text style={text}>
                Congratulations on your new role! As a <strong>{newRole}</strong>,
                you now have additional permissions:
              </Text>

              <ul style={list}>
                {newRole === 'owner' ? (
                  <>
                    <li style={listItem}>Full organization control</li>
                    <li style={listItem}>Manage all members and their roles</li>
                    <li style={listItem}>Manage billing and subscriptions</li>
                    <li style={listItem}>Access to all organization settings</li>
                  </>
                ) : newRole === 'admin' ? (
                  <>
                    <li style={listItem}>Manage organization members</li>
                    <li style={listItem}>Add and deduct credits</li>
                    <li style={listItem}>Access analytics and reports</li>
                    <li style={listItem}>Configure organization settings</li>
                  </>
                ) : null}
              </ul>
            </>
          ) : (
            <Text style={text}>
              Your access permissions have been adjusted accordingly. If you have
              any questions about this change, please contact your organization
              administrator.
            </Text>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              View Organization
            </Button>
          </Section>

          <Text style={footer}>
            The NeuroElemental Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default RoleChangedEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '560px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
}

const roleChangeBox = {
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px',
}

const roleChangeText = {
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
}

const oldRoleText = {
  color: '#666',
  textDecoration: 'line-through',
}

const newRoleText = {
  color: '#007bff',
}

const list = {
  margin: '16px 24px',
  paddingLeft: '20px',
}

const listItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 24px 16px',
  textAlign: 'center' as const,
}
