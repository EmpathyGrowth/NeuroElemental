import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ethics Statement - NeuroElemental™ Commitments & Standards',
  description: 'Our public ethics statement: transparency, no high-pressure tactics, respect for autonomy, and clear boundaries. Learn about our commitment to psychological safety.',
  keywords: ['ethics', 'transparency', 'psychological safety', 'no guru dynamics', 'ethical framework'],
};

import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
} from 'lucide-react';

export default function EthicsPage() {
  const principles = [
    {
      number: '01',
      title: 'No High-Pressure Tactics',
      description:
        'We offer clear refund policies, transparent pricing, and no artificial urgency. You should never feel pressured to buy anything. If a sale creates anxiety rather than excitement, that is a red flag - and we will not do that to you.',
    },
    {
      number: '02',
      title: 'Encouragement of Critical Thinking',
      description:
        'Any tool that creates fear of questioning it, or dependency on it, should be questioned - including ours. We want you to think critically about this framework, test it against your lived experience, and use what serves you.',
    },
    {
      number: '03',
      title: 'Respect for External Relationships',
      description:
        'We will never suggest you cut off relationships with people who don\'t "get" the system. We will never create us-vs-them dynamics or position this framework as the only path to self-understanding. Your relationships matter more than our framework.',
    },
    {
      number: '04',
      title: 'Clear Boundaries and Limitations',
      description:
        'This is not a diagnosis. This is not therapy. This is not a spiritual doctrine. This is a lens for understanding energy patterns - nothing more, nothing less. We will always be clear about what this system can and cannot do.',
    },
    {
      number: '05',
      title: 'Neurodiversity Commitment',
      description:
        'Neurodivergence doesn\'t change WHO you are, it changes HOW your energy is used. We approach neurodivergence as a difference, not a deficit. We will never suggest you need to be "fixed" or that this system can "cure" anything.',
    },
  ];

  const neverDo = [
    'Make diagnostic claims about mental health conditions',
    'Suggest we can cure ADHD, Autism, or any medical condition',
    'Use love-bombing, manipulation, or cult-like tactics',
    'Create dependency on the system or founder',
    'Make medical recommendations or replace professional care',
    'Position ourselves as the only valid framework',
  ];

  const alwaysDo = [
    'Frame the system as "a map, not the territory"',
    'Acknowledge the limitations of any personality framework',
    'Refer to licensed professionals when appropriate',
    'Be transparent about pricing, policies, and business practices',
    'Build empathy and understanding, not judgment',
    'Welcome feedback and criticism',
  ];

  return (
    <div className="min-h-screen bg-background">

      <main>
        <HeroSection
          badge="🛡️ Integrity First"
          title={
            <>
              <span className="text-foreground">Our Public</span>{' '}
              <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Ethics Statement
              </span>
            </>
          }
          description="Transparency, honesty, and respect for autonomy guide everything we do."
        />

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 md:p-16 glass-card border-border/50">
              <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                <p className="text-xl font-semibold text-foreground">
                  Why This Page Exists
                </p>
                <p>
                  In an industry full of manipulation, guru dynamics, and
                  psychological exploitation, we believe radical transparency is
                  the only ethical path forward. This page exists because we
                  believe you deserve to know exactly what we stand for - and what
                  we refuse to do.
                </p>
                <p>
                  Most personality systems and personal development frameworks
                  don&apos;t have ethics statements. That should concern you. We&apos;re
                  making ours public because your psychological safety matters more
                  than our sales.
                </p>
                <p className="text-xl font-semibold text-[#667EEA]">
                  Our Commitment to Psychological Safety
                </p>
                <p>
                  The NeuroElemental System is a tool for self-understanding, not
                  a replacement for professional mental health care. We are
                  committed to operating with integrity, transparency, and deep
                  respect for your autonomy.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Core <span className="gradient-text">Principles</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These are the non-negotiable standards we hold ourselves to.
              </p>
            </div>

            <div className="space-y-8">
              {principles.map((principle) => (
                <Card
                  key={principle.number}
                  className="p-8 glass-card border-border/50 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-[#764BA2] text-white text-2xl font-bold flex items-center justify-center">
                      {principle.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {principle.title}
                      </h3>
                      <p className="text-lg text-foreground/80 leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 glass-card border-border/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    What We Will Never Do
                  </h3>
                </div>
                <ul className="space-y-4">
                  {neverDo.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-8 glass-card border-border/50">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    What We Will Always Do
                  </h3>
                </div>
                <ul className="space-y-4">
                  {alwaysDo.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 glass-card border-border/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-[#764BA2] flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Instructor Code of Conduct
                </h2>
              </div>
              <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
                <p>
                  Any certified NeuroElemental instructors or coaches are held to
                  the same ethical standards outlined on this page. They are
                  required to:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start space-x-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary to-[#764BA2] mt-2 flex-shrink-0" />
                    <span>
                      Maintain clear professional boundaries
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary to-[#764BA2] mt-2 flex-shrink-0" />
                    <span>
                      Never make diagnostic or medical claims
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary to-[#764BA2] mt-2 flex-shrink-0" />
                    <span>
                      Refer clients to appropriate professionals when needed
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-primary to-[#764BA2] mt-2 flex-shrink-0" />
                    <span>
                      Operate with transparency and respect
                    </span>
                  </li>
                </ul>
                <p className="mt-6">
                  <a
                    href="/instructor-code.pdf"
                    className="inline-flex items-center text-[#667EEA] hover:text-[#5568D3] font-semibold"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Download Full Instructor Code of Conduct
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 glass-card border-border/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Reporting Concerns
                </h2>
              </div>
              <div className="space-y-4 text-lg text-foreground/80 leading-relaxed">
                <p>
                  If you experience or witness behavior from an instructor,
                  certified coach, or any content associated with NeuroElemental
                  that violates these ethical standards, please report it to us.
                </p>
                <p className="font-semibold text-foreground">
                  We take these concerns seriously and commit to:
                </p>
                <ul className="space-y-3 ml-6">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Reviewing every report thoroughly</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Responding within 5 business days</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Taking appropriate action to address violations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Maintaining confidentiality while investigating
                    </span>
                  </li>
                </ul>
                <div className="mt-8 p-6 bg-[#667EEA]/10 rounded-xl border border-[#667EEA]/20">
                  <p className="font-semibold text-foreground mb-2">
                    Report Ethics Concerns:
                  </p>
                  <a
                    href="mailto:ethics@neuroelemental.com"
                    className="inline-flex items-center text-[#667EEA] hover:text-[#5568D3] font-semibold text-lg"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    ethics@neuroelemental.com
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="glass-card p-12 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Have questions about our approach?
              </h2>
              <p className="text-xl mb-10 text-white/90 font-light">
                We&apos;re here to address any concerns or questions you have about
                our ethical commitments.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#667EEA] hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold"
                asChild
              >
                <a href="mailto:hello@neuroelemental.com">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
