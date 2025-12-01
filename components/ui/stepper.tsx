'use client';

import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import * as React from 'react';

interface Step {
  id: string | number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'numbered' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onStepClick?: (stepIndex: number) => void;
  showLabels?: boolean;
  loading?: boolean;
}

const sizeConfig = {
  sm: {
    indicator: 'h-6 w-6 text-xs',
    connector: 'h-0.5',
    connectorVertical: 'w-0.5 h-8',
    title: 'text-xs',
    description: 'text-xs',
  },
  md: {
    indicator: 'h-8 w-8 text-sm',
    connector: 'h-0.5',
    connectorVertical: 'w-0.5 h-12',
    title: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    indicator: 'h-10 w-10 text-base',
    connector: 'h-1',
    connectorVertical: 'w-1 h-16',
    title: 'text-base',
    description: 'text-sm',
  },
};

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className,
  onStepClick,
  showLabels = true,
  loading = false,
}: StepperProps) {
  const config = sizeConfig[size];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const renderIndicator = (step: Step, index: number) => {
    const status = getStepStatus(index);
    const isClickable = onStepClick && index <= currentStep;

    const baseStyles = cn(
      'relative flex items-center justify-center rounded-full border-2 transition-all duration-300',
      config.indicator,
      isClickable && 'cursor-pointer hover:scale-110'
    );

    const statusStyles = {
      completed: 'bg-green-500 border-green-500 text-white',
      current: loading
        ? 'bg-primary/20 border-primary text-primary'
        : 'bg-primary border-primary text-primary-foreground',
      upcoming: 'bg-muted border-muted-foreground/30 text-muted-foreground',
    };

    const handleClick = () => {
      if (isClickable) {
        onStepClick(index);
      }
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!isClickable}
        className={cn(baseStyles, statusStyles[status])}
        aria-current={status === 'current' ? 'step' : undefined}
      >
        {status === 'completed' ? (
          <Check className="h-4 w-4" />
        ) : status === 'current' && loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : variant === 'numbered' ? (
          index + 1
        ) : variant === 'dots' ? (
          <span className="h-2 w-2 rounded-full bg-current" />
        ) : (
          step.icon || index + 1
        )}
      </button>
    );
  };

  const renderConnector = (index: number) => {
    const status = getStepStatus(index);
    const isCompleted = status === 'completed';

    if (orientation === 'horizontal') {
      return (
        <div
          className={cn(
            'flex-1 mx-2 rounded-full transition-all duration-500',
            config.connector,
            isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
          )}
        />
      );
    }

    return (
      <div
        className={cn(
          'mx-auto rounded-full transition-all duration-500',
          config.connectorVertical,
          isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
        )}
      />
    );
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col', className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex">
            <div className="flex flex-col items-center">
              {renderIndicator(step, index)}
              {index < steps.length - 1 && renderConnector(index)}
            </div>
            {showLabels && (
              <div className="ml-4 pb-8">
                <p
                  className={cn(
                    'font-medium',
                    config.title,
                    getStepStatus(index) === 'upcoming' && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className={cn('text-muted-foreground mt-1', config.description)}>
                    {step.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              {renderIndicator(step, index)}
              {showLabels && (
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'font-medium',
                      config.title,
                      getStepStatus(index) === 'upcoming' && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p
                      className={cn(
                        'text-muted-foreground mt-0.5 max-w-[120px]',
                        config.description
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              )}
            </div>
            {index < steps.length - 1 && renderConnector(index)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for managing stepper state
 */
export function useStepper(totalSteps: number, initialStep = 0) {
  const [currentStep, setCurrentStep] = React.useState(initialStep);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());

  const goToStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const nextStep = React.useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const reset = React.useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, []);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return {
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    prevStep,
    reset,
    isFirstStep,
    isLastStep,
    progress,
  };
}
