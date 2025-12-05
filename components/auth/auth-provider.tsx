'use client';

import { getUserProfile } from '@/lib/auth/supabase';
import { logger } from '@/lib/logging';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'registered' | 'student' | 'instructor' | 'business' | 'school' | 'admin';
  instructor_status: 'pending' | 'approved' | 'revoked' | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile as UserProfile | null);
    } catch (error) {
      logger.error('Error in fetchProfile:', error as Error);
      setProfile(null);
    }
  };

  const refetchProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user]);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session from cookies
    const initializeAuth = async () => {
      try {
        // First get session from cookies (fast, local)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Session exists in cookies, validate with server
          const { data: { user }, error } = await supabase.auth.getUser();

          if (error || !user) {
            // Session cookie exists but is invalid/expired
            setUser(null);
            setProfile(null);
          } else {
            setUser(user);
            await fetchProfile(user.id);
          }
        } else {
          // No session in cookies
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        logger.error('Error initializing auth:', error as Error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Safety timeout: forced loading=false after 5 seconds to prevent infinite spinner
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          logger.warn('AuthProvider initialization timed out - forcing loading=false');
          return false;
        }
        return prev;
      });
    }, 5000);

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event, !!session?.user);

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      refetchProfile,
    }),
    [user, profile, loading, refetchProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

