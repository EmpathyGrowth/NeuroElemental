'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, CheckCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';

type VerificationState = 'verifying' | 'success' | 'error' | 'already_verified';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [state, setState] = useState<VerificationState>('verifying');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const handleEmailVerification = async () => {
      const supabase = createClient();
      // Check for hash parameters from Supabase email confirmation
      const hash = window.location.hash;

      if (hash && hash.includes('access_token')) {
        // Email was successfully verified via the link
        setState('success');

        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
        return;
      }

      if (hash && hash.includes('error')) {
        // Extract error from hash
        const params = new URLSearchParams(hash.substring(1));
        const errorDescription = params.get('error_description');
        setError(errorDescription || 'Verification failed. The link may have expired.');
        setState('error');
        return;
      }

      // Check if user is already logged in and verified
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || null);

        if (user.email_confirmed_at) {
          setState('already_verified');
        } else {
          // User exists but not verified - show waiting state
          setState('error');
          setError('Please check your email for the verification link.');
        }
      } else {
        // No user session and no verification token
        setState('error');
        setError('No verification token found. Please request a new verification email.');
      }
    };

    handleEmailVerification();
  }, [router]);

  const handleResendVerification = async () => {
    if (!email) return;

    setResending(true);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setResendSuccess(true);
      }
    } catch (_err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

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
          {/* Verifying State */}
          {state === 'verifying' && (
            <>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                </div>
                <CardTitle className="text-center">Verifying your email</CardTitle>
                <CardDescription className="text-center">
                  Please wait while we verify your email address...
                </CardDescription>
              </CardHeader>
            </>
          )}

          {/* Success State */}
          {state === 'success' && (
            <>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-center">Email Verified!</CardTitle>
                <CardDescription className="text-center">
                  Your email has been successfully verified.
                  {email && <> Welcome, <strong>{email}</strong>!</>}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Redirecting you to your dashboard...
                </p>
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </>
          )}

          {/* Already Verified State */}
          {state === 'already_verified' && (
            <>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-center">Already Verified</CardTitle>
                <CardDescription className="text-center">
                  Your email is already verified.
                  {email && <> You're signed in as <strong>{email}</strong>.</>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </>
          )}

          {/* Error State */}
          {state === 'error' && (
            <>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <CardTitle className="text-center">Verification Required</CardTitle>
                <CardDescription className="text-center">
                  {error || 'Please verify your email address to continue.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resendSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">Verification email sent! Check your inbox.</p>
                  </div>
                )}

                {email && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Didn't receive the email? Check your spam folder or request a new one.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleResendVerification}
                      disabled={resending}
                    >
                      {resending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Resend Verification Email
                    </Button>
                  </div>
                )}

                {!email && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">Please sign in to request a new verification email.</p>
                  </div>
                )}
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-center">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
