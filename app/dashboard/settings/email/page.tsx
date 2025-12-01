'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, CheckCircle, Bell, ShoppingCart, GraduationCap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';
import { DashboardHeader } from '@/components/dashboard';

interface EmailPreferences {
  marketing: boolean;
  course_updates: boolean;
  session_reminders: boolean;
  payment_receipts: boolean;
}

export default function EmailPreferencesPage() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    marketing: true,
    course_updates: true,
    session_reminders: true,
    payment_receipts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Master toggle
  const [emailsEnabled, setEmailsEnabled] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          const prefs = data.preferences || {};
          setPreferences({
            marketing: prefs.marketing ?? true,
            course_updates: prefs.course_updates ?? true,
            session_reminders: prefs.session_reminders ?? true,
            payment_receipts: prefs.payment_receipts ?? true,
          });
        }
      } catch (error) {
        logger.error('Error loading email preferences:', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailsEnabled ? preferences : {
          marketing: false,
          course_updates: false,
          session_reminders: false,
          payment_receipts: true, // Always receive payment receipts
        }),
      });

      if (response.ok) {
        toast.success('Email preferences saved', {
          description: 'Your notification settings have been updated.',
        });
        setHasChanges(false);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      toast.error('Failed to save preferences', {
        description: 'Please try again later.',
      });
      logger.error('Error saving email preferences:', error as Error);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof EmailPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <DashboardHeader title="Email Preferences" />
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <DashboardHeader
        title="Email Preferences"
        subtitle="Manage which emails you receive from NeuroElemental"
      />

      <div className="space-y-6">
        {/* Master Toggle */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Control all email notifications at once
                </CardDescription>
              </div>
              <Switch
                checked={emailsEnabled}
                onCheckedChange={(checked) => {
                  setEmailsEnabled(checked);
                  setHasChanges(true);
                }}
                aria-label="Enable all email notifications"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Individual Preferences */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Email Types</CardTitle>
            <CardDescription>
              Choose which types of emails you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Course Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="course-updates" className="text-base font-medium">
                    Course Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New lessons, content updates, and course announcements
                  </p>
                </div>
              </div>
              <Switch
                id="course-updates"
                checked={preferences.course_updates}
                onCheckedChange={(checked) => updatePreference('course_updates', checked)}
                disabled={!emailsEnabled}
              />
            </div>

            <Separator />

            {/* Session Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Bell className="w-5 h-5 text-purple-500 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="session-reminders" className="text-base font-medium">
                    Event Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for upcoming events and sessions you're registered for
                  </p>
                </div>
              </div>
              <Switch
                id="session-reminders"
                checked={preferences.session_reminders}
                onCheckedChange={(checked) => updatePreference('session_reminders', checked)}
                disabled={!emailsEnabled}
              />
            </div>

            <Separator />

            {/* Marketing */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="marketing" className="text-base font-medium">
                    Marketing & Community
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    New courses, special offers, community updates, and tips
                  </p>
                </div>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={(checked) => updatePreference('marketing', checked)}
                disabled={!emailsEnabled}
              />
            </div>

            <Separator />

            {/* Payment Receipts */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <ShoppingCart className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="payment-receipts" className="text-base font-medium">
                    Payment Receipts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Invoices, receipts, and billing notifications (always enabled for legal compliance)
                  </p>
                </div>
              </div>
              <Switch
                id="payment-receipts"
                checked={true}
                disabled={true}
                aria-label="Payment receipts are always enabled"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : hasChanges ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                ) : (
                  'No Changes'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="glass-card border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy Note:</strong> We respect your inbox. You can update these preferences anytime. Payment receipts are required for legal compliance and cannot be disabled.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
