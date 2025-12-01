"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logging";
import { CheckCircle, Gift, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ExitIntentPopupProps {
  /**
   * Which page this popup is for (determines messaging)
   */
  context: "results" | "pricing" | "assessment" | "generic";
  /**
   * Top element from assessment results (for personalization)
   */
  topElement?: string;
}

/**
 * Exit intent popup - triggers when user moves mouse to leave page
 * Captures emails and offers last-chance incentives
 */
export function ExitIntentPopup({ context, topElement }: ExitIntentPopupProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Only trigger once per session
    if (hasTriggered) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse moves to top of window (to close tab/window)
      if (e.clientY <= 0 && !hasTriggered) {
        setHasTriggered(true);
        setOpen(true);
      }
    };

    // Add event listener after 10 seconds (don't annoy immediate visitors)
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasTriggered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      // Save email to waitlist or leads
      await fetch("/api/leads/exit-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          context,
          top_element: topElement,
        }),
      });

      setSubmitted(true);
      setTimeout(() => setOpen(false), 3000);
    } catch (error) {
      logger.error("Exit intent submission error:", error as Error);
    }
  };

  // Memoize content to avoid recalculating on every render
  const content = useMemo(() => {
    switch (context) {
      case "results":
        return {
          title: `Wait! Don't Lose Your ${topElement || "Element"} Insights`,
          description:
            "Get your complete profile PDF + exclusive energy guide FREE",
          offer: `Your personalized ${topElement || "Element"} Energy Guide (worth $27) + Full Assessment PDF`,
        };
      case "pricing":
        return {
          title: "Wait! Get 20% Off Today",
          description: "Special exit offer - valid for the next 30 minutes",
          offer: "Use code EXIT20 at checkout for 20% off any plan",
        };
      case "assessment":
        return {
          title: "Before You Go...",
          description: "Save your progress and get a free energy starter kit",
          offer:
            "Energy tracking template + 5-day mini-course on managing your energy",
        };
      default:
        return {
          title: "Stay Connected",
          description: "Get free energy management tips and exclusive content",
          offer: "Weekly energy tips + access to exclusive tools and resources",
        };
    }
  }, [context, topElement]);

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-center">
              Check Your Email! 📧
            </DialogTitle>
            <DialogDescription className="text-center">
              We've sent your free resources to <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              You should receive it within the next few minutes. Check your spam
              folder if you don't see it.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Gift className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Offer Box */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm mb-1">You'll Get:</p>
                <p className="text-sm text-muted-foreground">{content.offer}</p>
              </div>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="exit-email">Email Address</Label>
              <Input
                id="exit-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Me The Free Resources
            </Button>
          </form>

          {/* Skip */}
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full text-sm text-muted-foreground"
          >
            No thanks, I'll figure it out myself
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            🔒 No spam. Unsubscribe anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
