// Onboarding components barrel export
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronRight, User, GraduationCap, Briefcase, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserRole = 'student' | 'instructor' | 'business' | 'school';

export interface OnboardingStep {
  id: string;
  title: string;
}

// Hook for managing wizard state
export function useOnboardingWizard(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  return { currentStep, nextStep, prevStep, goToStep };
}

// Wizard container component
export function OnboardingWizard({
  steps,
  currentStep,
  onStepChange,
  children,
}: {
  steps: OnboardingStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => index < currentStep && onStepChange(index)}
              disabled={index > currentStep}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                index < currentStep && 'bg-primary text-primary-foreground cursor-pointer',
                index === currentStep && 'bg-primary text-primary-foreground',
                index > currentStep && 'bg-muted text-muted-foreground'
              )}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-1 mx-1',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">{children}</div>
    </div>
  );
}

// Step components
export function StepWelcome({
  userName,
  onContinue,
}: {
  userName?: string;
  onContinue: () => void;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          Welcome{userName ? `, ${userName}` : ''}!
        </h2>
        <p className="text-muted-foreground">
          Let's set up your profile to personalize your experience.
        </p>
      </div>
      <Button onClick={onContinue} className="gap-2">
        Get Started <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

const roleOptions = [
  { value: 'student' as UserRole, label: 'Student', description: 'I want to learn and grow', icon: GraduationCap },
  { value: 'instructor' as UserRole, label: 'Instructor', description: 'I want to teach and share knowledge', icon: User },
  { value: 'business' as UserRole, label: 'Business', description: 'I represent a company', icon: Briefcase },
  { value: 'school' as UserRole, label: 'School', description: 'I represent an educational institution', icon: Building2 },
];

export function StepRole({
  selectedRole,
  onRoleChange,
  onContinue,
  onBack,
}: {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What describes you best?</h2>
        <p className="text-muted-foreground">This helps us personalize your experience.</p>
      </div>

      <RadioGroup
        value={selectedRole}
        onValueChange={(value) => onRoleChange(value as UserRole)}
        className="grid gap-3 md:grid-cols-2"
      >
        {roleOptions.map((option) => (
          <Label
            key={option.value}
            htmlFor={option.value}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
              selectedRole === option.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <RadioGroupItem value={option.value} id={option.value} />
            <option.icon className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </div>
          </Label>
        ))}
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
}

export function StepProfile({
  displayName,
  bio,
  avatarUrl: _avatarUrl,
  onDisplayNameChange,
  onBioChange,
  onContinue,
  onBack,
}: {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  onDisplayNameChange: (name: string) => void;
  onBioChange: (bio: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Complete your profile</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio (optional)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={!displayName.trim()}>
          Continue
        </Button>
      </div>
    </div>
  );
}

export function StepAssessment({
  onTakeAssessment,
  onSkip,
  onBack,
}: {
  onTakeAssessment: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Take the Assessment</h2>
        <p className="text-muted-foreground">
          Discover your learning style and get personalized recommendations.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onTakeAssessment} className="w-full">
          Start Assessment
        </Button>
        <Button variant="ghost" onClick={onSkip} className="w-full">
          Skip for now
        </Button>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

export function StepComplete({
  userName,
  onGoToDashboard,
  onTakeAssessment,
  hasCompletedAssessment,
}: {
  userName: string;
  onGoToDashboard: () => void;
  onTakeAssessment: () => void;
  hasCompletedAssessment: boolean;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">You're all set, {userName}!</h2>
        <p className="text-muted-foreground">
          Your profile has been created. Start exploring!
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onGoToDashboard} className="w-full">
          Go to Dashboard
        </Button>
        {!hasCompletedAssessment && (
          <Button variant="outline" onClick={onTakeAssessment} className="w-full">
            Take Assessment Now
          </Button>
        )}
      </div>
    </div>
  );
}
