"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  Globe,
  Loader2,
  Mail,
  Palette,
  RefreshCw,
  Save,
  Settings,
  Shield,
  ToggleLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PlatformSettings {
  // General
  site_name: string;
  site_description: string;
  contact_email: string;
  support_url: string;
  // Email
  notifications_enabled: boolean;
  from_email: string;
  from_name: string;
  reply_to: string;
  // Security
  maintenance_mode: boolean;
  allow_registrations: boolean;
  require_email_verification: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  // Branding
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  // Features
  enable_courses: boolean;
  enable_events: boolean;
  enable_assessments: boolean;
  enable_certificates: boolean;
  enable_gamification: boolean;
  enable_organizations: boolean;
}

const defaultSettings: PlatformSettings = {
  site_name: "NeuroElemental",
  site_description: "Energy management for neurodivergent brains",
  contact_email: "support@neuroelemental.com",
  support_url: "https://neuroelemental.com/support",
  notifications_enabled: true,
  from_email: "noreply@neuroelemental.com",
  from_name: "NeuroElemental",
  reply_to: "support@neuroelemental.com",
  maintenance_mode: false,
  allow_registrations: true,
  require_email_verification: true,
  session_timeout_minutes: 1440,
  max_login_attempts: 5,
  logo_url: "/logo.svg",
  favicon_url: "/favicon.ico",
  primary_color: "#667eea",
  secondary_color: "#764BA2",
  enable_courses: true,
  enable_events: true,
  enable_assessments: true,
  enable_certificates: true,
  enable_gamification: true,
  enable_organizations: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        toast.success("Settings saved successfully");
        setHasChanges(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell>
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Platform Settings"
        description="Configure global platform settings"
        className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 px-6 py-4 border-b mb-6"
        actions={
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-600"
              >
                Unsaved changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              disabled={saving}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-gradient-to-r from-primary to-[#764BA2]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4 hidden sm:inline" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4 hidden sm:inline" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:inline" />
            Security
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4 hidden sm:inline" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <ToggleLeft className="h-4 w-4 hidden sm:inline" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Basic platform configuration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.site_name}
                  onChange={(e) => updateSetting("site_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.site_description}
                  onChange={(e) =>
                    updateSetting("site_description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) =>
                      updateSetting("contact_email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportUrl">Support URL</Label>
                  <Input
                    id="supportUrl"
                    value={settings.support_url}
                    onChange={(e) =>
                      updateSetting("support_url", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>
                    Email service and notification settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for all transactional emails
                  </p>
                </div>
                <Switch
                  checked={settings.notifications_enabled}
                  onCheckedChange={(v) =>
                    updateSetting("notifications_enabled", v)
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    value={settings.from_email}
                    onChange={(e) =>
                      updateSetting("from_email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.from_name}
                    onChange={(e) => updateSetting("from_name", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To Email</Label>
                <Input
                  id="replyTo"
                  value={settings.reply_to}
                  onChange={(e) => updateSetting("reply_to", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Payment Configuration</CardTitle>
                  <CardDescription>Stripe integration settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stripe Publishable Key</Label>
                <Input
                  placeholder="pk_test_..."
                  type="password"
                  value="pk_••••••••"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Stripe Secret Key</Label>
                <Input
                  placeholder="sk_test_..."
                  type="password"
                  value="sk_••••••••"
                  disabled
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Configure Stripe keys in environment variables for security
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Platform security and access control
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable public access to the platform
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(v) => updateSetting("maintenance_mode", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register accounts
                  </p>
                </div>
                <Switch
                  checked={settings.allow_registrations}
                  onCheckedChange={(v) =>
                    updateSetting("allow_registrations", v)
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    New accounts must verify their email
                  </p>
                </div>
                <Switch
                  checked={settings.require_email_verification}
                  onCheckedChange={(v) =>
                    updateSetting("require_email_verification", v)
                  }
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.session_timeout_minutes}
                    onChange={(e) =>
                      updateSetting(
                        "session_timeout_minutes",
                        parseInt(e.target.value) || 1440
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.max_login_attempts}
                    onChange={(e) =>
                      updateSetting(
                        "max_login_attempts",
                        parseInt(e.target.value) || 5
                      )
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>OAuth Providers</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Google OAuth</span>
                    <Badge variant="outline">Configured</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">GitHub OAuth</span>
                    <Badge variant="outline">Configured</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure OAuth in Supabase dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>
                    Logo, colors, and visual identity
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={settings.logo_url}
                    onChange={(e) => updateSetting("logo_url", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon-url">Favicon URL</Label>
                  <Input
                    id="favicon-url"
                    value={settings.favicon_url}
                    onChange={(e) =>
                      updateSetting("favicon_url", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      value={settings.primary_color}
                      onChange={(e) =>
                        updateSetting("primary_color", e.target.value)
                      }
                      className="font-mono"
                    />
                    <div
                      className="w-12 h-10 rounded border flex-shrink-0"
                      style={{ backgroundColor: settings.primary_color }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      value={settings.secondary_color}
                      onChange={(e) =>
                        updateSetting("secondary_color", e.target.value)
                      }
                      className="font-mono"
                    />
                    <div
                      className="w-12 h-10 rounded border flex-shrink-0"
                      style={{ backgroundColor: settings.secondary_color }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ToggleLeft className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Enable or disable platform features
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    key: "enable_courses",
                    label: "Courses",
                    description: "Online courses and lessons",
                  },
                  {
                    key: "enable_events",
                    label: "Events",
                    description: "Live events and workshops",
                  },
                  {
                    key: "enable_assessments",
                    label: "Assessments",
                    description: "Personality assessments",
                  },
                  {
                    key: "enable_certificates",
                    label: "Certificates",
                    description: "Course completion certificates",
                  },
                  {
                    key: "enable_gamification",
                    label: "Gamification",
                    description: "Achievements and badges",
                  },
                  {
                    key: "enable_organizations",
                    label: "Organizations",
                    description: "B2B team features",
                  },
                ].map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-0.5">
                      <Label className="font-medium">{feature.label}</Label>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        settings[
                          feature.key as keyof PlatformSettings
                        ] as boolean
                      }
                      onCheckedChange={(v) =>
                        updateSetting(feature.key as keyof PlatformSettings, v)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageShell>
  );
}
