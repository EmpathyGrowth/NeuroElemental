'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Bell, BellOff, Loader2, Mail, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ReminderSettings {
  enabled: boolean;
  time: string;
  method: 'push' | 'email' | 'both';
  days: number[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

interface ReminderSettingsProps {
  className?: string;
}

/**
 * Reminder Settings Component
 * Requirements: 12.3, 12.4
 */
export function ReminderSettings({ className }: ReminderSettingsProps) {
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: false,
    time: '09:00',
    method: 'push',
    days: [1, 2, 3, 4, 5],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/tools/reminders');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        console.error('Failed to fetch reminder settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/tools/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success(
          settings.enabled
            ? 'Reminders enabled! You\'ll receive notifications at your chosen time.'
            : 'Reminder settings saved.'
        );
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save reminder settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDisableAll = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/tools/reminders', {
        method: 'DELETE',
      });

      if (response.ok) {
        setSettings((prev) => ({ ...prev, enabled: false }));
        toast.success('All reminders have been disabled');
      } else {
        throw new Error('Failed to disable');
      }
    } catch (error) {
      toast.error('Failed to disable reminders');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setSettings((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort(),
    }));
  };

  if (loading) {
    return (
      <Card className={cn('glass-card', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('glass-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Check-in Reminders
        </CardTitle>
        <CardDescription>
          Get gentle reminders to complete your daily energy check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications to check in daily
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) =>
              setSettings((prev) => ({ ...prev, enabled }))
            }
          />
        </div>

        {settings.enabled && (
          <>
            {/* Time Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Reminder Time</Label>
              <input
                type="time"
                value={settings.time}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, time: e.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            {/* Notification Method */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Notification Method</Label>
              <RadioGroup
                value={settings.method}
                onValueChange={(method) =>
                  setSettings((prev) => ({
                    ...prev,
                    method: method as 'push' | 'email' | 'both',
                  }))
                }
                className="grid grid-cols-3 gap-3"
              >
                <div>
                  <RadioGroupItem
                    value="push"
                    id="push"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="push"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Smartphone className="mb-2 h-5 w-5" />
                    <span className="text-sm">Push</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="email"
                    id="email"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="email"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Mail className="mb-2 h-5 w-5" />
                    <span className="text-sm">Email</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="both"
                    id="both"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="both"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Bell className="mb-2 h-5 w-5" />
                    <span className="text-sm">Both</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Days of Week */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Reminder Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                      settings.days.includes(day.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select the days you want to receive reminders
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
          {settings.enabled && (
            <Button
              variant="outline"
              onClick={handleDisableAll}
              disabled={saving}
            >
              <BellOff className="w-4 h-4 mr-2" />
              Disable All
            </Button>
          )}
        </div>

        {/* Info text */}
        <p className="text-xs text-muted-foreground text-center">
          Reminders are skipped automatically if you've already checked in that day
        </p>
      </CardContent>
    </Card>
  );
}
