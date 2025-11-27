'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { updatePassword, signOut } from '@/lib/auth/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Loader2,
  Lock,
  Bell,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/** Delay in ms before hiding password success message */
const PASSWORD_SUCCESS_DELAY = 5000;

export default function SettingsPage() {
  const { } = useAuth();
  const router = useRouter();
  const passwordSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [_currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (passwordSuccessTimeoutRef.current) {
        clearTimeout(passwordSuccessTimeoutRef.current);
      }
    };
  }, []);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Data export/deletion
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setPreferencesLoading(true);
    try {
      const res = await fetch('/api/user/preferences');
      if (res.ok) {
        const data = await res.json();
        const prefs = data.preferences;
        setEmailNotifications(true); // Master toggle
        setCourseUpdates(prefs.course_updates ?? true);
        setEventReminders(prefs.session_reminders ?? true);
        setMarketingEmails(prefs.marketing ?? false);
      }
    } catch (_error) {
      // Silently fail loading preferences
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_updates: emailNotifications && courseUpdates,
          session_reminders: emailNotifications && eventReminders,
          marketing: emailNotifications && marketingEmails,
          payment_receipts: true, // Always receive payment receipts
        }),
      });

      if (res.ok) {
        toast.success('Preferences saved', {
          description: 'Your notification preferences have been updated.',
        });
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (_error) {
      toast.error('Error', {
        description: 'Failed to save preferences. Please try again.',
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        passwordSuccessTimeoutRef.current = setTimeout(() => setPasswordSuccess(false), PASSWORD_SUCCESS_DELAY);
      }
    } catch (_error) {
      setPasswordError('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDownloadData = async () => {
    setExportLoading(true);
    try {
      // Request data export
      const res = await fetch('/api/user/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Export Requested', {
          description: 'Your data export has been initiated. You will receive an email when it\'s ready.',
        });

        // If there's a direct download URL, use it
        if (data.downloadUrl) {
          window.location.href = data.downloadUrl;
        }
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Export failed');
      }
    } catch (error) {
      toast.error('Export Failed', {
        description: error instanceof Error ? error.message : 'Failed to export data. Please try again.',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Request account deletion (sends confirmation email)
      const res = await fetch('/api/user/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deletion_type: 'account',
          requested_reason: 'User requested account deletion from settings',
        }),
      });

      if (res.ok) {
        toast.success('Deletion Request Submitted', {
          description: 'Please check your email to confirm account deletion.',
        });
        // Sign out after requesting deletion
        await signOut();
        router.push('/');
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Deletion request failed');
      }
    } catch (error) {
      toast.error('Request Failed', {
        description: error instanceof Error ? error.message : 'Failed to request account deletion.',
      });
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Password Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-lg">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">Password updated successfully!</p>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{passwordError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  disabled={passwordLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {preferencesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="courseUpdates">Course Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      New lessons, content updates, and announcements
                    </p>
                  </div>
                  <Switch
                    id="courseUpdates"
                    checked={courseUpdates}
                    onCheckedChange={setCourseUpdates}
                    disabled={!emailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="eventReminders">Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders for upcoming events you're registered for
                    </p>
                  </div>
                  <Switch
                    id="eventReminders"
                    checked={eventReminders}
                    onCheckedChange={setEventReminders}
                    disabled={!emailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      New courses, special offers, and community updates
                    </p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    disabled={!emailNotifications}
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                >
                  {savingPreferences && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control your data and privacy settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDownloadData}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download My Data
            </Button>
            <p className="text-xs text-muted-foreground">
              Export all your data including assessments, course progress, and account information (GDPR compliant)
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass-card border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start" disabled={deleteLoading}>
                  {deleteLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Assessment results and history</li>
                      <li>Course enrollments and progress</li>
                      <li>Certificates and achievements</li>
                      <li>Event registrations</li>
                      <li>All personal information</li>
                    </ul>
                    <p className="mt-3 font-medium">
                      A confirmation email will be sent to verify this request.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <p className="text-xs text-muted-foreground">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
