"use client";

import { Card } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  element: string;
  gradient: string;
  avatar_url?: string;
  rating?: number;
}

/** Fallback testimonials if CMS is unavailable */
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: "sarah-designer",
    name: "Sarah J.",
    role: "Product Designer",
    quote:
      "Finally, a framework that doesn't make me feel broken for having a variable energy pattern. Understanding my 'Electric' nature changed how I structure my work week.",
    element: "Electric Primary",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    id: "marcus-therapist",
    name: "Marcus T.",
    role: "Therapist",
    quote:
      "I use this with my neurodivergent clients. It provides a non-pathologizing language for them to explain their needs to partners and employers. Incredibly practical.",
    element: "Aquatic Primary",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    id: "elena-entrepreneur",
    name: "Elena R.",
    role: "Entrepreneur",
    quote:
      "I used to burn out every 3 months. Learning about the 'Passion vs. Survival' states helped me catch the signs early. My business is finally sustainable.",
    element: "Fiery Primary",
    gradient: "from-red-400 to-pink-500",
  },
  {
    id: "david-developer",
    name: "David K.",
    role: "Software Developer",
    quote:
      "As someone with ADHD, traditional productivity advice never worked. The Elemental framework taught me to work WITH my hyperfocus cycles instead of fighting them.",
    element: "Electric Primary",
    gradient: "from-purple-400 to-violet-500",
  },
  {
    id: "maya-teacher",
    name: "Maya L.",
    role: "Special Education Teacher",
    quote:
      "I've been using these concepts with my students. The visual elements make it so much easier for them to communicate their energy needs throughout the day.",
    element: "Earthen Primary",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    id: "james-manager",
    name: "James W.",
    role: "Team Manager",
    quote:
      "Our team did the assessment together. Understanding each person's elemental profile has transformed how we assign tasks and schedule meetings. Productivity is up 40%.",
    element: "Airy Primary",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    id: "nina-coach",
    name: "Nina P.",
    role: "Life Coach",
    quote:
      "The depth of the assessment surprised me. It captured nuances about my energy patterns that I've struggled to articulate for years. Now I have language for it.",
    element: "Aquatic Primary",
    gradient: "from-teal-400 to-cyan-500",
  },
  {
    id: "alex-parent",
    name: "Alex M.",
    role: "Parent & Freelancer",
    quote:
      "As a parent with autism, managing my energy while caring for my kids was exhausting. This framework helped me create boundaries without guilt. Life-changing.",
    element: "Earthen Primary",
    gradient: "from-amber-400 to-orange-500",
  },
];

/** Map CMS data to local format */
function mapCmsTestimonial(t: Record<string, unknown>): Testimonial {
  // Map element to gradient
  const gradients: Record<string, string> = {
    electric: "from-yellow-400 to-amber-500",
    aquatic: "from-blue-400 to-cyan-500",
    fiery: "from-red-400 to-pink-500",
    earthen: "from-green-400 to-emerald-500",
    airy: "from-sky-400 to-indigo-500",
  };
  const element = String(t.element || "").toLowerCase();

  return {
    id: String(t.id),
    name: String(t.name || "Anonymous"),
    role: String(t.role || t.title || ""),
    quote: String(t.content || t.quote || ""),
    element: String(t.element || ""),
    gradient: gradients[element] || "from-purple-400 to-violet-500",
    avatar_url: t.avatar_url as string | undefined,
    rating: (t.rating as number) || 5,
  };
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    FALLBACK_TESTIMONIALS
  );

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials && data.testimonials.length > 0) {
          setTestimonials(data.testimonials.map(mapCmsTestimonial));
        }
      })
      .catch(() => {
        // Keep fallback on error
      });
  }, []);

  // Show first 6
  const displayedTestimonials = testimonials.slice(0, 6);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Stories from the <span className="gradient-text">Community</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how understanding energy patterns is transforming lives and
            careers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayedTestimonials.map((t) => (
            <Card
              key={t.id}
              className="p-6 lg:p-8 glass-card border-border/50 hover:shadow-xl transition-all duration-300 relative group"
            >
              <Quote className="absolute top-4 right-4 lg:top-6 lg:right-6 w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
              <div className="flex gap-1 mb-4 lg:mb-6">
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <Star
                    key={`${t.id}-star-${starNum}`}
                    className="w-3 h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-foreground/90 mb-4 lg:mb-6 leading-relaxed italic text-sm lg:text-base line-clamp-4 lg:line-clamp-none">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 lg:gap-4">
                <div
                  className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm lg:text-base shrink-0`}
                >
                  {t.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-foreground text-sm lg:text-base truncate">
                    {t.name}
                  </div>
                  <div className="text-xs lg:text-sm text-muted-foreground truncate">
                    {t.role} <span className="hidden sm:inline">•</span>{" "}
                    <span className="text-primary block sm:inline">
                      {t.element}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Join <span className="font-semibold text-foreground">2,500+</span>{" "}
            neurodivergent individuals who have discovered their energy patterns
          </p>
        </div>
      </div>
    </section>
  );
}
