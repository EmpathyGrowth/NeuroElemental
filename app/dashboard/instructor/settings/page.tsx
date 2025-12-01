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
import { Input } from "@/components/ui/input";
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
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Loader2,
  Mail,
  Save,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface InstructorSettings {
  // Teaching preferences
  default_course_visibility: "public" | "private" | "enrolled_only";
  auto_approve_enrollments: boolean;
  max_students_per_course: number;
  // Communication
  email_on_new_enrollment: boolean;
  email_on_review: boolean;
  email_on_question: boolean;
  student_messaging_enabled: boolean;
  // Schedule
  available_days: string[];
  office_hours_enabled: boolean;
  office_hours_start: string;
  office_hours_end: string;
  timezone: string;
  // Payout (display only)
  payout_method: "stripe" | "paypal" | "bank_transfer" | "none";
  payout_email: string;
}

const defaultSettings: InstructorSettings = {
  default_course_visibility: "public",
  auto_approve_enrollments: true,
  max_students_per_course: 100,
  email_on_new_enrollment: true,
  email_on_review: true,
  email_on_question: true,
  student_messaging_enabled: true,
  available_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  office_hours_enabled: false,
  office_hours_start: "09:00",
  office_hours_end: "17:00",
  timezone: "America/New_York",
  payout_method: "none",
  payout_email: "",
};

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "UTC", label: "UTC" },
];

export default function InstructorSettingsPage() {
  const [settings, setSettings] = useState<InstructorSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load instructor settings from API
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/instructor/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...defaultSettings, ...data.settings });
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/instructor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof InstructorSettings>(
    key: K,
    value: InstructorSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter((d) => d !== day)
        : [...prev.available_days, day],
    }));
  };

  if (loading) {
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
        title="Instructor Settings"
        subtitle="Manage your teaching preferences and schedule"
      />

      <div className="space-y-6">
        {/* Quick Links */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Access your general account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/settings">
                  Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/settings/security">
                  Security
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/profile">
                  Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Course Defaults */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Course Defaults</CardTitle>
                <CardDescription>
                  Default settings for new courses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Course Visibility</Label>
              <Select
                value={settings.default_course_visibility}
                onValueChange={(v) =>
                  updateSetting(
                    "default_course_visibility",
                    v as InstructorSettings["default_course_visibility"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    Public - Anyone can view
                  </SelectItem>
                  <SelectItem value="enrolled_only">
                    Enrolled Only - Students must enroll
                  </SelectItem>
                  <SelectItem value="private">Private - Invite only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Approve Enrollments</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve new student enrollments
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_enrollments}
                onCheckedChange={(v) =>
                  updateSetting("auto_approve_enrollments", v)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students per Course</Label>
              <Input
                id="maxStudents"
                type="number"
                value={settings.max_students_per_course}
                onChange={(e) =>
                  updateSetting(
                    "max_students_per_course",
                    parseInt(e.target.value) || 100
                  )
                }
                min={1}
                max={10000}
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Communication</CardTitle>
                <CardDescription>
                  Email notifications and student messaging
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Enrollment Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a student enrolls
                </p>
              </div>
              <Switch
                checked={settings.email_on_new_enrollment}
                onCheckedChange={(v) =>
                  updateSetting("email_on_new_enrollment", v)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Review Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you receive a review
                </p>
              </div>
              <Switch
                checked={settings.email_on_review}
                onCheckedChange={(v) => updateSetting("email_on_review", v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Question Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a student asks a question
                </p>
              </div>
              <Switch
                checked={settings.email_on_question}
                onCheckedChange={(v) => updateSetting("email_on_question", v)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Student Messaging</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to send you direct messages
                </p>
              </div>
              <Switch
                checked={settings.student_messaging_enabled}
                onCheckedChange={(v) =>
                  updateSetting("student_messaging_enabled", v)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Schedule & Availability</CardTitle>
                <CardDescription>
                  Set your teaching schedule and office hours
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(v) => updateSetting("timezone", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <Button
                    key={day.value}
                    variant={
                      settings.available_days.includes(day.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Office Hours
                </Label>
                <p className="text-sm text-muted-foreground">
                  Set specific hours when students can reach you
                </p>
              </div>
              <Switch
                checked={settings.office_hours_enabled}
                onCheckedChange={(v) =>
                  updateSetting("office_hours_enabled", v)
                }
              />
            </div>

            {settings.office_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="officeStart">Start Time</Label>
                  <Input
                    id="officeStart"
                    type="time"
                    value={settings.office_hours_start}
                    onChange={(e) =>
                      updateSetting("office_hours_start", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="officeEnd">End Time</Label>
                  <Input
                    id="officeEnd"
                    type="time"
                    value={settings.office_hours_end}
                    onChange={(e) =>
                      updateSetting("office_hours_end", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Payout Settings</CardTitle>
                <CardDescription>
                  Manage how you receive payments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payout Method</Label>
              <Select
                value={settings.payout_method}
                onValueChange={(v) =>
                  updateSetting(
                    "payout_method",
                    v as InstructorSettings["payout_method"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Configured</SelectItem>
                  <SelectItem value="stripe">Stripe Connect</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.payout_method !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="payoutEmail">Payout Email</Label>
                <Input
                  id="payoutEmail"
                  type="email"
                  value={settings.payout_email}
                  onChange={(e) =>
                    updateSetting("payout_email", e.target.value)
                  }
                  placeholder="your-email@example.com"
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Payout configuration requires verification. Contact support for
              setup assistance.
            </p>
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
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
