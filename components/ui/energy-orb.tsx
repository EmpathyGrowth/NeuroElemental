'use client';

import { cn } from '@/lib/utils';
import { Brain, Battery, Heart } from 'lucide-react';
import { memo } from 'react';

interface EnergyOrbProps {
  className?: string;
  size?: number;
}

// Memoize the component to prevent unnecessary re-renders
export const EnergyOrb = memo(function EnergyOrb({ className }: EnergyOrbProps) {
  return (
    <div className={cn("relative flex items-center justify-center w-full h-full", className)} style={{ aspectRatio: '1 / 1' }}>
      {/* Core - Use CSS animation instead of framer-motion for better performance */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 blur-2xl opacity-60 animate-orb-rotate"
        style={{
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }}
      />

      {/* Inner Glow - Use CSS animation */}
      <div
        className="absolute rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 blur-xl opacity-80 animate-orb-pulse"
        style={{
          width: 'calc(100% - 2rem)',
          height: 'calc(100% - 2rem)',
          top: '1rem',
          left: '1rem',
        }}
      />

      {/* Particles/Rings - Use CSS animations */}
      <div
        className="absolute border-2 border-foreground/10 rounded-full animate-orb-ring-slow"
        style={{
          width: '140%',
          height: '140%',
          top: '-20%',
          left: '-20%',
        }}
      />
      <div
        className="absolute border border-foreground/20 rounded-full dashed animate-orb-ring-fast"
        style={{
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
        }}
      />

      {/* Center Brightness */}
      <div
        className="absolute bg-purple-400/20 dark:bg-white/30 blur-3xl rounded-full mix-blend-overlay"
        style={{
          width: 'calc(100% - 5rem)',
          height: 'calc(100% - 5rem)',
          top: '2.5rem',
          left: '2.5rem',
        }}
      />

      {/* Center Icons - Brain, Battery, Heart */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          {/* Battery - Left */}
          <div className="relative">
            {/* Battery outline */}
            <Battery
              className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28"
              style={{ color: 'var(--icon-battery-color, rgb(217, 119, 6, 0.7))' }}
              strokeWidth={1}
            />
            {/* Battery fill animation - smaller rect inside */}
            <div className="absolute inset-0 flex items-center">
              <div
                className="animate-battery-fill drop-shadow-lg"
                style={{
                  position: 'absolute',
                  height: '30%',
                  left: '16%',
                  top: '35%',
                  borderRadius: '3px',
                  transformOrigin: 'left center',
                  background: 'var(--icon-battery-fill, linear-gradient(to right, rgb(245, 158, 11), rgb(251, 146, 60)))',
                }}
              />
            </div>
          </div>

          {/* Brain - Center (Larger) */}
          <Brain
            className="w-24 h-24 md:w-36 md:h-36 lg:w-44 lg:h-44 animate-pulse drop-shadow-lg"
            style={{
              animationDuration: '4s',
              color: 'var(--icon-brain-color, rgb(147, 51, 234))'
            }}
            strokeWidth={1}
          />

          {/* Heart - Right */}
          <div className="relative">
            {/* Heart outline */}
            <Heart
              className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28"
              style={{ color: 'var(--icon-heart-outline, rgb(219, 39, 119, 0.7))' }}
              strokeWidth={1}
            />
            {/* Heart fill animation */}
            <Heart
              className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 absolute inset-0 animate-heart-fill drop-shadow-lg"
              style={{ color: 'var(--icon-heart-fill, rgb(236, 72, 153))' }}
              strokeWidth={1}
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    </div>
  );
});
