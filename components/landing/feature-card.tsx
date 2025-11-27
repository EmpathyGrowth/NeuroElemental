import { memo, ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Extended icon type that may have displayName or name for twemoji detection */
type IconComponent = (LucideIcon | ComponentType<{ className?: string; size?: number | string }>) & {
  displayName?: string;
  name?: string;
};

interface FeatureCardProps {
  icon: IconComponent;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
  iconWrapperClassName?: string;
  delay?: number;
}

export const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
  iconWrapperClassName,
  delay
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "p-8 text-center hover:shadow-2xl transition-all duration-300 glass-card border-border/50 group hover:-translate-y-2",
        className
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className={cn(
        "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300",
        iconWrapperClassName
      )}>
        {/* Support both twemoji icons (with size prop) and lucide icons (with className) */}
        {Icon.displayName?.endsWith('Icon') || Icon.name?.endsWith('Icon') ? (
          <Icon size="2rem" className={iconClassName} />
        ) : (
          <Icon className={cn("w-8 h-8", iconClassName)} />
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground">{description}</p>
    </Card>
  );
});



