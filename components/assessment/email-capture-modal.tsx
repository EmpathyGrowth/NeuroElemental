'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Sparkles, CheckCircle, X } from 'lucide-react';
import { logger } from '@/lib/logging';

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
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSaving(true);
    try {
      // Save email for results delivery
      const response = await fetch('/api/assessment/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        onEmailSaved(email);
        onOpenChange(false);
      }
    } catch (error) {
      logger.error('Failed to save email:', error as Error);
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
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full px-2 py-0.5 text-xs font-bold text-white">
                {progress}%
              </div>
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">You're Halfway There! 🎉</DialogTitle>
          <DialogDescription className="text-center">
            Save your progress and get your complete Energy Profile emailed to you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-sm font-semibold text-foreground mb-2">
              What you'll get:
            </p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Full Element Profile PDF (worth $27)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>7-day Energy Mastery email course</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Personalized regeneration strategies</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Save progress (resume anytime)</span>
              </div>
            </div>
          </div>

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
              {saving ? 'Saving...' : 'Save Progress & Continue'}
            </Button>
          </form>

          {/* Skip Option */}
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Continue without email (you can still see results)
          </Button>

          {/* Trust */}
          <p className="text-xs text-muted-foreground text-center">
            🔒 Zero spam. 14,000+ subscribers. Unsubscribe anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
