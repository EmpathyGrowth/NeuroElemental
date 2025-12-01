import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationProps {
  userEmail: string;
  userName?: string;
  verificationUrl: string;
  expiresInHours?: number;
}

export const EmailVerification = ({
  userEmail,
  userName,
  verificationUrl,
  expiresInHours = 24,
}: EmailVerificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your NeuroElemental account email</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Verify Your Email</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>
              {userName ? `Hi ${userName}` : "Hello"},
            </Text>
            <Text style={paragraph}>
              Thanks for signing up for NeuroElemental! To complete your
              registration and start exploring your energy patterns, please
              verify your email address.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>
              This link will expire in <strong>{expiresInHours} hours</strong>.
              If you didn't create an account with NeuroElemental, you can
              safely ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>Having trouble with the button?</strong> Copy and paste
              this link into your browser:
            </Text>
            <Text style={codeStyle}>{verificationUrl}</Text>

            <Hr style={hr} />

            <Text style={footer}>
              This email was sent to {userEmail}. If you didn't request this,
              please ignore this email.
            </Text>
            <Text style={footer}>
              <Link href="https://neuroelement.al/support" style={link}>
                Contact Support
              </Link>
              {" • "}
              <Link href="https://neuroelement.al/privacy" style={link}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailVerification;

// Styles
const main = {
  backgroundColor: "#0f0f1a",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "40px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0",
  background: "linear-gradient(135deg, #C084FC 0%, #6366F1 50%, #38BDF8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const content = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  padding: "32px",
  backdropFilter: "blur(16px)",
};

const paragraph = {
  color: "#e5e7eb",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#7c3aed",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const hr = {
  borderColor: "rgba(255, 255, 255, 0.1)",
  margin: "24px 0",
};

const footer = {
  color: "#9ca3af",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "12px 0",
  textAlign: "center" as const,
};

const link = {
  color: "#7c3aed",
  textDecoration: "underline",
};

const codeStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "6px",
  color: "#c084fc",
  fontSize: "14px",
  padding: "12px",
  fontFamily: "monospace",
  wordBreak: "break-all" as const,
  marginTop: "8px",
};
