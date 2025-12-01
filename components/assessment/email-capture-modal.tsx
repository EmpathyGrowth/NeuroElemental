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
import { Mail, X } from "lucide-react";
import { useState } from "react";

interface EmailCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailSaved: (email: string) => void;
  answeredCount: number;
  totalCount: number;
}

/**
 * Email capture modal shown at 50% assessment completion
 * Allows users to save progress and receive results via email
 */
export function EmailCaptureModal({
  open,
  onOpenChange,
  onEmailSaved,
  answeredCount,
  totalCount,
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSaving(true);
    try {
      // Save email for results delivery
      const response = await fetch("/api/assessment/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        onEmailSaved(email);
        onOpenChange(false);
      }
    } catch (error) {
      logger.error("Failed to save email:", error as Error);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const progress = Math.round((answeredCount / totalCount) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none"
          aria-label="Skip email capture"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Want a copy of your results?
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Enter your email to receive your full profile when you finish.
            <span className="block mt-1 text-muted-foreground/80">
              (You're {progress}% done - this is optional)
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email-capture">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email-capture"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Send me my results"}
            </Button>
          </form>

          {/* Skip Option */}
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>

          {/* Trust */}
          <p className="text-xs text-muted-foreground text-center">
            🔒 No spam, unsubscribe anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
