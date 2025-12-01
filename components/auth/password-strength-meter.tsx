'use client';

import { cn } from '@/lib/utils';
import { PASSWORD_REQUIREMENTS } from '@/lib/validation/schemas';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

/**
 * Evaluates password strength and returns requirement status
 */
function evaluatePassword(password: string): {
  requirements: PasswordRequirement[];
  strength: 'empty' | 'weak' | 'fair' | 'good' | 'strong';
  score: number;
} {
  const requirements: PasswordRequirement[] = [
    {
      label: `${PASSWORD_REQUIREMENTS.minLength}+ characters`,
      met: password.length >= PASSWORD_REQUIREMENTS.minLength,
    },
    {
      label: 'Uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Number (0-9)',
      met: /[0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const score = metCount;

  let strength: 'empty' | 'weak' | 'fair' | 'good' | 'strong';
  if (password.length === 0) {
    strength = 'empty';
  } else if (metCount <= 1) {
    strength = 'weak';
  } else if (metCount === 2) {
    strength = 'fair';
  } else if (metCount === 3) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return { requirements, strength, score };
}

/**
 * Password strength meter with visual feedback
 * Shows progress bars and requirement checklist
 */
export function PasswordStrengthMeter({
  password,
  className,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { requirements, strength, score } = evaluatePassword(password);

  const strengthColors = {
    empty: 'bg-muted',
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  const strengthLabels = {
    empty: '',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bars */}
      <div className="space-y-1">
        <div className="flex gap-1 h-1.5">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                'flex-1 rounded-full transition-colors duration-200',
                index < score ? strengthColors[strength] : 'bg-muted'
              )}
            />
          ))}
        </div>
        {strength !== 'empty' && (
          <p
            className={cn(
              'text-xs font-medium',
              strength === 'weak' && 'text-red-500',
              strength === 'fair' && 'text-yellow-600',
              strength === 'good' && 'text-blue-500',
              strength === 'strong' && 'text-green-500'
            )}
          >
            {strengthLabels[strength]}
          </p>
        )}
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          {requirements.map((requirement, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors duration-200',
                requirement.met ? 'text-green-600' : 'text-muted-foreground'
              )}
            >
              {requirement.met ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span>{requirement.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact password strength indicator (bars only)
 */
export function PasswordStrengthBars({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  return (
    <PasswordStrengthMeter
      password={password}
      className={className}
      showRequirements={false}
    />
  );
}
