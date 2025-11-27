/**
 * Credits Purchased Email Template
 * Sent when credits are purchased for an organization
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { formatDate } from '@/lib/utils'

interface CreditsPurchasedEmailProps {
  organizationName: string
  creditType: string
  amount: number
  totalCredits: number
  expirationDate?: string
  dashboardUrl: string
}

export const CreditsPurchasedEmail = ({
  organizationName = 'Acme Corporation',
  creditType = 'course_enrollment',
  amount = 100,
  totalCredits = 250,
  expirationDate,
  dashboardUrl = 'https://example.com/dashboard',
}: CreditsPurchasedEmailProps) => {
  const previewText = `${amount} ${creditType} credits added to ${organizationName}`

  const creditTypeFormatted = creditType
    .split('_')
    .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Credits Purchased</Heading>

          <Text style={text}>
            Great news! Credits have been successfully added to{' '}
            <strong>{organizationName}</strong>.
          </Text>

          <Section style={creditsBox}>
            <div style={creditsAmount}>+{amount}</div>
            <div style={creditsType}>{creditTypeFormatted} Credits</div>
          </Section>

          <Hr style={hr} />

          <Section style={detailsSection}>
            <table style={detailsTable}>
              <tbody>
                <tr>
                  <td style={detailLabel}>Organization:</td>
                  <td style={detailValue}>{organizationName}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Credit Type:</td>
                  <td style={detailValue}>{creditTypeFormatted}</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Amount Added:</td>
                  <td style={detailValue}>{amount} credits</td>
                </tr>
                <tr>
                  <td style={detailLabel}>Total Balance:</td>
                  <td style={detailValue}>
                    <strong>{totalCredits} credits</strong>
                  </td>
                </tr>
                {expirationDate && (
                  <tr>
                    <td style={detailLabel}>Expires:</td>
                    <td style={detailValue}>
                      {formatDate(expirationDate)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />

          <Text style={text}>
            Your team can now use these credits for{' '}
            {creditType === 'course_enrollment'
              ? 'course enrollments'
              : creditType === 'assessment_attempt'
              ? 'assessment attempts'
              : creditType === 'event_registration'
              ? 'event registrations'
              : creditType === 'certificate_generation'
              ? 'certificate generation'
              : creditType === 'ai_tutoring'
              ? 'AI tutoring sessions'
              : 'various activities'}
            .
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              View Dashboard
            </Button>
          </Section>

          <Text style={footer}>
            Thank you for your purchase!
            <br />
            The NeuroElemental Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default CreditsPurchasedEmail

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

const creditsBox = {
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  padding: '32px',
  margin: '24px',
  textAlign: 'center' as const,
}

const creditsAmount = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#007bff',
  margin: '0',
}

const creditsType = {
  fontSize: '18px',
  color: '#666',
  marginTop: '8px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 24px',
}

const detailsSection = {
  margin: '24px',
}

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const detailLabel = {
  color: '#666',
  fontSize: '14px',
  padding: '8px 0',
  verticalAlign: 'top' as const,
}

const detailValue = {
  color: '#333',
  fontSize: '14px',
  padding: '8px 0',
  textAlign: 'right' as const,
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
