import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { eventRepository } from '@/lib/db';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  PlayCircle,
  Star,
  Users,
  Video
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds

/**
 * Sample event data - in production, this would come from Supabase.
 * Using Record<string, FallbackEventData> for fallback data that merges with database types.
 * The merged fullEvent uses type assertion because:
 * 1. Database types and fallback types have different shapes (snake_case vs camelCase)
 * 2. The merge operation combines fields from both sources dynamically
 * 3. TypeScript cannot statically verify the merged object structure
 */
interface FallbackEventData {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  eventType: 'online_workshop' | 'in_person_workshop' | 'webinar' | 'conference';
  startDate: Date;
  endDate: Date;
  timezone: string;
  location?: {
    name: string;
    address?: string;
  };
  instructor: string;
  instructorBio: string;
  price: number;
  capacity: number;
  spotsRemaining: number;
  attendees: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  isPublished: boolean;
  tags: string[];
  whatYouWillGet: string[];
  agenda: Array<{ time: string; title: string; description: string }>;
  requirements: string[];
}

// Sample event data - in production, this would come from Supabase
const eventsData: Record<string, FallbackEventData> = {
  'energy-reset-workshop': {
    id: '1',
    slug: 'energy-reset-workshop',
    title: 'Energy Reset Workshop',
    description: 'A half-day intensive for anyone experiencing burnout or persistent exhaustion. Learn immediate strategies to begin rebuilding your energy reserves.',
    longDescription: 'This transformative half-day workshop is designed for anyone feeling depleted, burned out, or stuck in patterns of exhaustion. You\'ll learn to identify your unique depletion triggers, understand your Element Mix\'s specific energy patterns, and create a personalized regeneration plan that actually works for your nervous system.',
    eventType: 'online_workshop',
    startDate: new Date('2025-12-15T10:00:00'),
    endDate: new Date('2025-12-15T13:00:00'),
    timezone: 'PST',
    instructor: 'Jannik Laursen',
    instructorBio: 'Creator of the NeuroElemental framework and specialist in neurodivergent burnout recovery.',
    price: 47,
    capacity: 50,
    spotsRemaining: 23,
    attendees: 27,
    rating: 4.9,
    reviewCount: 18,
    thumbnail: '/events/energy-reset.jpg',
    isPublished: true,
    tags: ['Burnout', 'Workshop', 'Beginner'],
    whatYouWillGet: [
      'Personalized energy assessment',
      'Immediate regeneration strategies',
      'Custom recovery roadmap',
      'Live Q&A with Jannik',
      'Workbook and resources',
      'Recording access (30 days)',
    ],
    agenda: [
      { time: '10:00 AM - 10:30 AM', title: 'Welcome & Energy Assessment', description: 'Get oriented and complete your current energy state assessment' },
      { time: '10:30 AM - 11:15 AM', title: 'Understanding Your Depletion Patterns', description: 'Learn to recognize the early warning signs specific to your Element Mix' },
      { time: '11:15 AM - 11:30 AM', title: 'Break', description: 'Gentle movement and hydration' },
      { time: '11:30 AM - 12:30 PM', title: 'Regeneration Strategies Workshop', description: 'Hands-on practice with Element-specific recovery techniques' },
      { time: '12:30 PM - 1:00 PM', title: 'Q&A and Next Steps', description: 'Get your questions answered and create your action plan' },
    ],
    requirements: [
      'Stable internet connection',
      'Quiet space where you won\'t be interrupted',
      'Notebook or digital device for notes',
      'Water and any comfort items',
      'No prior NeuroElemental experience needed',
    ],
  },
  'elemental-communication-masterclass': {
    id: '2',
    slug: 'elemental-communication-masterclass',
    title: 'Elemental Communication Masterclass',
    description: 'Master the art of communicating across different Element types. Perfect for managers, therapists, coaches, and anyone who works with people.',
    longDescription: 'Communication breakdowns often happen not because of bad intentions, but because different Element Mixes have fundamentally different communication styles and needs. This masterclass teaches you to recognize, adapt to, and bridge these differences for more effective relationships and collaboration.',
    eventType: 'online_workshop',
    startDate: new Date('2025-12-20T14:00:00'),
    endDate: new Date('2025-12-20T17:00:00'),
    timezone: 'EST',
    instructor: 'Jannik Laursen',
    instructorBio: 'Creator of the NeuroElemental framework and communication specialist.',
    price: 67,
    capacity: 100,
    spotsRemaining: 67,
    attendees: 33,
    rating: 4.8,
    reviewCount: 12,
    thumbnail: '/events/communication.jpg',
    isPublished: true,
    tags: ['Communication', 'Professional', 'Intermediate'],
    whatYouWillGet: [
      'Communication style breakdowns by Element',
      'Practical conversation frameworks',
      'Real-world practice scenarios',
      'Printable reference guides',
      'Certificate of completion',
      'Lifetime recording access',
    ],
    agenda: [
      { time: '2:00 PM - 2:30 PM', title: 'Introduction to Elemental Communication', description: 'Overview of how different Elements communicate and common pitfalls' },
      { time: '2:30 PM - 3:15 PM', title: 'Element-by-Element Breakdown', description: 'Deep dive into each Element\'s communication preferences and triggers' },
      { time: '3:15 PM - 3:30 PM', title: 'Break', description: 'Stretch and refresh' },
      { time: '3:30 PM - 4:30 PM', title: 'Practice Scenarios', description: 'Apply the frameworks to real-world situations with guided practice' },
      { time: '4:30 PM - 5:00 PM', title: 'Q&A and Implementation Planning', description: 'Get your questions answered and plan your next steps' },
    ],
    requirements: [
      'Have taken the NeuroElemental assessment',
      'Stable internet connection',
      'Notebook for exercises',
      'Optional: Bring a communication challenge to work through',
    ],
  },
  'neuroelemental-intensive-nyc': {
    id: '3',
    slug: 'neuroelemental-intensive-nyc',
    title: 'NeuroElemental Intensive - New York',
    description: 'Two-day in-person immersive experience diving deep into the framework with hands-on practice, community connection, and personalized guidance.',
    longDescription: 'This exclusive in-person intensive is a deep dive into the NeuroElemental framework with Jannik Laursen and certified instructors. Limited to 30 participants for maximum personalization and community connection. Includes small group coaching, networking opportunities, and all materials.',
    eventType: 'in_person_workshop',
    startDate: new Date('2026-02-14T09:00:00'),
    endDate: new Date('2026-02-15T17:00:00'),
    timezone: 'EST',
    location: {
      name: 'Manhattan Conference Center',
      address: '123 Broadway, New York, NY 10012',
    },
    instructor: 'Jannik Laursen + Team',
    instructorBio: 'Join Jannik and a team of certified instructors for an unforgettable learning experience.',
    price: 497,
    capacity: 30,
    spotsRemaining: 12,
    attendees: 18,
    rating: 5.0,
    reviewCount: 6,
    thumbnail: '/events/intensive-nyc.jpg',
    isPublished: true,
    tags: ['Intensive', 'In-Person', 'Advanced'],
    whatYouWillGet: [
      '2 full days of immersive training',
      'Small group coaching sessions',
      'Networking with community',
      'All meals and materials included',
      'Certificate of participation',
      'Ongoing alumni support',
    ],
    agenda: [
      { time: 'Day 1: 9:00 AM - 5:00 PM', title: 'Foundation & Deep Dive', description: 'Comprehensive exploration of all 6 Elements with interactive exercises' },
      { time: 'Day 2: 9:00 AM - 5:00 PM', title: 'Application & Integration', description: 'Practical application workshops and personalized coaching' },
    ],
    requirements: [
      'Have completed at least one NeuroElemental course or be familiar with the framework',
      'Able to attend both full days in person',
      'Commitment to active participation',
      'Open to group sharing and vulnerability',
    ],
  },
  'free-monthly-qa': {
    id: '4',
    slug: 'free-monthly-qa',
    title: 'Free Monthly Community Q&A',
    description: 'Open Q&A session for the NeuroElemental community. Bring your questions about energy management, Element Mixes, and practical applications.',
    longDescription: 'Join Jannik Laursen and the NeuroElemental community for an open, judgment-free Q&A session. This is your chance to get clarity on the framework, share your experiences, connect with others on the same journey, and get personalized guidance. All are welcome, whether you\'re brand new to the framework or a seasoned practitioner.',
    eventType: 'webinar',
    startDate: new Date('2025-12-05T12:00:00'),
    endDate: new Date('2025-12-05T13:00:00'),
    timezone: 'PST',
    instructor: 'Jannik Laursen',
    instructorBio: 'Creator of NeuroElemental and guide for neurodivergent energy management.',
    price: 0,
    capacity: 500,
    spotsRemaining: 342,
    attendees: 158,
    rating: 4.9,
    reviewCount: 89,
    thumbnail: '/events/community-qa.jpg',
    isPublished: true,
    tags: ['Community', 'Free', 'Q&A'],
    whatYouWillGet: [
      'Live Q&A with Jannik',
      'Community connection',
      'Framework updates',
      'Resource recommendations',
      'Recording access',
    ],
    agenda: [
      { time: '12:00 PM - 12:10 PM', title: 'Welcome & Community Updates', description: 'Latest framework developments and resources' },
      { time: '12:10 PM - 12:55 PM', title: 'Open Q&A', description: 'Your questions answered live' },
      { time: '12:55 PM - 1:00 PM', title: 'Closing & Next Session', description: 'Wrap up and upcoming events' },
    ],
    requirements: [
      'Stable internet connection',
      'No prior experience needed',
      'Come with questions!',
    ],
  },
  'workplace-energy-optimization': {
    id: '5',
    slug: 'workplace-energy-optimization',
    title: 'Workplace Energy Optimization',
    description: 'For teams and organizations: learn to apply NeuroElemental principles to improve productivity, reduce burnout, and enhance collaboration.',
    longDescription: 'This workshop is designed for HR professionals, managers, and organizational leaders who want to create more energy-conscious workplaces. Learn to identify team energy patterns, optimize meeting structures, design regenerative work environments, and build cultures that honor neurodivergent needs.',
    eventType: 'online_workshop',
    startDate: new Date('2026-01-10T10:00:00'),
    endDate: new Date('2026-01-10T15:00:00'),
    timezone: 'GMT',
    instructor: 'Jannik Laursen',
    instructorBio: 'Workplace energy consultant and NeuroElemental framework creator.',
    price: 197,
    capacity: 50,
    spotsRemaining: 38,
    attendees: 12,
    rating: 4.7,
    reviewCount: 5,
    thumbnail: '/events/workplace.jpg',
    isPublished: true,
    tags: ['Workplace', 'Teams', 'Professional'],
    whatYouWillGet: [
      'Team energy mapping workshop',
      'Collaboration strategies by Element',
      'Meeting optimization framework',
      'Leadership communication guide',
      'Implementation roadmap',
      'Lifetime recording access',
    ],
    agenda: [
      { time: '10:00 AM - 11:00 AM', title: 'Team Energy Mapping', description: 'Identify the Element Mix of your team and understand dynamics' },
      { time: '11:00 AM - 11:15 AM', title: 'Break', description: 'Short break' },
      { time: '11:15 AM - 12:30 PM', title: 'Workplace Application Workshop', description: 'Design energy-conscious systems for meetings, collaboration, and communication' },
      { time: '12:30 PM - 1:30 PM', title: 'Lunch Break', description: 'Networking opportunity' },
      { time: '1:30 PM - 2:45 PM', title: 'Implementation Planning', description: 'Create your customized workplace energy roadmap' },
      { time: '2:45 PM - 3:00 PM', title: 'Q&A and Closing', description: 'Final questions and next steps' },
    ],
    requirements: [
      'Familiarity with NeuroElemental framework recommended',
      'Bring information about your team composition if applicable',
      'Notebook for planning exercises',
      'Authority to implement changes in your workplace (helpful but not required)',
    ],
  },
  'instructor-certification-info-session': {
    id: '6',
    slug: 'instructor-certification-info-session',
    title: 'Instructor Certification Info Session',
    description: 'Learn about the certification program, requirements, and what it means to become a certified NeuroElemental instructor.',
    longDescription: 'Considering becoming a certified NeuroElemental instructor? This free info session covers everything you need to know about the certification program, application process, curriculum, ongoing support, and how to build a successful practice teaching the framework. Hear from current instructors and get all your questions answered.',
    eventType: 'webinar',
    startDate: new Date('2025-12-12T18:00:00'),
    endDate: new Date('2025-12-12T19:30:00'),
    timezone: 'PST',
    instructor: 'Jannik Laursen',
    instructorBio: 'Creator of NeuroElemental and lead instructor for the certification program.',
    price: 0,
    capacity: 200,
    spotsRemaining: 156,
    attendees: 44,
    rating: 4.9,
    reviewCount: 23,
    thumbnail: '/events/cert-info.jpg',
    isPublished: true,
    tags: ['Certification', 'Free', 'Professional'],
    whatYouWillGet: [
      'Certification program overview',
      'Q&A with current instructors',
      'Application process details',
      'Business building guidance',
      'Special early-bird pricing',
    ],
    agenda: [
      { time: '6:00 PM - 6:20 PM', title: 'Welcome & Program Overview', description: 'What certification includes and how it works' },
      { time: '6:20 PM - 6:50 PM', title: 'Hear from Certified Instructors', description: 'Panel discussion with current instructors about their experiences' },
      { time: '6:50 PM - 7:25 PM', title: 'Open Q&A', description: 'Get all your questions answered' },
      { time: '7:25 PM - 7:30 PM', title: 'Next Steps & Special Offer', description: 'How to apply and early-bird pricing details' },
    ],
    requirements: [
      'Interest in teaching the NeuroElemental framework',
      'Familiarity with the framework (have taken the assessment)',
      'No prior teaching experience required',
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await eventRepository.findBySlug(slug);

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  return {
    title: `${event.title} | NeuroElemental Events`,
    description: event.description || '',
  };
}

const eventTypeLabels = {
  online_workshop: 'Online Workshop',
  in_person_workshop: 'In-Person Workshop',
  webinar: 'Webinar',
  conference: 'Conference',
};

const eventTypeIcons = {
  online_workshop: Video,
  in_person_workshop: Building,
  webinar: Video,
  conference: Building,
};

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try to get event from database
   
  let event = await eventRepository.findBySlug(slug) as any;

  // Fallback to hardcoded data if database is empty
  if (!event && eventsData[slug]) {
    event = eventsData[slug];
  }

  // Calculate spots remaining
  const spotsRemaining = event?.capacity ? (event.capacity - (event.spots_taken || 0)) : null;
  const attendees = event?.spots_taken || eventsData[slug]?.attendees || 0;

  if (!event) {
    notFound();
  }

  // Merge database event with fallback data
  // NOTE: Using type assertion because this merges database types (snake_case)
  // with fallback types (camelCase) dynamically. A proper fix would require
  // a unified event type system across the app.
  const fallbackEvent = eventsData[slug];
   
  const fullEvent = {
    ...fallbackEvent, // Fallback data
    ...event, // Database data
    startDate: event.start_datetime ? new Date(event.start_datetime) : fallbackEvent?.startDate,
    endDate: event.end_datetime ? new Date(event.end_datetime) : fallbackEvent?.endDate,
    price: event.price_usd !== undefined ? event.price_usd : fallbackEvent?.price,
    eventType: event.event_type || fallbackEvent?.eventType,
    spotsRemaining,
    attendees,
    location: event.location_name ? {
      name: event.location_name,
      address: event.location_address ?? undefined,
    } : fallbackEvent?.location,
  } as any;

  const EventIcon = eventTypeIcons[fullEvent.eventType as keyof typeof eventTypeIcons];
  const spotsFillingUp = spotsRemaining ? spotsRemaining < (event.capacity || 0) * 0.3 : false;

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <Link href="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-background" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge>
                  <EventIcon className="w-3 h-3 mr-1" />
                  {eventTypeLabels[fullEvent.eventType as keyof typeof eventTypeLabels]}
                </Badge>
                {fullEvent.price === 0 && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    FREE
                  </Badge>
                )}
                {spotsFillingUp && (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                    Filling Fast
                  </Badge>
                )}
                {fullEvent.rating && (
                  <Badge variant="outline">
                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                    {fullEvent.rating} ({fullEvent.reviewCount} reviews)
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {fullEvent.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {fullEvent.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{format(fullEvent.startDate, 'MMMM d, yyyy')}</div>
                    <div className="text-sm text-muted-foreground">Date</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {format(fullEvent.startDate, 'h:mm a')} - {format(fullEvent.endDate, 'h:mm a')}
                    </div>
                    <div className="text-sm text-muted-foreground">{fullEvent.timezone}</div>
                  </div>
                </div>

                {fullEvent.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">{fullEvent.location.name}</div>
                      <div className="text-sm text-muted-foreground">Venue</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Online Event</div>
                      <div className="text-sm text-muted-foreground">Zoom link provided</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">{fullEvent.spotsRemaining} spots left</div>
                    <div className="text-sm text-muted-foreground">of {fullEvent.capacity} total</div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {fullEvent.longDescription}
              </p>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                  JL
                </div>
                <div>
                  <div className="font-medium">Led by {fullEvent.instructor}</div>
                  <div className="text-sm text-muted-foreground">{fullEvent.instructorBio}</div>
                </div>
              </div>
            </div>

            {/* Sidebar - Registration Card */}
            <div className="lg:col-span-1">
              <Card className="glass-card sticky top-24 border-primary/50">
                <CardHeader>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <PlayCircle className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">
                    {fullEvent.price === 0 ? 'FREE' : `$${fullEvent.price}`}
                  </CardTitle>
                  <CardDescription>
                    {fullEvent.spotsRemaining} of {fullEvent.capacity} spots remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/auth/signup">
                    <Button className="w-full bg-gradient-to-r from-primary to-[#764BA2] hover:shadow-lg" size="lg">
                      {fullEvent.price === 0 ? 'Register Free' : 'Get Your Ticket'}
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full" size="lg">
                      Sign In to Register
                    </Button>
                  </Link>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">This ticket includes:</h4>
                    <div className="space-y-2">
                      {fullEvent.whatYouWillGet.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>30-day recording access</span>
                    </div>
                    {fullEvent.price > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Full refund if canceled 48h before</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Agenda */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Event Agenda</CardTitle>
                  <CardDescription>
                    {format(fullEvent.startDate, 'MMMM d, yyyy')} • {format(fullEvent.startDate, 'h:mm a')} - {format(fullEvent.endDate, 'h:mm a')} {fullEvent.timezone}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fullEvent.agenda.map((item: { time: string; title: string; description: string }, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 w-32 text-sm font-medium text-primary">
                          {item.time}
                        </div>
                        <div className="flex-1 pb-4 border-l-2 border-border pl-4">
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>What You'll Need</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fullEvent.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-card border-primary/50 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to join us?
            </h2>
            <p className="text-muted-foreground mb-6">
              {fullEvent.attendees} people have already registered • {fullEvent.spotsRemaining} spots remaining
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-[#764BA2]">
                  {fullEvent.price === 0 ? 'Register Free' : `Get Ticket - $${fullEvent.price}`}
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline">
                  View All Events
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
