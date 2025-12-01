import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { eventRepository, type AgendaItem, type Event } from "@/lib/db";
import { format } from "date-fns";
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
  Video,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every 60 seconds

/** Transformed event for display */
interface DisplayEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  eventType: Event["event_type"];
  startDate: Date;
  endDate: Date;
  timezone: string;
  location: { name: string; address?: string } | null;
  instructor: string | null;
  instructorBio: string | null;
  price: number;
  capacity: number | null;
  spotsRemaining: number | null;
  attendees: number;
  rating: number | null;
  reviewCount: number;
  thumbnail: string | null;
  tags: string[];
  whatYouWillGet: string[];
  agenda: AgendaItem[];
  requirements: string[];
}

/** Default values for events missing rich content */
const DEFAULT_BENEFITS = [
  "Expert-led instruction",
  "Live Q&A session",
  "Recording access",
  "Certificate of attendance",
];

const DEFAULT_AGENDA: AgendaItem[] = [
  {
    time: "TBD",
    title: "Welcome & Introduction",
    description: "Get oriented and meet the instructor",
  },
  {
    time: "TBD",
    title: "Main Session",
    description: "Core content and interactive learning",
  },
  {
    time: "TBD",
    title: "Q&A and Closing",
    description: "Questions answered and next steps",
  },
];

const DEFAULT_REQUIREMENTS = [
  "Stable internet connection",
  "Quiet space for participation",
  "Notebook for notes",
];

/** Transform DB event to display format */
function transformEvent(event: Event): DisplayEvent {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    longDescription: event.long_description,
    eventType: event.event_type,
    startDate: new Date(event.start_datetime),
    endDate: new Date(event.end_datetime),
    timezone: event.timezone,
    location: event.location_name
      ? {
          name: event.location_name,
          address: event.location_address?.address as string,
        }
      : null,
    instructor: event.instructor_name,
    instructorBio: event.instructor_bio,
    price: event.price_usd,
    capacity: event.capacity,
    spotsRemaining: event.capacity ? event.capacity - event.spots_taken : null,
    attendees: event.spots_taken,
    rating: event.rating,
    reviewCount: event.review_count,
    thumbnail: event.thumbnail_url,
    tags: event.tags?.length > 0 ? event.tags : [],
    whatYouWillGet:
      event.benefits?.length > 0 ? event.benefits : DEFAULT_BENEFITS,
    agenda: event.agenda?.length > 0 ? event.agenda : DEFAULT_AGENDA,
    requirements:
      event.requirements?.length > 0
        ? event.requirements
        : DEFAULT_REQUIREMENTS,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await eventRepository.findBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.title} | NeuroElemental Events`,
    description: event.description || "",
  };
}

const eventTypeLabels = {
  online_workshop: "Online Workshop",
  in_person_workshop: "In-Person Workshop",
  webinar: "Webinar",
  conference: "Conference",
};

const eventTypeIcons = {
  online_workshop: Video,
  in_person_workshop: Building,
  webinar: Video,
  conference: Building,
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Get event from database
  const dbEvent = await eventRepository.findBySlug(slug);

  if (!dbEvent) {
    notFound();
  }

  // Transform to display format
  const event = transformEvent(dbEvent);

  const EventIcon =
    eventTypeIcons[event.eventType as keyof typeof eventTypeIcons];
  const spotsFillingUp = event.spotsRemaining
    ? event.spotsRemaining < (event.capacity || 0) * 0.3
    : false;

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
                  {
                    eventTypeLabels[
                      event.eventType as keyof typeof eventTypeLabels
                    ]
                  }
                </Badge>
                {event.price === 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-500"
                  >
                    FREE
                  </Badge>
                )}
                {spotsFillingUp && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-500/10 text-orange-500"
                  >
                    Filling Fast
                  </Badge>
                )}
                {event.rating && (
                  <Badge variant="outline">
                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                    {event.rating} ({event.reviewCount} reviews)
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {event.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {event.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {format(event.startDate, "MMMM d, yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">Date</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {format(event.startDate, "h:mm a")} -{" "}
                      {format(event.endDate, "h:mm a")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.timezone}
                    </div>
                  </div>
                </div>

                {event.location ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">{event.location.name}</div>
                      <div className="text-sm text-muted-foreground">Venue</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Online Event</div>
                      <div className="text-sm text-muted-foreground">
                        Zoom link provided
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">
                      {event.spotsRemaining} spots left
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {event.capacity} total
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {event.longDescription}
              </p>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                  JL
                </div>
                <div>
                  <div className="font-medium">Led by {event.instructor}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.instructorBio}
                  </div>
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
                    {event.price === 0 ? "FREE" : `$${event.price}`}
                  </CardTitle>
                  <CardDescription>
                    {event.spotsRemaining} of {event.capacity} spots remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/auth/signup">
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-[#764BA2] hover:shadow-lg"
                      size="lg"
                    >
                      {event.price === 0 ? "Register Free" : "Get Your Ticket"}
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full" size="lg">
                      Sign In to Register
                    </Button>
                  </Link>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      This ticket includes:
                    </h4>
                    <div className="space-y-2">
                      {event.whatYouWillGet.map((item: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
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
                    {event.price > 0 && (
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
                    {format(event.startDate, "MMMM d, yyyy")} •{" "}
                    {format(event.startDate, "h:mm a")} -{" "}
                    {format(event.endDate, "h:mm a")} {event.timezone}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.agenda.map(
                      (
                        item: {
                          time: string;
                          title: string;
                          description: string;
                        },
                        idx: number
                      ) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-32 text-sm font-medium text-primary">
                            {item.time}
                          </div>
                          <div className="flex-1 pb-4 border-l-2 border-border pl-4">
                            <h4 className="font-semibold mb-1">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      )
                    )}
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
                    {event.requirements.map((req: string, idx: number) => (
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
            <h2 className="text-3xl font-bold mb-4">Ready to join us?</h2>
            <p className="text-muted-foreground mb-6">
              {event.attendees} people have already registered •{" "}
              {event.spotsRemaining} spots remaining
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-[#764BA2]"
                >
                  {event.price === 0
                    ? "Register Free"
                    : `Get Ticket - $${event.price}`}
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
