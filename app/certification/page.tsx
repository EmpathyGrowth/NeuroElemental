import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instructor Certification - NeuroElemental™ Professional Training',
  description: 'Become a certified NeuroElemental™ practitioner. Join our global community of coaches and therapists using this evidence-based framework in their practice.',
  keywords: ['certification', 'coach training', 'therapist training', 'professional development', 'instructor program'],
};

import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Award,
    CheckCircle,
    Globe,
    GraduationCap,
    Shield,
    Sparkles,
    Target,
    Users,
} from 'lucide-react';
import Link from 'next/link';

export default function CertificationPage() {
  const objectives = [
    {
      icon: Award,
      title: 'Standardize Excellence',
      description: 'Ensure every practitioner delivers the framework with consistency, depth, and unwavering ethics.',
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Join a supportive, interconnected network of professional coaches and therapists.',
    },
    {
      icon: Target,
      title: 'Ethical Scaling',
      description: 'Build a sustainable practice with a transparent monetization pathway.',
    },
    {
      icon: Shield,
      title: 'Brand Integrity',
      description: 'Operate within a defined ethical code that distinguishes us from dogmatic models.',
    },
  ];

  const curriculum = [
    {
      module: '01',
      title: 'Foundations',
      description: 'Master the six Elements, the Energy Scale, and the Four States of Personality.',
    },
    {
      module: '02',
      title: 'Energy Science',
      description: 'Deep dive into Regeneration types, the Window of Tolerance, and energy management.',
    },
    {
      module: '03',
      title: 'Applied Practice',
      description: 'Strategies for relationships, conflict resolution, and building empathy.',
    },
    {
      module: '04',
      title: 'Professional Contexts',
      description: 'Apply the framework to business, leadership, and team dynamics.',
    },
    {
      module: '05',
      title: 'Neurodivergence & Ethics',
      description: 'Sophisticated application for ADHD/Autism and strict ethical boundaries.',
    },
  ];

  const levels = [
    {
      title: 'Certified Practitioner',
      level: 'Level 1',
      icon: CheckCircle,
      description: 'For professionals using the framework with individual clients.',
      features: [
        'Online training modules',
        'Live virtual workshops',
        'Final examination',
        'Official certification',
      ],
    },
    {
      title: 'Certified Instructor',
      level: 'Level 2',
      icon: GraduationCap,
      description: 'For leaders who want to train others and facilitate workshops.',
      features: [
        'Advanced "Train-the-Trainer" module',
        'Co-facilitation supervision',
        'Professional development plan',
        'Community leadership role',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      <HeroSection
        badge="🎓 Professional Development"
        title={
          <>
            <span className="text-foreground">Become a Certified</span>{' '}
            <br className="hidden sm:block" />
            <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              NeuroElemental™ Practitioner
            </span>
          </>
        }
        description="Join the global movement of coaches and therapists using energy-based frameworks to transform lives."
      >
        <div className="flex justify-center gap-4 pt-6">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-[#764BA2] hover:from-[#5568D3] hover:to-[#6A3F92] text-white text-lg px-10 py-7 shadow-xl hover:shadow-2xl transition-all border-0 min-h-[56px]"
            asChild
          >
            <Link href="/waitlist">
              Join Waitlist
            </Link>
          </Button>
        </div>
      </HeroSection>

      <main>
        {/* Objectives Grid */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {objectives.map((obj, index) => {
                const Icon = obj.icon;
                return (
                  <Card
                    key={obj.title}
                    className="p-8 glass-card border-border/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-200/20 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-[#667EEA]" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {obj.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {obj.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="p-10 md:p-16 glass-card border-border/50">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[#764BA2] flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">
                  Who This Is For
                </h2>
              </div>
              <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
                <p>
                  This program is not for casual enthusiasts. We are seeking dedicated
                  professionals who can integrate our framework into an existing practice
                  with responsibility, skill, and ethical awareness.
                </p>
                <ul className="space-y-4 mt-6">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-bold block text-foreground">Professional Background</span>
                      Coaches, licensed therapists, counselors, and HR professionals.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-bold block text-foreground">Ethical Foundation</span>
                      Commitment to client well-being, avoiding diagnoses, and respecting autonomy.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-bold block text-foreground">Growth Mindset</span>
                      Eager to learn modern, neurodivergent-informed systems beyond static labels.
                    </div>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-muted/30 backdrop-blur-sm" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Program <span className="gradient-text">Curriculum</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A comprehensive journey transforming your understanding of personality and energy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {curriculum.map((mod, _index) => (
                <Card
                  key={mod.module}
                  className="p-8 glass-card border-border/50 hover:shadow-lg transition-all relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-[#667EEA]">
                    {mod.module}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">
                    {mod.title}
                  </h3>
                  <p className="text-muted-foreground relative z-10">
                    {mod.description}
                  </p>
                </Card>
              ))}
              <Card className="p-8 bg-gradient-to-br from-primary to-[#764BA2] text-white flex items-center justify-center text-center hover:scale-105 transition-transform cursor-pointer">
                <div>
                  <Sparkles className="w-10 h-10 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">View Full Syllabus</h3>
                  <p className="text-white/80 text-sm">Download the detailed guide</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Certification Levels */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Certification <span className="gradient-text">Levels</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {levels.map((level) => {
                const Icon = level.icon;
                return (
                  <Card
                    key={level.level}
                    className="p-8 md:p-10 glass-card border-border/50 hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-purple-200/20">
                        <Icon className="w-8 h-8 text-[#667EEA]" />
                      </div>
                      <span className="px-4 py-1 rounded-full bg-[#667EEA]/10 text-[#667EEA] font-bold text-sm">
                        {level.level}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {level.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {level.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {level.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-foreground/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#667EEA] mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-white text-[#667EEA] border border-[#667EEA]/20 hover:bg-[#667EEA]/5">
                      Learn More
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#764BA2] to-[#667EEA] animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="glass-card p-12 rounded-3xl shadow-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Ready to elevate your practice?
              </h2>
              <p className="text-xl mb-10 text-white/90 font-light">
                Secure your spot for the next cohort.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#667EEA] hover:bg-gray-50 text-lg px-12 py-7 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold min-h-[56px]"
                asChild
              >
                <Link href="/waitlist">
                  Join Certification Waitlist
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

