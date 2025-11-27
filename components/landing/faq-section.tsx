import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { memo } from 'react';

const faqs = [
  {
    id: "personality-box",
    question: "Is this just another personality test that puts me in a box?",
    answer: "No. NeuroElemental is an energy management system, not a rigid typology. We use the Elements as a map to understand your natural patterns, but we emphasize that you are a dynamic mix of all six and can grow and adapt. The goal is to give you more freedom by understanding yourself, not to confine you to a label."
  },
  {
    id: "assessment-duration",
    question: "How long does the assessment take?",
    answer: "Most people complete all 30 questions in 5-7 minutes. There's no time limit, but we recommend going with your gut instinct rather than overthinking. Your first response is usually the most accurate."
  },
  {
    id: "immediate-results",
    question: "Will I get my results immediately?",
    answer: "Yes! As soon as you complete the final question, we'll calculate your Element Mix and show your personalized results page. No waiting, no email verification required."
  },
  {
    id: "account-required",
    question: "Do I need to create an account?",
    answer: "Nope! The assessment is completely anonymous. You can optionally enter your email to save your results, but it's not required to see them."
  },
  {
    id: "medical-diagnosis",
    question: "Is this a medical diagnosis?",
    answer: "No. The NeuroElemental System is a framework for self-understanding and energy management. It is not a diagnostic tool and should not replace professional medical or psychological advice. We always recommend consulting with licensed professionals for health concerns."
  },
  {
    id: "replace-therapy",
    question: "Can this replace therapy or medication?",
    answer: "Absolutely not. NeuroElemental is an educational tool designed to complement, not replace, professional medical and psychological care. We see our framework as a powerful support system to use alongside therapy and other treatments."
  },
  {
    id: "different-from-mbti",
    question: "How is this different from MBTI or Enneagram?",
    answer: "Traditional tests focus on static traits (who you are). We focus on dynamic energy states (how you function). Our system celebrates neurodiversity and is specifically designed to account for experiences like burnout, masking, and sensory processing differences. Plus, it's grounded in modern neuroscience research."
  },
  {
    id: "neurodivergent-only",
    question: "Is this only for neurodivergent people?",
    answer: "No! While built with neurodivergent minds (ADHD, Autism) at the center, this framework celebrates brain diversity in all its forms. Whether you're neurodivergent, highly sensitive, or simply feel misunderstood by traditional systems, you'll find valuable insights here. Think of it like curb cuts—designed for wheelchairs, helpful for everyone."
  },
  {
    id: "brain-diversity",
    question: "What do you mean by 'brain diversity'?",
    answer: "Brain diversity recognizes that all brains work differently—we all have varying attention patterns, sensory sensitivities, energy levels, and processing styles. Some differences are more pronounced (neurodivergence like ADHD, Autism), but everyone exists on this spectrum. Our framework helps you understand YOUR unique brain patterns, not force you into neurotypical standards."
  },
  {
    id: "free-assessment",
    question: "Is the assessment really free?",
    answer: "Yes, the core assessment and your basic profile are 100% free forever. We offer deeper dives, courses, and coaching as paid upgrades, but you get immediate value without paying a dime. No credit card required, ever."
  },
  {
    id: "framework-accuracy",
    question: "How accurate is this framework?",
    answer: "The NeuroElemental framework is based on polyvagal theory, nervous system research, and validated through user studies. That said, this is a self-report tool—accuracy depends on honest, gut-level responses. Most users report 80-90% resonance with their results."
  },
  {
    id: "results-mismatch",
    question: "What if my results don't feel right?",
    answer: "That's valuable information! A mismatch can indicate that you're operating heavily in a 'Societal Mode' (masking) or 'Protection Mode' (trauma response) rather than your natural state. Try retaking the assessment when you're well-rested and answering as your authentic self, not your work persona."
  },
  {
    id: "element-mix-change",
    question: "Can my Element Mix change over time?",
    answer: "Your core tendencies tend to be stable, but your dominant elements can shift based on life stage, stress, burnout, or intentional personal development. Your results reflect your current energy state, not a fixed personality. We recommend retaking the assessment every 3-6 months."
  },
  {
    id: "retake-assessment",
    question: "Can I retake the assessment?",
    answer: "Absolutely! Your energy patterns can shift based on life circumstances, stress levels, and personal growth. Retake it whenever you feel you've changed or want to check in with yourself."
  },
  {
    id: "data-privacy",
    question: "What happens to my data?",
    answer: "Your assessment responses are stored anonymously (unless you choose to enter your email). We never sell your data. We use aggregated, de-identified data to improve the assessment. You can read our full privacy policy for details."
  },
  {
    id: "share-results",
    question: "Can I share my results with others?",
    answer: "Yes! You can copy the results URL to share with friends, family, or your therapist. They'll see your scores and element breakdown. If you want to keep results private, simply don't share the link."
  },
  {
    id: "manipulation-concerns",
    question: "I'm afraid of being manipulated by self-help systems. How are you different?",
    answer: "We share that concern, which is why our entire philosophy is built on ethical principles. We're transparent about what this system is and what it is not. We avoid creating dependency, will never use high-pressure sales tactics, and we position ourselves as guides, not gurus. Read our public ethics statement to learn more."
  },
  {
    id: "clients-teams",
    question: "Can I use this with my clients or team?",
    answer: "Yes! Many therapists, coaches, and HR professionals use NeuroElemental with their clients. For organizational use or certification to teach the framework, check out our Instructor Certification program."
  },
  {
    id: "money-back-guarantee",
    question: "Is there a money-back guarantee?",
    answer: "Yes! All paid products come with a 60-day full refund, no questions asked. If the workbook or course doesn't help you understand your energy patterns, we'll refund you immediately."
  }
];

export const FAQSection = memo(function FAQSection() {
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





