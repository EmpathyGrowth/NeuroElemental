'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { updatePassword } from '@/lib/auth/supabase';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { PASSWORD_REQUIREMENTS } from '@/lib/validation/schemas';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Check if we have the necessary hash fragments from Supabase
    // Supabase sends the token in the URL hash
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      // Also check for error in hash
      if (hash.includes('error')) {
        setIsValidToken(false);
        setError('This password reset link has expired or is invalid. Please request a new one.');
      }
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < PASSWORD_REQUIREMENTS.minLength) {
      return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`;
    }
    if (PASSWORD_REQUIREMENTS.requiresUppercase && !/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (PASSWORD_REQUIREMENTS.requiresLowercase && !/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (PASSWORD_REQUIREMENTS.requiresNumber && !/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (_error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              NeuroElemental
            </h1>
            <p className="text-muted-foreground">
              Energy management for your neurodivergent brain
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-center">Invalid or Expired Link</CardTitle>
              <CardDescription className="text-center">
                This password reset link has expired or is invalid.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Password reset links are only valid for a limited time. Please request a new link to reset your password.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">
                  Request New Link
                </Link>
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to sign in
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            NeuroElemental
          </h1>
          <p className="text-muted-foreground">
            Energy management for your neurodivergent brain
          </p>
        </div>

        <Card>
          <CardHeader>
            {success ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-center">Password Updated!</CardTitle>
                <CardDescription className="text-center">
                  Your password has been successfully reset. Redirecting you to sign in...
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center">Reset your password</CardTitle>
                <CardDescription className="text-center">
                  Enter your new password below
                </CardDescription>
              </>
            )}
          </CardHeader>

          {!success && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={password} className="mt-2" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
              </form>
            </CardContent>
          )}

          {success && (
            <CardContent>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </CardContent>
          )}

          <CardFooter className="flex justify-center">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
