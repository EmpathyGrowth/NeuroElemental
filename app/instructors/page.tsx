import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroSection } from '@/components/landing/hero-section';
import { Footer } from '@/components/footer';
import {
  MapPin,
  Globe,
  Linkedin,
  Star,
  CheckCircle,
  Award,
  ArrowRight,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find a Certified Instructor | NeuroElemental',
  description: 'Connect with certified NeuroElemental instructors for coaching, workshops, and training.',
};

// Sample instructors - in production, from database
const instructors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'New York, NY',
    specializations: ['ADHD', 'Workplace', 'Leadership'],
    certLevel: 'Master Practitioner',
    bio: 'Specializing in helping neurodivergent professionals thrive in corporate environments.',
    hourlyRate: 150,
    rating: 4.9,
    reviewCount: 47,
    availableForHire: true,
    website: 'https://sarahjohnson.com',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
  },
  {
    id: '2',
    name: 'Michael Chen',
    location: 'San Francisco, CA',
    specializations: ['Relationships', 'Communication', 'Burnout'],
    certLevel: 'Certified Practitioner',
    bio: 'Helping individuals and couples navigate energy dynamics in relationships.',
    hourlyRate: 120,
    rating: 4.8,
    reviewCount: 32,
    availableForHire: true,
    website: 'https://michaelchen.com',
    linkedin: 'https://linkedin.com/in/michaelchen',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    location: 'Austin, TX',
    specializations: ['Parenting', 'Family Dynamics', 'Education'],
    certLevel: 'Certified Practitioner',
    bio: 'Supporting neurodivergent parents and educators in creating energy-conscious environments.',
    hourlyRate: 130,
    rating: 5.0,
    reviewCount: 28,
    availableForHire: true,
    website: null,
    linkedin: 'https://linkedin.com/in/elenarodriguez',
  },
  {
    id: '4',
    name: 'David Thompson',
    location: 'London, UK',
    specializations: ['Workplace', 'Team Dynamics', 'Conflict Resolution'],
    certLevel: 'Master Practitioner',
    bio: 'Working with organizations to build neurodivergent-friendly workplace cultures.',
    hourlyRate: 180,
    rating: 4.9,
    reviewCount: 56,
    availableForHire: true,
    website: 'https://davidthompson.co.uk',
    linkedin: 'https://linkedin.com/in/davidthompson',
  },
];

export default function InstructorsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="🎓 Certified Instructors"
        title={
          <>
            Find Your <span className="gradient-text">Perfect Guide</span>
          </>
        }
        description="Connect with certified NeuroElemental instructors for personalized coaching, workshops, and training"
      >
        <div className="flex flex-wrap justify-center gap-6 text-sm mt-8">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Certified by NeuroElemental</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Experienced practitioners</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Various specializations</span>
          </div>
        </div>
      </HeroSection>

      {/* Instructors Grid */}
      <section className="py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Our Certified Instructors</h2>
            <p className="text-muted-foreground">
              {instructors.length} certified practitioners ready to help you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="glass-card hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {instructor.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <CardTitle className="text-xl mb-1">{instructor.name}</CardTitle>
                          <Badge className="bg-purple-500/10 text-purple-500">
                            <Award className="w-3 h-3 mr-1" />
                            {instructor.certLevel}
                          </Badge>
                        </div>
                        {instructor.availableForHire && (
                          <Badge className="bg-green-500/10 text-green-500">
                            Available
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{instructor.rating}</span>
                        <span>({instructor.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{instructor.bio}</p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{instructor.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {instructor.specializations.map((spec) => (
                      <Badge key={spec} variant="outline">{spec}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">${instructor.hourlyRate}</p>
                      <p className="text-xs text-muted-foreground">per hour</p>
                    </div>
                    <div className="flex gap-2">
                      {instructor.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={instructor.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {instructor.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button size="sm">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Become an Instructor CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="glass-card border-primary/50 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Become a Certified Instructor
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our community of certified practitioners and teach the NeuroElemental framework professionally
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/certification">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#764BA2]">
                  Learn About Certification
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/events/instructor-certification-info-session">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Join Info Session (Free)
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
