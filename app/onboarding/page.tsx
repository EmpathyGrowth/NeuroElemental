'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';
import { Loader2 } from 'lucide-react';

import {
  OnboardingWizard,
  useOnboardingWizard,
  StepWelcome,
  StepRole,
  StepProfile,
  StepAssessment,
  StepComplete,
  type UserRole,
  type OnboardingStep,
} from '@/components/onboarding';

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'role', title: 'Role' },
  { id: 'profile', title: 'Profile' },
  { id: 'assessment', title: 'Assessment' },
  { id: 'complete', title: 'Complete' },
];

interface OnboardingData {
  role: UserRole;
  displayName: string;
  bio: string;
  avatarUrl?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refetchProfile } = useAuth();
  const { currentStep, nextStep, prevStep, goToStep } = useOnboardingWizard(ONBOARDING_STEPS.length);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    role: 'student',
    displayName: profile?.full_name || user?.user_metadata?.full_name || '',
    bio: '',
    avatarUrl: profile?.avatar_url || '',
  });

  /**
   * Save the current step to the server for resume functionality
   */
  const persistStep = useCallback(async (stepId: string) => {
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepId }),
      });
    } catch (error) {
      // Non-critical - log but don't show error to user
      logger.error('Failed to persist onboarding step', error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  /**
   * Mark onboarding as complete
   */
  const markComplete = useCallback(async () => {
    try {
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complete: true }),
      });
    } catch (error) {
      logger.error('Failed to mark onboarding complete', error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  /**
   * Load saved onboarding state on mount
   */
  useEffect(() => {
    const loadOnboardingState = async () => {
      try {
        const response = await fetch('/api/onboarding');
        if (response.ok) {
          const data = await response.json();

          // If already completed, redirect to dashboard
          if (data.isCompleted) {
            router.replace('/dashboard');
            return;
          }

          // Resume from saved step
          if (data.currentStep) {
            const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === data.currentStep);
            if (stepIndex > 0) {
              goToStep(stepIndex);
            }
          }
        }
      } catch (error) {
        logger.error('Failed to load onboarding state', error instanceof Error ? error : new Error(String(error)));
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      loadOnboardingState();
    } else {
      setInitialLoading(false);
    }
  }, [user, router, goToStep]);

  const handleRoleChange = (role: UserRole) => {
    setOnboardingData((prev) => ({ ...prev, role }));
  };

  const handleDisplayNameChange = (displayName: string) => {
    setOnboardingData((prev) => ({ ...prev, displayName }));
  };

  const handleBioChange = (bio: string) => {
    setOnboardingData((prev) => ({ ...prev, bio }));
  };

  const saveOnboardingData = async () => {
    if (!user) return false;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          role: onboardingData.role,
          full_name: onboardingData.displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refetchProfile();
      return true;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error saving onboarding data:', err);
      toast.error('Failed to save profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Wrapper for nextStep that also persists the new step
   */
  const handleNextStep = useCallback(async (targetStepIndex: number) => {
    const targetStepId = ONBOARDING_STEPS[targetStepIndex]?.id;
    if (targetStepId) {
      await persistStep(targetStepId);
    }
    nextStep();
  }, [nextStep, persistStep]);

  const handleAssessmentContinue = async () => {
    const success = await saveOnboardingData();
    if (success) {
      await persistStep('assessment');
      nextStep();
    }
  };

  const handleTakeAssessment = async () => {
    const success = await saveOnboardingData();
    if (success) {
      await persistStep('assessment');
      router.push('/assessment');
    }
  };

  const handleSkipAssessment = async () => {
    const success = await saveOnboardingData();
    if (success) {
      await persistStep('complete');
      nextStep();
    }
  };

  const handleGoToDashboard = async () => {
    // Mark onboarding as complete before navigating
    await markComplete();

    const { role } = onboardingData;
    switch (role) {
      case 'student':
        router.push('/dashboard/student');
        break;
      case 'instructor':
        router.push('/dashboard/instructor');
        break;
      case 'business':
        router.push('/dashboard/business');
        break;
      case 'school':
        router.push('/dashboard/school');
        break;
      default:
        router.push('/dashboard');
    }
  };

  const renderStep = () => {
    // Show loading during initial state restore
    if (initialLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Saving your preferences...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <StepWelcome
            userName={onboardingData.displayName || user?.user_metadata?.full_name}
            onContinue={() => handleNextStep(1)}
          />
        );
      case 1:
        return (
          <StepRole
            selectedRole={onboardingData.role}
            onRoleChange={handleRoleChange}
            onContinue={() => handleNextStep(2)}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <StepProfile
            displayName={onboardingData.displayName}
            bio={onboardingData.bio}
            avatarUrl={onboardingData.avatarUrl}
            onDisplayNameChange={handleDisplayNameChange}
            onBioChange={handleBioChange}
            onContinue={handleAssessmentContinue}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <StepAssessment
            onTakeAssessment={handleTakeAssessment}
            onSkip={handleSkipAssessment}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <StepComplete
            userName={onboardingData.displayName}
            onGoToDashboard={handleGoToDashboard}
            onTakeAssessment={handleTakeAssessment}
            hasCompletedAssessment={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Card className="glass-premium border-primary/10 shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <OnboardingWizard
              steps={ONBOARDING_STEPS}
              currentStep={currentStep}
              onStepChange={goToStep}
            >
              {renderStep()}
            </OnboardingWizard>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
