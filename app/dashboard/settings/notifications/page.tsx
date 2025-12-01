"use client";

import { DashboardHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Calendar,
  Clock,
  Loader2,
  Mail,
  Save,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NotificationPreferences {
  email: {
    marketing: boolean;
    product_updates: boolean;
    course_updates: boolean;
    enrollment_confirmations: boolean;
    certificate_issued: boolean;
    event_reminders: boolean;
    weekly_digest: boolean;
    achievement_unlocked: boolean;
  };
  push: {
    enabled: boolean;
    course_updates: boolean;
    new_content: boolean;
    discussion_replies: boolean;
    direct_messages: boolean;
    event_reminders: boolean;
  };
  in_app: {
    enabled: boolean;
    system_announcements: boolean;
    course_updates: boolean;
    discussion_activity: boolean;
    achievement_unlocked: boolean;
  };
  digest: {
    frequency: "daily" | "weekly" | "monthly" | "never";
    day_of_week: number;
    time_of_day: string;
  };
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/notification-preferences");
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.preferences);
      }
    } catch {
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        toast.success("Preferences saved");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updateEmail = (
    key: keyof NotificationPreferences["email"],
    value: boolean
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      email: { ...preferences.email, [key]: value },
    });
  };

  const updatePush = (
    key: keyof NotificationPreferences["push"],
    value: boolean
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      push: { ...preferences.push, [key]: value },
    });
  };

  const updateInApp = (
    key: keyof NotificationPreferences["in_app"],
    value: boolean
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      in_app: { ...preferences.in_app, [key]: value },
    });
  };

  const updateDigest = <K extends keyof NotificationPreferences["digest"]>(
    key: K,
    value: NotificationPreferences["digest"][K]
  ) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      digest: { ...preferences.digest, [key]: value },
    });
  };

  if (loading || !preferences) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <DashboardHeader
        title="Notification Preferences"
        subtitle="Control how and when you receive notifications"
      />

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Choose what emails you want to receive
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                key: "course_updates",
                label: "Course Updates",
                desc: "Updates to courses you're enrolled in",
              },
              {
                key: "enrollment_confirmations",
                label: "Enrollment Confirmations",
                desc: "Confirmation when you enroll in a course",
              },
              {
                key: "certificate_issued",
                label: "Certificate Issued",
                desc: "When you earn a certificate",
              },
              {
                key: "event_reminders",
                label: "Event Reminders",
                desc: "Reminders for upcoming events",
              },
              {
                key: "achievement_unlocked",
                label: "Achievement Unlocked",
                desc: "When you earn an achievement",
              },
              {
                key: "weekly_digest",
                label: "Weekly Digest",
                desc: "Summary of your progress",
              },
              {
                key: "product_updates",
                label: "Product Updates",
                desc: "New features and improvements",
              },
              {
                key: "marketing",
                label: "Marketing Emails",
                desc: "Promotions and special offers",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={
                    preferences.email[
                      item.key as keyof typeof preferences.email
                    ]
                  }
                  onCheckedChange={(v) =>
                    updateEmail(item.key as keyof typeof preferences.email, v)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Browser and mobile push notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-4">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">
                  Enable Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Master toggle for all push notifications
                </p>
              </div>
              <Switch
                checked={preferences.push.enabled}
                onCheckedChange={(v) => updatePush("enabled", v)}
              />
            </div>

            <Separator />

            {preferences.push.enabled && (
              <div className="space-y-4 pt-2">
                {[
                  { key: "course_updates", label: "Course Updates" },
                  { key: "new_content", label: "New Content Available" },
                  { key: "discussion_replies", label: "Discussion Replies" },
                  { key: "direct_messages", label: "Direct Messages" },
                  { key: "event_reminders", label: "Event Reminders" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <Label>{item.label}</Label>
                    <Switch
                      checked={
                        preferences.push[
                          item.key as keyof typeof preferences.push
                        ] as boolean
                      }
                      onCheckedChange={(v) =>
                        updatePush(item.key as keyof typeof preferences.push, v)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>In-App Notifications</CardTitle>
                <CardDescription>
                  Notifications shown within the platform
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between pb-4">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">
                  Enable In-App Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications in the notification center
                </p>
              </div>
              <Switch
                checked={preferences.in_app.enabled}
                onCheckedChange={(v) => updateInApp("enabled", v)}
              />
            </div>

            <Separator />

            {preferences.in_app.enabled && (
              <div className="space-y-4 pt-2">
                {[
                  {
                    key: "system_announcements",
                    label: "System Announcements",
                  },
                  { key: "course_updates", label: "Course Updates" },
                  { key: "discussion_activity", label: "Discussion Activity" },
                  {
                    key: "achievement_unlocked",
                    label: "Achievement Unlocked",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <Label>{item.label}</Label>
                    <Switch
                      checked={
                        preferences.in_app[
                          item.key as keyof typeof preferences.in_app
                        ] as boolean
                      }
                      onCheckedChange={(v) =>
                        updateInApp(
                          item.key as keyof typeof preferences.in_app,
                          v
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Digest Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Email Digest</CardTitle>
                <CardDescription>Receive a summary of activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={preferences.digest.frequency}
                onValueChange={(v) =>
                  updateDigest(
                    "frequency",
                    v as NotificationPreferences["digest"]["frequency"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {preferences.digest.frequency !== "never" &&
              preferences.digest.frequency !== "daily" && (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={preferences.digest.day_of_week.toString()}
                    onValueChange={(v) =>
                      updateDigest("day_of_week", parseInt(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {preferences.digest.frequency !== "never" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time of Day
                </Label>
                <input
                  type="time"
                  value={preferences.digest.time_of_day}
                  onChange={(e) => updateDigest("time_of_day", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
