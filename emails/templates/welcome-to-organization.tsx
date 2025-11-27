/**
 * Welcome to Organization Email Template
 * Sent when a user successfully joins an organization
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

interface WelcomeToOrganizationEmailProps {
  userName: string
  organizationName: string
  role: string
  dashboardUrl: string
}

export const WelcomeToOrganizationEmail = ({
  userName = 'User',
  organizationName = 'Acme Corporation',
  role = 'member',
  dashboardUrl = 'https://example.com/dashboard',
}: WelcomeToOrganizationEmailProps) => {
  const previewText = `Welcome to ${organizationName}!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to {organizationName}!</Heading>

          <Text style={text}>
            Hi {userName},
          </Text>

          <Text style={text}>
            You've successfully joined <strong>{organizationName}</strong> as a{' '}
            <strong>{role}</strong>. We're excited to have you on board!
          </Text>

          <Text style={text}>
            As a {role}, you'll be able to:
          </Text>

          <ul style={list}>
            {role === 'owner' || role === 'admin' ? (
              <>
                <li style={listItem}>Manage organization members</li>
                <li style={listItem}>Add and deduct credits</li>
                <li style={listItem}>Access all organization courses</li>
                <li style={listItem}>View analytics and reports</li>
              </>
            ) : (
              <>
                <li style={listItem}>Access organization courses</li>
                <li style={listItem}>Track your learning progress</li>
                <li style={listItem}>Earn certificates</li>
                <li style={listItem}>Collaborate with team members</li>
              </>
            )}
          </ul>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Go to Dashboard
            </Button>
          </Section>

          <Text style={text}>
            If you have any questions, feel free to reach out to your organization
            administrator.
          </Text>

          <Text style={footer}>
            Happy learning!
            <br />
            The NeuroElemental Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeToOrganizationEmail

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
