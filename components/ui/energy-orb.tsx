'use client';

import { cn } from '@/lib/utils';

interface EnergyOrbProps {
  className?: string;
}

export function EnergyOrb({ className }: EnergyOrbProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-cyan-500/20 blur-xl animate-pulse" />
      <div className="absolute inset-[10%] rounded-full bg-gradient-to-tr from-purple-600/30 via-violet-500/20 to-indigo-500/30 blur-lg animate-pulse" style={{ animationDelay: '500ms' }} />

      {/* Main orb */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-violet-600/40 via-purple-500/30 to-cyan-500/40 backdrop-blur-sm border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.3),inset_0_0_60px_rgba(139,92,246,0.1)]">

        {/* Inner glass effect */}
        <div className="absolute inset-[5%] rounded-full bg-gradient-to-b from-white/10 to-transparent" />

        {/* Central content - Brain with indicators */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative">
            {/* Brain icon - center */}
            <div className="relative z-10 p-6 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/30 backdrop-blur-sm border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.4)]">
              <div className="relative w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]">
                {/* Brain fill - animated (behind) */}
                <div className="absolute inset-0 z-0 animate-clip-fill-up">
                  <svg className="absolute inset-0 w-full h-full text-violet-300" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                  </svg>
                </div>
                {/* Brain outline (on top) */}
                <svg className="absolute inset-0 z-10 w-full h-full text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                  <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                  <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
                  <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
                  <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
                  <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
                  <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
                  <path d="M6 18a4 4 0 0 1-1.967-.516" />
                  <path d="M19.967 17.484A4 4 0 0 1 18 18" />
                </svg>
              </div>
            </div>

            {/* SUN - Top (12 o'clock) - Clarity / Window Opening */}
            <div className="absolute -top-14 md:-top-18 left-1/2 -translate-x-1/2">
              <div className="relative w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                {/* Sun outline */}
                <svg className="absolute inset-0 w-full h-full text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                {/* Sun fill */}
                <div className="absolute inset-0 animate-sun-pulse">
                  <svg className="absolute inset-0 w-full h-full text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* BATTERY - Top Right (2 o'clock) - Energy / Regeneration */}
            <div className="absolute -top-6 -right-10 md:-top-8 md:-right-14">
              <div className="relative drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="6" width="18" height="12" rx="2" ry="2" className="text-emerald-400" />
                  <line x1="23" y1="10" x2="23" y2="14" className="text-emerald-400" />
                  <rect x="3" y="8" width="14" height="8" rx="1" className="animate-clip-fill-right text-emerald-500" fill="currentColor" stroke="none" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingRight: '6px' }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)] animate-pulse">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* USERS - Bottom Right (4 o'clock) - Social Circle Growing */}
            <div className="absolute -bottom-6 -right-10 md:-bottom-8 md:-right-14">
              <div className="relative w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                {/* Users outline */}
                <svg className="absolute inset-0 w-full h-full text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {/* Users fill */}
                <div className="absolute inset-0 animate-clip-fill-up">
                  <svg className="absolute inset-0 w-full h-full text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="7" r="4" />
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2h16z" />
                    <circle cx="16" cy="6" r="3" opacity="0.7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TRENDING UP - Bottom (6 o'clock) - Growth / Progress */}
            <div className="absolute -bottom-14 md:-bottom-18 left-1/2 -translate-x-1/2">
              <div className="relative w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_12px_rgba(132,204,22,0.5)]">
                {/* Trending outline */}
                <svg className="absolute inset-0 w-full h-full text-lime-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                {/* Trending fill - arrow fills in */}
                <div className="absolute inset-0 animate-clip-fill-right">
                  <svg className="absolute inset-0 w-full h-full text-lime-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                </div>
              </div>
            </div>

            {/* HEART - Bottom Left (8 o'clock) - Wellbeing / Happiness */}
            <div className="absolute -bottom-6 -left-10 md:-bottom-8 md:-left-14">
              <div className="relative w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]">
                <svg className="absolute inset-0 w-full h-full text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <div className="absolute inset-0 animate-clip-fill-up">
                  <svg className="absolute inset-0 w-full h-full text-rose-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* SIGNAL/GAUGE - Top Left (10 o'clock) - Bandwidth / Capacity */}
            <div className="absolute -top-6 -left-10 md:-top-8 md:-left-14">
              <div className="relative w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_12px_rgba(251,146,60,0.5)]">
                {/* Signal bars outline */}
                <svg className="absolute inset-0 w-full h-full text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="4" y="16" width="3" height="6" rx="1" />
                  <rect x="10" y="12" width="3" height="10" rx="1" />
                  <rect x="16" y="6" width="3" height="16" rx="1" />
                </svg>
                {/* Signal bars fill - bars filling up */}
                <div className="absolute inset-0 animate-clip-fill-up">
                  <svg className="absolute inset-0 w-full h-full text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="16" width="3" height="6" rx="1" />
                    <rect x="10" y="12" width="3" height="10" rx="1" />
                    <rect x="16" y="6" width="3" height="16" rx="1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pulse waves from center to edge - behind icons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="animate-pulse-expand absolute w-[30%] h-[30%] rounded-full border-2 border-violet-400/60" />
          <div className="animate-pulse-expand absolute w-[30%] h-[30%] rounded-full border-2 border-violet-400/60" style={{ animationDelay: '1.67s' }} />
          <div className="animate-pulse-expand absolute w-[30%] h-[30%] rounded-full border-2 border-violet-400/60" style={{ animationDelay: '3.33s' }} />
        </div>
      </div>
    </div>
  );
}
