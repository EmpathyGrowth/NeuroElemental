import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { memo } from 'react';

const testimonials = [
  {
    id: "sarah-designer",
    name: "Sarah J.",
    role: "Product Designer",
    quote: "Finally, a framework that doesn't make me feel broken for having a variable energy pattern. Understanding my 'Electric' nature changed how I structure my work week.",
    element: "Electric Primary",
    gradient: "from-yellow-400 to-amber-500"
  },
  {
    id: "marcus-therapist",
    name: "Marcus T.",
    role: "Therapist",
    quote: "I use this with my neurodivergent clients. It provides a non-pathologizing language for them to explain their needs to partners and employers. Incredibly practical.",
    element: "Aquatic Primary",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    id: "elena-entrepreneur",
    name: "Elena R.",
    role: "Entrepreneur",
    quote: "I used to burn out every 3 months. Learning about the 'Passion vs. Survival' states helped me catch the signs early. My business is finally sustainable.",
    element: "Fiery Primary",
    gradient: "from-red-400 to-pink-500"
  }
];

export const TestimonialsSection = memo(function TestimonialsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Stories from the <span className="gradient-text">Community</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how understanding energy patterns is transforming lives and careers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              className="p-8 glass-card border-border/50 hover:shadow-xl transition-all duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-muted-foreground/20 group-hover:text-primary/20 transition-colors" />
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <Star key={`${t.id}-star-${starNum}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-foreground/90 mb-6 leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold`}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold text-foreground">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role} • <span className="text-primary">{t.element}</span></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});





