"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { DashboardHeader } from "@/components/dashboard";
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
} from "@/components/ui/alert-dialog";
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
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Key,
  Loader2,
  QrCode,
  RefreshCw,
  Shield,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MFAFactor {
  id: string;
  type: "totp";
  friendly_name?: string;
  status: "verified" | "unverified";
  created_at: string;
}

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const [mfaFactors, setMfaFactors] = useState<MFAFactor[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const hasMFA = mfaFactors.some((f) => f.status === "verified");

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/mfa/factors");
      if (res.ok) {
        const data = await res.json();
        setMfaFactors(data.factors || []);
      }
    } catch {
      // MFA not configured
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollMFA = async () => {
    setEnrolling(true);
    try {
      const res = await fetch("/api/auth/mfa/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorType: "totp" }),
      });

      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setFactorId(data.factor_id);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to start 2FA enrollment");
      }
    } catch {
      toast.error("Failed to start 2FA enrollment");
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!factorId || !verificationCode) return;

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          factorId,
          code: verificationCode,
        }),
      });

      if (res.ok) {
        toast.success("Two-factor authentication enabled");
        setQrCode(null);
        setSecret(null);
        setFactorId(null);
        setVerificationCode("");
        fetchMFAStatus();
      } else {
        const error = await res.json();
        toast.error(error.error || "Invalid verification code");
      }
    } catch {
      toast.error("Failed to verify code");
    } finally {
      setVerifying(false);
    }
  };

  const handleDisableMFA = async () => {
    setDisabling(true);
    try {
      const res = await fetch("/api/auth/mfa/unenroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factorId: mfaFactors[0]?.id }),
      });

      if (res.ok) {
        toast.success("Two-factor authentication disabled");
        fetchMFAStatus();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to disable 2FA");
      }
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setDisabling(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success("Secret copied to clipboard");
    }
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
        title="Security Settings"
        subtitle="Manage your account security and two-factor authentication"
      />

      <div className="space-y-6">
        {/* 2FA Status Card */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </div>
              </div>
              <Badge variant={hasMFA ? "default" : "secondary"}>
                {hasMFA ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Enabled
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasMFA && !qrCode && (
              <>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication adds an additional layer of security
                  to your account by requiring a code from your authenticator
                  app when signing in.
                </p>
                <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    We strongly recommend enabling two-factor authentication for
                    enhanced account security.
                  </p>
                </div>
                <Button onClick={handleEnrollMFA} disabled={enrolling}>
                  {enrolling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Smartphone className="w-4 h-4 mr-2" />
                  )}
                  Enable Two-Factor Authentication
                </Button>
              </>
            )}

            {qrCode && secret && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* QR Code */}
                  <div className="flex flex-col items-center p-4 border rounded-lg bg-white">
                    <QrCode className="w-6 h-6 mb-2 text-muted-foreground" />
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Scan with your authenticator app
                    </p>
                  </div>

                  {/* Manual Entry */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Can&apos;t scan?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enter this secret key manually in your authenticator
                        app:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                          {secret}
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copySecret}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">
                        Verification Code
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="verificationCode"
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          maxLength={6}
                          className="font-mono text-lg tracking-widest"
                        />
                        <Button
                          onClick={handleVerifyMFA}
                          disabled={verificationCode.length !== 6 || verifying}
                        >
                          {verifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setQrCode(null);
                    setSecret(null);
                    setFactorId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}

            {hasMFA && (
              <>
                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Two-factor authentication is enabled
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your account is protected with an additional layer of
                      security.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={fetchMFAStatus}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Disable 2FA</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Disable Two-Factor Authentication?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the extra layer of security from your
                          account. You can re-enable it at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDisableMFA}
                          disabled={disabling}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {disabling ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : null}
                          Disable
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Devices currently signed in to your account
                  </CardDescription>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sign out all devices
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Sign out of all devices?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all devices including this one.
                      You will need to sign in again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await fetch("/api/auth/signout-all", {
                            method: "POST",
                          });
                          window.location.href = "/auth/login";
                        } catch {
                          toast.error("Failed to sign out");
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sign out all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Current Session */}
            <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email} • Active now
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: Just now
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-300"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  This device
                </Badge>
              </div>
            </div>

            {/* Session Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your session is secured with{" "}
                {hasMFA
                  ? "two-factor authentication"
                  : "password authentication"}
                .{!hasMFA && " Enable 2FA above for enhanced security."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
