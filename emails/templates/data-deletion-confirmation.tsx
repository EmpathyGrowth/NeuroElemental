/**
 * Data Deletion Confirmation Email Template
 * Sent when a user requests account deletion to confirm the action
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

interface DataDeletionConfirmationEmailProps {
  email: string
  deletionType: 'account' | 'organization_data'
  confirmUrl: string
  expiresAt: string
}

export const DataDeletionConfirmationEmail = ({
  email = 'user@example.com',
  deletionType = 'account',
  confirmUrl = 'https://example.com/confirm/123',
  expiresAt = '24 hours',
}: DataDeletionConfirmationEmailProps) => {
  const isAccountDeletion = deletionType === 'account'
  const previewText = isAccountDeletion
    ? 'Confirm your account deletion request'
    : 'Confirm your data deletion request'

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isAccountDeletion ? 'Account Deletion Request' : 'Data Deletion Request'}
          </Heading>

          <Text style={text}>
            Hi there,
          </Text>

          <Text style={text}>
            We received a request to {isAccountDeletion ? 'permanently delete your NeuroElemental account' : 'delete your organization data'}.
            This action is <strong>irreversible</strong> and will remove all associated data.
          </Text>

          {isAccountDeletion && (
            <Text style={warningText}>
              <strong>This will permanently delete:</strong>
              <ul style={listStyle}>
                <li>Your profile and account information</li>
                <li>Assessment results and history</li>
                <li>Course enrollments and progress</li>
                <li>Certificates and achievements</li>
                <li>Event registrations</li>
                <li>All personal data</li>
              </ul>
            </Text>
          )}

          <Text style={text}>
            If you want to proceed with deletion, click the button below:
          </Text>

          <Section style={buttonContainer}>
            <Button style={dangerButton} href={confirmUrl}>
              Confirm Deletion
            </Button>
          </Section>

          <Text style={text}>
            If you did not request this deletion, <strong>do not click the button</strong>.
            Your account will remain safe and this request will be ignored.
          </Text>

          <Text style={footer}>
            This link will expire in {expiresAt}. This confirmation was requested for {email}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default DataDeletionConfirmationEmail

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
  color: '#dc2626',
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

const warningText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 24px',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca',
}

const listStyle = {
  margin: '8px 0 0 0',
  paddingLeft: '20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const dangerButton = {
  backgroundColor: '#dc2626',
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
