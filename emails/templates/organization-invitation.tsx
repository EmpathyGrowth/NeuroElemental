/**
 * Organization Invitation Email Template
 * Sent when a user is invited to join an organization
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

interface OrganizationInvitationEmailProps {
  inviteeEmail: string
  organizationName: string
  inviterName: string
  role: string
  inviteUrl: string
}

export const OrganizationInvitationEmail = ({
  inviteeEmail = 'user@example.com',
  organizationName = 'Acme Corporation',
  inviterName = 'John Doe',
  role = 'member',
  inviteUrl = 'https://example.com/invite/123',
}: OrganizationInvitationEmailProps) => {
  const previewText = `You've been invited to join ${organizationName} on NeuroElemental`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Organization Invitation</Heading>

          <Text style={text}>
            Hi there,
          </Text>

          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join{' '}
            <strong>{organizationName}</strong> on NeuroElemental as a{' '}
            <strong>{role}</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={inviteUrl}>
              Accept Invitation
            </Button>
          </Section>

          <Text style={text}>
            This invitation is for <strong>{inviteeEmail}</strong>. If you weren't
            expecting this invitation, you can safely ignore this email.
          </Text>

          <Text style={footer}>
            The invitation link will expire in 7 days.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OrganizationInvitationEmail

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
  margin: '16px 24px',
}
