"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { memo, useEffect, useState } from "react";

/** FAQ item from database */
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
}

/** Fallback FAQs if API fails */
const FALLBACK_FAQS: FAQ[] = [
  {
    id: "personality-box",
    question: "Is this just another personality test that puts me in a box?",
    answer:
      "No. NeuroElemental is an energy management system, not a rigid typology. We use the Elements as a map to understand your natural patterns, but we emphasize that you are a dynamic mix of all six and can grow and adapt.",
    category: "general",
    display_order: 1,
  },
  {
    id: "assessment-duration",
    question: "How long does the assessment take?",
    answer:
      "Most people complete all 30 questions in 5-7 minutes. There's no time limit, but we recommend going with your gut instinct rather than overthinking.",
    category: "assessment",
    display_order: 2,
  },
  {
    id: "immediate-results",
    question: "Will I get my results immediately?",
    answer:
      "Yes! As soon as you complete the final question, we'll calculate your Element Mix and show your personalized results page. No waiting, no email verification required.",
    category: "assessment",
    display_order: 3,
  },
  {
    id: "free-assessment",
    question: "Is the assessment really free?",
    answer:
      "Yes, the core assessment and your basic profile are 100% free forever. We offer deeper dives, courses, and coaching as paid upgrades, but you get immediate value without paying a dime.",
    category: "pricing",
    display_order: 4,
  },
  {
    id: "neurodivergent-only",
    question: "Is this only for neurodivergent people?",
    answer:
      "No! While built with neurodivergent minds (ADHD, Autism) at the center, this framework celebrates brain diversity in all its forms. Whether you're neurodivergent, highly sensitive, or simply feel misunderstood by traditional systems, you'll find valuable insights here.",
    category: "general",
    display_order: 5,
  },
];

export const FAQSection = memo(function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>(FALLBACK_FAQS);

  useEffect(() => {
    // Fetch FAQs from API
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((data) => {
        if (data.faqs && data.faqs.length > 0) {
          setFaqs(data.faqs);
        }
      })
      .catch(() => {
        // Keep fallback FAQs on error
      });
  }, []);

  return (
    <section className="py-20 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="glass-card border-border/50 px-6 rounded-xl data-[state=open]:border-primary/50 transition-all"
            >
              <AccordionTrigger className="text-lg font-medium hover:text-primary text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
});
