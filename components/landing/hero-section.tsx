/**
 * Hero Section Component
 * Landing page hero with title, description, CTA, and optional animated orb
 *
 * Floating elements extracted to: ./floating-elements.tsx
 * Scroll indicator extracted to: ../ui/scroll-indicator.tsx
 */

import { EnergyOrb } from '@/components/ui/energy-orb';
import { GridPattern } from '@/components/ui/grid-pattern';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { FloatingElements } from './floating-elements';

interface HeroSectionProps {
  badge?: string;
  title: ReactNode;
  description: string;
  className?: string;
  children?: ReactNode;
  showOrb?: boolean;
}

export function HeroSection({
  badge,
  title,
  description,
  className,
  children,
  showOrb = false,
}: HeroSectionProps) {
  return (
    <section className={cn("relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-32 flex items-center", showOrb ? "lg:min-h-screen" : "lg:min-h-[60vh]", className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px]" />

        {/* Grid Pattern Overlay */}
        <GridPattern className="text-white opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className={cn("flex flex-col gap-12 md:gap-16 items-center", showOrb ? "lg:grid lg:grid-cols-2 lg:gap-12" : "lg:max-w-4xl lg:mx-auto")}>

          {/* Text Content */}
          <div className={cn("text-center space-y-8 w-full", showOrb && "lg:text-left")}>
            {badge && (
              <div className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="px-4 py-1.5 rounded-full glass-premium border border-primary/30 text-sm font-medium text-primary shadow-[0_0_15px_rgba(167,139,250,0.3)]">
                  {badge}
                </div>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {title}
            </h1>

            {/* Orb on Mobile - Between Heading and Description */}
            {showOrb && (
            <div className="lg:hidden relative flex items-center justify-center px-12 md:px-16 py-16 pr-16 md:pr-20">
              <div className="relative w-full max-w-[250px] sm:max-w-[280px] md:max-w-[340px] aspect-square flex items-center justify-center">
                <EnergyOrb className="w-full h-full" />
                <FloatingElements radius="calc(-130px - 8vw)" iconSize={48} />
              </div>
            </div>
            )}

            <p className={cn("text-xl text-muted-foreground font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300", showOrb ? "max-w-2xl mx-auto lg:mx-0" : "max-w-3xl mx-auto")}>
              {description}
            </p>

            {children && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                {children}
              </div>
            )}
          </div>

          {/* Visual Content - Desktop Only */}
          {showOrb && (
          <div className="hidden lg:flex relative items-center justify-center pl-8 pr-16 xl:pr-20 2xl:pr-24">
            <div className="relative w-full max-w-[340px] xl:max-w-[360px] 2xl:max-w-[380px] aspect-square flex items-center justify-center">
              <EnergyOrb className="w-full h-full" />
              <FloatingElements radius="-220px" iconSize={56} />
            </div>
          </div>
          )}

        </div>
      </div>

      {/* Scroll Indicator */}
      {showOrb && <ScrollIndicator />}
    </section>
  );
}
