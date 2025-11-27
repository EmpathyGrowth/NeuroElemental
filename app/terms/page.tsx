import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - NeuroElemental™",
  description:
    "Terms and conditions for using NeuroElemental services.",
};

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">

      <HeroSection
        badge="📜 Clear & Fair"
        title={
          <>
            <span className="text-foreground">Terms of</span>{" "}
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Service
            </span>
          </>
        }
        description="Plain-language terms for using NeuroElemental services."
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
                    Welcome to NeuroElemental. By using our website, assessment, and services, you agree to these Terms of Service. Please read them carefully.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    By accessing or using NeuroElemental™ (the "Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our Service.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    2. Description of Service
                  </h2>
                  <p className="mb-3">
                    NeuroElemental provides an energy-based personality framework assessment and related educational resources. Our services include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Free online assessment (30 questions)</li>
                    <li>Personalized Element Mix results</li>
                    <li>Educational content about the framework</li>
                    <li>Optional paid products (workbooks, courses, coaching)</li>
                    <li>Instructor certification programs</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    3. Important Disclaimers
                  </h2>
                  <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-lg mb-4">
                    <p className="font-semibold text-foreground mb-3">
                      Please Read Carefully:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>NOT Medical or Mental Health Advice:</strong> NeuroElemental is an educational tool for self-discovery and energy management. It is NOT a diagnostic tool, medical device, or substitute for professional medical or mental health care.</li>
                      <li><strong>NOT a Cure or Treatment:</strong> This framework does not diagnose, treat, cure, or prevent any medical or mental health condition, including but not limited to ADHD, Autism, anxiety, or depression.</li>
                      <li><strong>Consult Professionals:</strong> Always consult licensed healthcare professionals for medical, psychological, or psychiatric concerns.</li>
                      <li><strong>Self-Report Tool:</strong> Results are based on your self-reported responses and should be used as a starting point for self-reflection, not as absolute truth.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    4. User Responsibilities
                  </h2>
                  <p className="mb-3">When using our Service, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate information when taking the assessment</li>
                    <li>Use the Service for lawful purposes only</li>
                    <li>Not attempt to hack, reverse-engineer, or compromise our systems</li>
                    <li>Not misrepresent yourself as a certified instructor if you are not</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not use results to diagnose or treat others</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    5. Intellectual Property
                  </h2>
                  <p className="mb-3">
                    The NeuroElemental™ framework, assessment, name, logo, content, and materials are protected by copyright, trademark, and other intellectual property laws. You may:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Use the free assessment for personal, non-commercial purposes</li>
                    <li>Share your own results with others</li>
                    <li>Reference the framework with proper attribution</li>
                  </ul>
                  <p className="mb-3">You may NOT:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Copy, reproduce, or distribute our assessment questions without permission</li>
                    <li>Create derivative frameworks or "competing" systems based on our content</li>
                    <li>Use our trademarks without authorization</li>
                    <li>Teach or certify others in the framework without official certification</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    6. Paid Products and Services
                  </h2>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Purchases
                  </h3>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>All prices are in USD unless otherwise stated</li>
                    <li>Payment is processed securely through our payment processor</li>
                    <li>You are responsible for all applicable taxes</li>
                    <li>Digital products are delivered electronically</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Refund Policy
                  </h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>60-Day Money-Back Guarantee:</strong> All digital products (workbooks, courses) come with a full refund if requested within 60 days of purchase</li>
                    <li><strong>Coaching Services:</strong> First session is risk-free. Refunds for session packages are prorated based on sessions used</li>
                    <li><strong>Certification Programs:</strong> Refund policy outlined in program agreement</li>
                    <li><strong>How to Request:</strong> Email refund@neuroelemental.com with your order number</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    7. Certification Program Terms
                  </h2>
                  <p className="mb-3">
                    If you enroll in our instructor certification program:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must adhere to our <a href="/ethics" className="text-primary hover:underline">Code of Ethics</a></li>
                    <li>Certification can be revoked for ethical violations</li>
                    <li>You receive a license to teach the framework, not ownership of it</li>
                    <li>Specific terms are outlined in the certification agreement</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    8. User-Generated Content
                  </h2>
                  <p className="mb-3">
                    If you submit testimonials, reviews, or other content to us:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You grant us a license to use, display, and promote your content</li>
                    <li>We may edit for length, clarity, or appropriateness</li>
                    <li>We will seek permission before using identifiable information</li>
                    <li>You confirm that your content is truthful and does not violate others' rights</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    9. Limitation of Liability
                  </h2>
                  <div className="bg-red-500/10 border-l-4 border-red-500 p-6 rounded-r-lg">
                    <p className="font-semibold text-foreground mb-3">
                      IMPORTANT LEGAL NOTICE:
                    </p>
                    <p className="mb-3">
                      TO THE FULLEST EXTENT PERMITTED BY LAW, NEUROELEMENTAL AND ITS CREATORS, EMPLOYEES, AND AFFILIATES WILL NOT BE LIABLE FOR:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Indirect, incidental, special, or consequential damages</li>
                      <li>Loss of profits, data, or opportunities</li>
                      <li>Damages arising from your use or inability to use the Service</li>
                      <li>Actions taken based on assessment results</li>
                      <li>Decisions made in reliance on framework content</li>
                    </ul>
                    <p className="mt-4">
                      Our maximum liability to you is limited to the amount you paid for the specific product or service in question, or $100 USD, whichever is less.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    10. Indemnification
                  </h2>
                  <p>
                    You agree to indemnify and hold harmless NeuroElemental from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of any rights of others.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    11. Termination
                  </h2>
                  <p>
                    We reserve the right to suspend or terminate your access to the Service at any time for violation of these Terms, without notice. You may stop using the Service at any time.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    12. Changes to Terms
                  </h2>
                  <p>
                    We may update these Terms from time to time. Material changes will be communicated via email (if you've subscribed) or a notice on our website. Your continued use after changes constitutes acceptance.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    13. Governing Law and Disputes
                  </h2>
                  <p className="mb-3">
                    These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
                  </p>
                  <p className="mb-3">
                    <strong>Dispute Resolution:</strong> We encourage you to contact us first to resolve any disputes informally. If that doesn't work:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Both parties agree to attempt mediation before litigation</li>
                    <li>Any legal action must be brought in [Your Jurisdiction]</li>
                    <li>You waive the right to participate in class actions</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    14. Severability
                  </h2>
                  <p>
                    If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    15. Entire Agreement
                  </h2>
                  <p>
                    These Terms, together with our Privacy Policy and any additional agreements you enter into with us, constitute the entire agreement between you and NeuroElemental.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    16. Contact
                  </h2>
                  <p className="mb-3">
                    Questions about these Terms? Contact us:
                  </p>
                  <div className="bg-accent/10 p-6 rounded-lg border border-border/30">
                    <p className="font-semibold text-foreground">Email:</p>
                    <a href="mailto:legal@neuroelemental.com" className="text-primary hover:underline text-lg">
                      legal@neuroelemental.com
                    </a>
                    <p className="font-semibold text-foreground mt-4">General Inquiries:</p>
                    <a href="mailto:hello@neuroelemental.com" className="text-primary hover:underline">
                      hello@neuroelemental.com
                    </a>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                  <p className="text-foreground font-medium">
                    <strong>Our Philosophy:</strong> These terms are designed to be fair and protect both parties. If anything seems unreasonable or confusing, please reach out. We're committed to transparency and treating you with respect.
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
