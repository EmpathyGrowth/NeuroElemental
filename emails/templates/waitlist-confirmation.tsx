/**
 * Waitlist Confirmation Email Template
 * Sent when someone joins a course waitlist
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface WaitlistConfirmationEmailProps {
  name?: string
  courseName?: string
  email: string
}

export const WaitlistConfirmationEmail = ({
  name,
  courseName,
  email = 'user@example.com',
}: WaitlistConfirmationEmailProps) => {
  const previewText = courseName
    ? `You're on the waitlist for ${courseName}`
    : "You're on our waitlist!"

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're on the list!</Heading>

          <Text style={text}>
            {name ? `Hi ${name}` : 'Hi there'},
          </Text>

          <Text style={text}>
            Thanks for your interest in{' '}
            {courseName ? (
              <strong>{courseName}</strong>
            ) : (
              'our upcoming courses'
            )}
            ! We've added <strong>{email}</strong> to our waitlist.
          </Text>

          <Text style={text}>
            We'll notify you as soon as{' '}
            {courseName ? 'this course becomes' : 'new courses become'} available.
            You'll be among the first to know!
          </Text>

          <div style={infoBox}>
            <Text style={infoText}>
              <strong>What happens next?</strong>
            </Text>
            <ul style={list}>
              <li style={listItem}>
                We'll send you an email when the course is ready
              </li>
              <li style={listItem}>
                You'll get early access before the general public
              </li>
              <li style={listItem}>
                You may receive exclusive discounts and offers
              </li>
            </ul>
          </div>

          <Text style={text}>
            Keep an eye on your inbox - we'll be in touch soon!
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The NeuroElemental Team
            <br />
            <br />
            <span style={smallText}>
              You're receiving this because you signed up for our waitlist. If
              this wasn't you, you can safely ignore this email.
            </span>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WaitlistConfirmationEmail

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

const infoBox = {
  backgroundColor: '#f0f7ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px',
}

const infoText = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 12px 0',
}

const list = {
  margin: '0',
  paddingLeft: '20px',
}

const listItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 24px 16px',
  textAlign: 'center' as const,
}

const smallText = {
  fontSize: '12px',
  color: '#999',
}
