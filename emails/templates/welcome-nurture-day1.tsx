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
} from '@react-email/components';
import * as React from 'react';

interface WelcomeNurtureDay1Props {
  userName?: string;
  topElement: string;
  elementEmoji: string;
}

/**
 * Day 1 of post-assessment nurture sequence
 * Educates about their top element
 */
export const WelcomeNurtureDay1 = ({
  userName,
  topElement,
  elementEmoji,
}: WelcomeNurtureDay1Props) => {
  return (
    <Html>
      <Head />
      <Preview>Understanding Your {topElement} Energy Type</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={iconCircle}>
              <span style={emoji}>{elementEmoji}</span>
            </div>
            <Heading style={h1}>
              Understanding Your {topElement} Energy
            </Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>
              {userName ? `Hi ${userName}` : 'Hello'},
            </Text>
            <Text style={paragraph}>
              Yesterday you discovered your Element Mix, and {topElement} came out as your dominant type. That's significant—it means your nervous system operates with a specific pattern that shapes how you experience energy, stress, and recovery.
            </Text>

            <Text style={paragraph}>
              Over the next 7 days, I'm going to help you understand what that means and how to work <em>with</em> your {topElement} nature instead of against it.
            </Text>

            <Hr style={hr} />

            <Heading style={h2}>
              What It Means to Be {topElement}-Dominant
            </Heading>

            {topElement === 'Electric' && (
              <>
                <Text style={paragraph}>
                  Electric types have nervous systems that <strong>crave stimulation and novelty</strong>. Your brain literally needs more input to feel engaged and alive. This isn't a character flaw—it's your neurology.
                </Text>
                <Text style={paragraph}>
                  <strong>The challenge:</strong> Traditional advice tells you to "focus" and "be patient," but your brain doesn't work that way. Forcing yourself into monotony is like asking a fish to live on land.
                </Text>
                <Text style={paragraph}>
                  <strong>The opportunity:</strong> When you honor your need for variety and stimulation, you become incredibly creative, dynamic, and energized. The key is finding <em>sustainable</em> novelty.
                </Text>
              </>
            )}

            {topElement === 'Fiery' && (
              <>
                <Text style={paragraph}>
                  Fiery types have nervous systems that <strong>run on achievement and forward momentum</strong>. You feel energized by progress and depleted by stagnation. This drive is your superpower.
                </Text>
                <Text style={paragraph}>
                  <strong>The challenge:</strong> Society tells you to "slow down" and "rest," but passive rest can feel like torture. You need to redefine what restoration looks like for your energy type.
                </Text>
                <Text style={paragraph}>
                  <strong>The opportunity:</strong> When you channel your intensity wisely and build in strategic rest, you accomplish incredible things without burning out. The key is <em>sustainable intensity</em>.
                </Text>
              </>
            )}

            {topElement === 'Aquatic' && (
              <>
                <Text style={paragraph}>
                  Aquatic types have nervous systems that are <strong>deeply attuned to emotions and connection</strong>. You feel things intensely and need meaningful relationships to thrive. This sensitivity is a gift.
                </Text>
                <Text style={paragraph}>
                  <strong>The challenge:</strong> You absorb others' emotions easily, and emotional disconnection drains you quickly. Setting boundaries feels wrong, but it's essential for your wellbeing.
                </Text>
                <Text style={paragraph}>
                  <strong>The opportunity:</strong> When you protect your emotional energy and connect with the right people, your depth becomes transformative for yourself and others. The key is <em>boundaries without walls</em>.
                </Text>
              </>
            )}

            {topElement === 'Earthly' && (
              <>
                <Text style={paragraph}>
                  Earthly types have nervous systems that <strong>find stability in routine and nurturing</strong>. You restore energy through care, consistency, and groundedness. This is your foundation.
                </Text>
                <Text style={paragraph}>
                  <strong>The challenge:</strong> You give so much to others that you forget to receive. Saying no feels selfish, but chronic self-neglect leads to resentment and burnout.
                </Text>
                <Text style={paragraph}>
                  <strong>The opportunity:</strong> When you balance giving with receiving and honor your need for routine, you create sustainable care for yourself and others. The key is <em>self-care without guilt</em>.
                </Text>
              </>
            )}

            {topElement === 'Airy' && (
              <>
                <Text style={paragraph}>
                  Airy types have nervous systems that <strong>thrive on ideas, learning, and mental freedom</strong>. You need conceptual stimulation and space to think. This intellectual agility is powerful.
                </Text>
                <Text style={paragraph}>
                  <strong>The challenge:</strong> You can get trapped in your head, analyzing everything while losing touch with your body and emotions. Overthinking drains you.
                </Text>
                <Text style={paragraph}>
                  <strong>The opportunity:</strong> When you balance mental activity with embodiment and limit analysis paralysis, your insights become transformative. The key is <em>wisdom without overthinking</em>.
                </Text>
              </>
            )}

            {topElement === 'Metallic' && (
              <>
                <Text style={paragraph}>
                  Metallic types have nervous systems that <strong>seek precision, order, and mastery</strong>. You need clarity, systems, and excellence to feel grounded. This attention to detail is valuable.
                </Text>
                <Text style={paragraph}>
                  <strong>The challenge:</strong> Perfectionism can become a prison. When standards are too high or systems break down, anxiety and shutdown follow.
                </Text>
                <Text style={paragraph}>
                  <strong>The opportunity:</strong> When you balance high standards with self-compassion and build flexible systems, your precision becomes sustainable excellence. The key is <em>structure without rigidity</em>.
                </Text>
              </>
            )}

            <Hr style={hr} />

            <Heading style={h2}>
              Tomorrow: What Drains Your {topElement} Energy
            </Heading>

            <Text style={paragraph}>
              In the next email, we'll explore the specific situations, people, and activities that deplete {topElement} types—and what you can do about them.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href="https://neuroelemental.com/dashboard">
                View My Full Profile
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              You're receiving this because you completed the NeuroElemental Assessment. This is Day 1 of a 7-day series to help you understand and optimize your energy patterns.
            </Text>
            <Text style={footer}>
              <Link href="https://neuroelemental.com/unsubscribe" style={link}>
                Unsubscribe
              </Link>
              {' • '}
              <Link href="https://neuroelemental.com/preferences" style={link}>
                Email Preferences
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeNurtureDay1;

// Styles
const main = {
  backgroundColor: '#0f0f1a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const iconCircle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
};

const emoji = {
  fontSize: '40px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0',
};

const h2 = {
  color: '#e5e7eb',
  fontSize: '22px',
  fontWeight: '600',
  margin: '24px 0 16px',
};

const content = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: '32px',
};

const paragraph = {
  color: '#e5e7eb',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const hr = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: '24px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '12px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#7c3aed',
  textDecoration: 'underline',
};
