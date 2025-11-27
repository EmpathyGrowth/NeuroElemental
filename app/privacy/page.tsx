import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - NeuroElemental™",
  description:
    "Our privacy policy explains how we collect, use, and protect your personal information.",
};

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">

      <HeroSection
        badge="🔒 Your Privacy Matters"
        title={
          <>
            <span className="text-foreground">Privacy</span>{" "}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Policy
            </span>
          </>
        }
        description="We're committed to protecting your privacy and being transparent about how we handle your data."
      />

      <main>
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 md:p-16 glass-card border-border/50">
              <div className="space-y-8 text-foreground/80 leading-relaxed">
                <div>
                  <p className="text-sm text-muted-foreground mb-6">
                    <strong>Last Updated:</strong> November 20, 2025
                  </p>
                  <p className="text-lg">
                    At NeuroElemental, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    1. Information We Collect
                  </h2>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Information You Provide
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Email Address:</strong> When you voluntarily provide your email to receive results, join our mailing list, or sign up for certification</li>
                    <li><strong>Assessment Responses:</strong> Your answers to the 30-question NeuroElemental assessment</li>
                    <li><strong>Communication Data:</strong> Messages you send us via contact forms or email</li>
                    <li><strong>Payment Information:</strong> When you purchase products (processed securely through our payment processor)</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">
                    Automatically Collected Information
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Device & Browser Information:</strong> Browser type, operating system, device type</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clicks, and navigation paths</li>
                    <li><strong>Local Storage:</strong> Assessment progress saved in your browser's local storage</li>
                    <li><strong>Cookies:</strong> We use essential cookies for functionality and analytics (see Cookie Policy)</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    2. How We Use Your Information
                  </h2>
                  <p className="mb-3">We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Calculate and deliver your NeuroElemental assessment results</li>
                    <li>Send you your results PDF and follow-up email courses (if you opt in)</li>
                    <li>Process payments and deliver purchased products/services</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Send important updates about our services (with your consent)</li>
                    <li>Improve our website, assessment, and user experience</li>
                    <li>Analyze aggregated, de-identified data to improve the framework</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    3. How We Share Your Information
                  </h2>
                  <p className="mb-3 font-semibold text-foreground">
                    We never sell your personal data. Period.
                  </p>
                  <p className="mb-3">We may share your information only in these limited circumstances:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service Providers:</strong> Trusted third parties who help us operate our website (email service, payment processing, analytics). These providers are contractually obligated to keep your data secure.</li>
                    <li><strong>Legal Requirements:</strong> If required by law or to protect our rights, safety, or property</li>
                    <li><strong>With Your Consent:</strong> In any other situation, only with your explicit permission</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    4. Data Security
                  </h2>
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Secure, encrypted databases</li>
                    <li>Regular security audits</li>
                    <li>Access controls and authentication</li>
                  </ul>
                  <p className="mt-4">
                    However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    5. Your Rights and Choices
                  </h2>
                  <p className="mb-3">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                    <li><strong>Correction:</strong> Ask us to correct inaccurate or incomplete information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
                    <li><strong>Object:</strong> Object to processing of your data for certain purposes</li>
                    <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time (link in every email)</li>
                    <li><strong>Portability:</strong> Request your data in a portable format</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, email us at{" "}
                    <a href="mailto:privacy@neuroelemental.com" className="text-primary hover:underline">
                      privacy@neuroelemental.com
                    </a>
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    6. Data Retention
                  </h2>
                  <p>
                    We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Assessment data stored locally in your browser is retained until you clear your browser data.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    7. Children's Privacy
                  </h2>
                  <p>
                    Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    8. International Data Transfers
                  </h2>
                  <p>
                    Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    9. Third-Party Links
                  </h2>
                  <p>
                    Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    10. Cookie Policy
                  </h2>
                  <p className="mb-3">We use the following types of cookies:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for the website to function (cannot be disabled)</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (Google Analytics)</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  </ul>
                  <p className="mt-4">
                    You can control cookies through your browser settings. Disabling certain cookies may limit functionality.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    11. California Privacy Rights (CCPA)
                  </h2>
                  <p>
                    If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-3">
                    <li>Right to know what personal information is collected</li>
                    <li>Right to know if personal information is sold or disclosed</li>
                    <li>Right to opt-out of the sale of personal information (we don't sell data)</li>
                    <li>Right to deletion</li>
                    <li>Right to non-discrimination for exercising your rights</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    12. European Privacy Rights (GDPR)
                  </h2>
                  <p>
                    If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including those listed in Section 5 above. Our lawful basis for processing your data is typically your consent or our legitimate interests in providing and improving our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    13. Changes to This Policy
                  </h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    14. Contact Us
                  </h2>
                  <p className="mb-3">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-accent/10 p-6 rounded-lg border border-border/30">
                    <p className="font-semibold text-foreground">Email:</p>
                    <a href="mailto:privacy@neuroelemental.com" className="text-primary hover:underline text-lg">
                      privacy@neuroelemental.com
                    </a>
                    <p className="font-semibold text-foreground mt-4">General Inquiries:</p>
                    <a href="mailto:hello@neuroelemental.com" className="text-primary hover:underline">
                      hello@neuroelemental.com
                    </a>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                  <p className="text-foreground font-medium">
                    <strong>Our Commitment:</strong> We believe in radical transparency. This policy is written in plain language because we want you to actually understand how we handle your data. If anything is unclear, please ask.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
