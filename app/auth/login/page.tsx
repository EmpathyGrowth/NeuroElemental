'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { LoginForm } from '@/components/auth/login-form';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    // Use ref to prevent multiple redirects
    if (!loading && user && !hasRedirected.current) {
      hasRedirected.current = true;
      // Use window.location for a hard redirect to ensure it works
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already logged in, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">You're already logged in. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            NeuroElemental
          </h1>
          <p className="text-muted-foreground">
            Energy management for your neurodivergent brain
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
