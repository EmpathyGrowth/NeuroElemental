import { cn } from '@/lib/utils';
import React from 'react';

interface SectionHeaderProps {
  title?: React.ReactNode;
  highlight?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  centered?: boolean;
  badge?: React.ReactNode;
}

export function SectionHeader({
  title,
  highlight,
  description,
  className,
  titleClassName,
  descriptionClassName,
  centered = true,
  badge,
}: SectionHeaderProps) {
  return (
    <div className={cn(
      centered && "text-center",
      "mb-16",
      className
    )}>
      {badge && (
        <div className="mb-6">
          {badge}
        </div>
      )}

      {(title || highlight) && (
        <h2 className={cn(
          "text-3xl md:text-5xl font-bold text-foreground mb-6",
          titleClassName
        )}>
          {title}
          {highlight && (
            <>
              {title && ' '}
              <span className="gradient-text">{highlight}</span>
            </>
          )}
        </h2>
      )}

      {description && (
        <p className={cn(
          "text-xl text-muted-foreground",
          centered && "max-w-3xl mx-auto",
          descriptionClassName
        )}>
          {description}
        </p>
      )}
    </div>
  );
}