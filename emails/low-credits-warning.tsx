/**
 * Low Credits Warning Email
 * Notify organization admins when credits are running low
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

interface LowCreditsWarningEmailProps {
  organizationName: string
  creditType: string
  currentBalance: number
  threshold: number
  purchaseUrl: string
}

export default function LowCreditsWarningEmail({
  organizationName = 'Your Organization',
  creditType = 'course',
  currentBalance = 5,
  threshold = 10,
  purchaseUrl = 'https://example.com/credits/purchase',
}: LowCreditsWarningEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your {organizationName} credit balance is running low ({String(currentBalance)} remaining)
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Credit Balance Alert</Heading>

          <Text style={text}>
            Your organization <strong>{organizationName}</strong> has a low credit balance.
          </Text>

          <Section style={alertBox}>
            <Text style={alertText}>
              <strong>Current Balance:</strong> {currentBalance} {creditType} credits
            </Text>
            <Text style={alertText}>
              <strong>Warning Threshold:</strong> {threshold} credits
            </Text>
          </Section>

          <Text style={text}>
            To ensure uninterrupted access to courses and services, we recommend purchasing
            additional credits soon.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={purchaseUrl}>
              Purchase Credits
            </Button>
          </Section>

          <Text style={text}>
            You can view your complete transaction history and manage your credits in your
            organization dashboard.
          </Text>

          <Text style={footer}>
            This is an automated notification. If you believe this is an error, please contact
            support.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

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
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const alertBox = {
  backgroundColor: '#fff3cd',
  borderLeft: '4px solid #ffc107',
  padding: '20px 40px',
  margin: '24px 40px',
}

const alertText = {
  color: '#856404',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 0',
}

const buttonContainer = {
  padding: '27px 40px',
}

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '24px 0',
  padding: '0 40px',
}
