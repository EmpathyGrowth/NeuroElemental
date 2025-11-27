import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { eventRepository } from '@/lib/db';
import { format } from 'date-fns';
import { ArrowRight, Building, Calendar, CheckCircle, Clock, MapPin, Users, Video } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Events & Workshops | NeuroElemental',
  description: 'Join live workshops, webinars, and community events to deepen your understanding of your energy patterns.',
};

export const revalidate = 60; // Revalidate every 60 seconds

// Sample events data - in production, this would come from Supabase
const events = [
  {
    id: '1',
    slug: 'energy-reset-workshop',
    title: 'Energy Reset Workshop',
    description: 'A half-day intensive for anyone experiencing burnout or persistent exhaustion. Learn immediate strategies to begin rebuilding your energy reserves.',
    eventType: 'online_workshop',
    startDate: new Date('2025-12-15T10:00:00'),
    endDate: new Date('2025-12-15T13:00:00'),
    timezone: 'PST',
    instructor: 'Jannik Laursen',
    price: 47,
    capacity: 50,
    spotsRemaining: 23,
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
  },
  {
    id: '2',
    slug: 'elemental-communication-masterclass',
    title: 'Elemental Communication Masterclass',
    description: 'Master the art of communicating across different Element types. Perfect for managers, therapists, coaches, and anyone who works with people.',
    eventType: 'online_workshop',
    startDate: new Date('2025-12-20T14:00:00'),
    endDate: new Date('2025-12-20T17:00:00'),
    timezone: 'EST',
    instructor: 'Jannik Laursen',
    price: 67,
    capacity: 100,
    spotsRemaining: 67,
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
  },
  {
    id: '3',
    slug: 'neuroelemental-intensive-nyc',
    title: 'NeuroElemental Intensive - New York',
    description: 'Two-day in-person immersive experience diving deep into the framework with hands-on practice, community connection, and personalized guidance.',
    eventType: 'in_person_workshop',
    startDate: new Date('2026-02-14T09:00:00'),
    endDate: new Date('2026-02-15T17:00:00'),
    timezone: 'EST',
    location: {
      name: 'Manhattan Conference Center',
      address: '123 Broadway, New York, NY 10012',
    },
    instructor: 'Jannik Laursen + Team',
    price: 497,
    capacity: 30,
    spotsRemaining: 12,
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
  },
  {
    id: '4',
    slug: 'free-monthly-qa',
    title: 'Free Monthly Community Q&A',
    description: 'Open Q&A session for the NeuroElemental community. Bring your questions about energy management, Element Mixes, and practical applications.',
    eventType: 'webinar',
    startDate: new Date('2025-12-05T12:00:00'),
    endDate: new Date('2025-12-05T13:00:00'),
    timezone: 'PST',
    instructor: 'Jannik Laursen',
    price: 0,
    capacity: 500,
    spotsRemaining: 342,
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
  },
  {
    id: '5',
    slug: 'workplace-energy-optimization',
    title: 'Workplace Energy Optimization',
    description: 'For teams and organizations: learn to apply NeuroElemental principles to improve productivity, reduce burnout, and enhance collaboration.',
    eventType: 'online_workshop',
    startDate: new Date('2026-01-10T10:00:00'),
    endDate: new Date('2026-01-10T15:00:00'),
    timezone: 'GMT',
    instructor: 'Jannik Laursen',
    price: 197,
    capacity: 50,
    spotsRemaining: 38,
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
  },
  {
    id: '6',
    slug: 'instructor-certification-info-session',
    title: 'Instructor Certification Info Session',
    description: 'Learn about the certification program, requirements, and what it means to become a certified NeuroElemental instructor.',
    eventType: 'webinar',
    startDate: new Date('2025-12-12T18:00:00'),
    endDate: new Date('2025-12-12T19:30:00'),
    timezone: 'PST',
    instructor: 'Jannik Laursen',
    price: 0,
    capacity: 200,
    spotsRemaining: 156,
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
  },
];

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

// Fallback events data (used if database is empty)
const events_fallback = events;

export default async function EventsPage() {
  // Fetch events from database
  const dbEvents = await eventRepository.getUpcoming();

  // Transform to match expected format
  const eventsFromDb = dbEvents.map(event => ({
    ...event,
    startDate: new Date(event.start_datetime),
    endDate: event.end_datetime ? new Date(event.end_datetime) : new Date(event.start_datetime),
    price: event.price_usd,
    eventType: event.event_type, // Map event_type to eventType
    spotsRemaining: event.spots_remaining,
    location: event.location_name ? {
      name: event.location_name,
      address: event.location_address,
    } : null,
    whatYouWillGet: [
      'Expert-led instruction',
      'Live Q&A session',
      'Recording access',
      'Certificate of attendance',
      'Networking opportunities',
    ],
  }));

  // Use database events if available, otherwise use fallback
  const displayEvents = eventsFromDb.length > 0 ? eventsFromDb : events_fallback;
  const upcomingEvents = displayEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const freeEvents = upcomingEvents.filter(e => e.price === 0);
  const paidEvents = upcomingEvents.filter(e => e.price > 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="📅 Live Events"
        title={
          <>
            Learn <span className="gradient-text">Together</span>
          </>
        }
        description="Join live workshops, community gatherings, and intensive training to deepen your practice"
      >
        <div className="flex flex-wrap justify-center gap-6 text-sm mt-8">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Expert-led instruction</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Community connection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Recording access</span>
          </div>
        </div>
      </HeroSection>

      {/* Free Events Section */}
      {freeEvents.length > 0 && (
        <section className="py-12 bg-background/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Free Community Events</h2>
              <p className="text-muted-foreground">Join us for open Q&As and community gatherings</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {freeEvents.map((event) => {
                const EventIcon = eventTypeIcons[event.eventType as keyof typeof eventTypeIcons];
                return (
                  <Card key={event.id} className="glass-card hover:shadow-xl transition-all duration-300 border-primary/30">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          FREE
                        </Badge>
                        <Badge variant="outline">
                          <EventIcon className="w-3 h-3 mr-1" />
                          {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels]}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(event.startDate, 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')} {event.timezone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{event.spotsRemaining} spots remaining</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Includes:</p>
                        <ul className="space-y-1">
                          {event.whatYouWillGet.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Link href={`/events/${event.slug}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-primary to-[#764BA2]">
                          Register Free
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Paid Events Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Upcoming Workshops & Intensives</h2>
            <p className="text-muted-foreground">Deep-dive learning experiences and professional training</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidEvents.map((event) => {
              const EventIcon = eventTypeIcons[event.eventType as keyof typeof eventTypeIcons];
              const spotsFillingUp = (event.spotsRemaining || 0) < (event.capacity || 0) * 0.3;

              return (
                <Card key={event.id} className="glass-card hover:shadow-xl transition-all duration-300 flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">
                        <EventIcon className="w-3 h-3 mr-1" />
                        {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels]}
                      </Badge>
                      {spotsFillingUp && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">
                          Filling Fast
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{format(event.startDate, 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(event.startDate, 'h:mm a')} {event.timezone}
                        </span>
                      </div>
                      {event.eventType === 'in_person_workshop' && event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event.spotsRemaining} of {event.capacity} spots left</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">You'll get:</p>
                      <ul className="space-y-1">
                        {event.whatYouWillGet.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="text-xs flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold">${event.price}</div>
                      <div className="text-xs text-muted-foreground">per person</div>
                    </div>
                    <Link href={`/events/${event.slug}`}>
                      <Button>
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="glass-card border-primary/50 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Want to host a private workshop?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We offer custom workshops and training for organizations, schools, and private groups
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#764BA2]">
                  Request Private Workshop
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Self-Paced Courses
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
