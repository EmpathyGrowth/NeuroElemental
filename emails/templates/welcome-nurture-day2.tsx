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

interface WelcomeNurtureDay2Props {
  userName?: string;
  topElement: string;
  elementEmoji: string;
}

/**
 * Day 2 of post-assessment nurture sequence
 * Covers energy drains specific to their element
 */
export const WelcomeNurtureDay2 = ({
  userName,
  topElement,
  elementEmoji,
}: WelcomeNurtureDay2Props) => {
  return (
    <Html>
      <Head />
      <Preview>
        What Drains Your {topElement} Energy (And How to Protect It)
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <div style={iconCircle}>
              <span style={emoji}>{elementEmoji}</span>
            </div>
            <Heading style={h1}>What Drains Your {topElement} Energy</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              {userName ? `Hi ${userName}` : "Hello"},
            </Text>
            <Text style={paragraph}>
              Yesterday we explored what it means to be {topElement}-dominant.
              Today, let's talk about what specifically depletes your energy—and
              what you can do about it.
            </Text>

            <Hr style={hr} />

            <Heading style={h2}>Your Top Energy Drains</Heading>

            {topElement === "Electric" && (
              <>
                <div style={drainBox}>
                  <Text style={drainTitle}>❌ Repetitive Tasks & Monotony</Text>
                  <Text style={drainText}>
                    Your brain literally needs novelty to produce dopamine.
                    Doing the same thing repeatedly is neurologically exhausting
                    for you—not a moral failing.
                  </Text>
                </div>
                <div style={drainBox}>
                  <Text style={drainTitle}>❌ Slow-Moving Meetings</Text>
                  <Text style={drainText}>
                    When conversation moves slower than your thoughts, you're
                    burning energy trying to match the pace instead of flowing
                    naturally.
                  </Text>
                </div>
                <div style={drainBox}>
                  <Text style={drainTitle}>❌ Being Told to "Slow Down"</Text>
                  <Text style={drainText}>
                    This invalidates your natural pace and forces you to
                    suppress your energy—which paradoxically makes you MORE
                    restless.
                  </Text>
                </div>
              </>
            )}

            {topElement === "Fiery" && (
              <>
                <div style={drainBox}>
                  <Text style={drainTitle}>❌ Lack of Progress</Text>
                  <Text style={drainText}>
                    Your nervous system runs on forward momentum. Spinning your
                    wheels without visible progress is one of the fastest ways
                    to deplete you.
                  </Text>
                </div>
                <div style={drainBox}>
                  <Text style={drainTitle}>❌ Indecisive People</Text>
                  <Text style={drainText}>
                    You make decisions quickly and commit fully. Working with
                    people who waffle or avoid decisions forces you to hold back
                    your natural drive.
                  </Text>
                </div>
                <div style={drainBox}>
                  <Text style={drainTitle}>❌ Being Told to "Calm Down"</Text>
                  <Text style={drainText}>
                    Your intensity is your fuel. Being asked to dial it back
                    means suppressing your core energy source.
                  </Text>
                </div>
              </>
            )}

            <Hr style={hr} />

            <Heading style={h2}>Protection Strategies</Heading>

            <Text style={paragraph}>
              Knowing what drains you is only half the battle. Here's how to
              protect your energy:
            </Text>

            <div style={strategyBox}>
              <Text style={strategyTitle}>1. Budget for It</Text>
              <Text style={strategyText}>
                If you can't avoid a draining activity, plan recovery time
                immediately after. Don't schedule back-to-back depleting tasks.
              </Text>
            </div>

            <div style={strategyBox}>
              <Text style={strategyTitle}>2. Communicate Your Needs</Text>
              <Text style={strategyText}>
                "I work best when..." statements help others understand your
                energy patterns without requiring them to change who they are.
              </Text>
            </div>

            <div style={strategyBox}>
              <Text style={strategyTitle}>3. Find Alternatives</Text>
              <Text style={strategyText}>
                Can you accomplish the same goal in a way that aligns with your
                element? Often yes—but you have to give yourself permission to
                do it differently.
              </Text>
            </div>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href="https://neuroelemental.com/tools/energy-budget"
              >
                Try the Energy Budget Calculator
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>Tomorrow:</strong> We'll explore your element-specific
              regeneration strategies—what actually restores your energy (it's
              not what you think).
            </Text>

            <Text style={footer}>
              Day 2 of 7 • NeuroElemental Energy Series
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeNurtureDay2;

// Styles (reusing from Day 1)
const main = {
  backgroundColor: "#0f0f1a",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "40px",
};

const iconCircle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
};

const emoji = {
  fontSize: "40px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0",
};

const h2 = {
  color: "#e5e7eb",
  fontSize: "22px",
  fontWeight: "600",
  margin: "24px 0 16px",
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

const drainBox = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "8px",
  padding: "16px",
  margin: "12px 0",
};

const drainTitle = {
  color: "#fca5a5",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const drainText = {
  color: "#e5e7eb",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
};

const strategyBox = {
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  border: "1px solid rgba(34, 197, 94, 0.3)",
  borderRadius: "8px",
  padding: "16px",
  margin: "12px 0",
};

const strategyTitle = {
  color: "#86efac",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const strategyText = {
  color: "#e5e7eb",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
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
