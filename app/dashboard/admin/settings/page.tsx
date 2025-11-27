'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  DollarSign,
  Mail,
  Palette,
  Save,
  Settings,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('NeuroElemental');
  const [siteDescription, setSiteDescription] = useState('Energy management for neurodivergent brains');
  const [contactEmail, setContactEmail] = useState('support@neuroelemental.com');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved! (In production, this would save to database)');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure global platform settings
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Email service and notification settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send transactional emails (enrollments, registrations)
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Email Service (Resend)</Label>
              <Input
                placeholder="API Key"
                type="password"
                value="re_••••••••"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Configure in environment variables
              </p>
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

        {/* Security Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Platform security and access control</CardDescription>
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
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
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

        {/* Branding */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Logo, colors, and visual identity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input id="logo-url" placeholder="/logo.svg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon-url">Favicon URL</Label>
              <Input id="favicon-url" placeholder="/favicon.ico" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input id="primary-color" value="#667eea" disabled className="font-mono" />
                <div className="w-12 h-10 rounded border" style={{ backgroundColor: '#667eea' }} />
              </div>
              <p className="text-xs text-muted-foreground">
                Configured in Tailwind CSS theme
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-[#764BA2]">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
