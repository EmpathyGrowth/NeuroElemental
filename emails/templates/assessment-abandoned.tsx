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
} from "@react-email/components";

interface AssessmentAbandonedProps {
  userEmail: string;
  progressPercentage: number;
  resumeUrl: string;
  topEmergingElement?: string;
}

export const AssessmentAbandoned = ({
  userEmail: _userEmail,
  progressPercentage,
  resumeUrl,
  topEmergingElement,
}: AssessmentAbandonedProps) => {
  const getSubject = () => {
    if (progressPercentage >= 75) {
      return "You're almost done! Just a few questions left";
    } else if (progressPercentage >= 50) {
      return "Your energy profile is waiting";
    } else {
      return "Come back and finish discovering your element mix";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{getSubject()}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              {progressPercentage >= 75
                ? "You're So Close! 🎯"
                : "Your Profile Awaits ✨"}
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>Hi there,</Text>
            <Text style={paragraph}>
              You started the NeuroElemental Assessment and got{" "}
              <strong>{progressPercentage}% of the way through</strong>—that's
              awesome! But you didn't quite finish.
            </Text>

            {topEmergingElement && (
              <Section style={highlightBox}>
                <Text style={highlightText}>
                  💡 <strong>Early insight:</strong> Based on your answers so
                  far, you're showing strong{" "}
                  <span style={{ color: "#A78BFA" }}>{topEmergingElement}</span>{" "}
                  energy patterns. Curious to see your complete mix?
                </Text>
              </Section>
            )}

            <Text style={paragraph}>
              It only takes{" "}
              <strong>
                about {Math.ceil(((100 - progressPercentage) / 100) * 7)} more
                minutes
              </strong>{" "}
              to complete, and you'll get:
            </Text>

            <ul style={list}>
              <li style={listItem}>✅ Your complete Element Mix breakdown</li>
              <li style={listItem}>✅ Personalized regeneration strategies</li>
              <li style={listItem}>✅ Shadow patterns and growth edges</li>
              <li style={listItem}>✅ Burnout risk assessment</li>
              <li style={listItem}>✅ Work & relationship insights</li>
            </ul>

            <Section style={buttonContainer}>
              <Button style={button} href={resumeUrl}>
                Continue Where I Left Off
              </Button>
            </Section>

            <Text style={paragraph}>
              Your progress is saved, so you'll pick up right where you stopped.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This assessment is 100% free, takes 5-7 minutes total, and helps
              thousands of neurodivergent people understand their energy
              patterns.
            </Text>

            <Text style={footer}>
              Questions? Reply to this email—we're here to help.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AssessmentAbandoned;

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
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0",
};

const content = {
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  padding: "32px",
};

const paragraph = {
  color: "#e5e7eb",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "16px 0",
};

const highlightBox = {
  backgroundColor: "rgba(167, 139, 250, 0.1)",
  border: "1px solid rgba(167, 139, 250, 0.3)",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const highlightText = {
  color: "#e5e7eb",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0",
};

const list = {
  color: "#e5e7eb",
  fontSize: "15px",
  lineHeight: "1.8",
  margin: "16px 0",
  paddingLeft: "20px",
};

const listItem = {
  marginBottom: "8px",
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
};
