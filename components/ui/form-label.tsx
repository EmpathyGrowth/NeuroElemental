'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  required?: boolean;
  optional?: boolean;
}

/**
 * Form label component with optional required/optional indicators
 * Use this for form fields where you want to show field requirement status
 */
const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  FormLabelProps
>(({ className, required, optional, children, ...props }, ref) => (
  <Label ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
    {children}
    {required && (
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
    )}
    {optional && (
      <span className="text-muted-foreground text-xs font-normal">(optional)</span>
    )}
  </Label>
));
FormLabel.displayName = 'FormLabel';

export { FormLabel };
