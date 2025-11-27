import { EnergyOrb } from '@/components/ui/energy-orb';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { AirIcon, EarthIcon, ElectricIcon, FireIcon, MetalIcon, WaterIcon } from '../icons/elemental-icons';

interface HeroSectionProps {
  badge?: string;
  title: ReactNode;
  description: string;
  className?: string;
  children?: ReactNode;
  showOrb?: boolean;
}

const FLOATING_ELEMENTS = [
  // Top (Electric ⚡) - 0°
  { Icon: ElectricIcon, delay: 0, angle: 0, duration: 6000 },
  // Top-Right (Fire 🔥) - 60°
  { Icon: FireIcon, delay: 1000, angle: 60, duration: 7000 },
  // Bottom-Right (Water 🌊) - 120°
  { Icon: WaterIcon, delay: 2000, angle: 120, duration: 6500 },
  // Bottom (Earth 🌿) - 180°
  { Icon: EarthIcon, delay: 3000, angle: 180, duration: 7500 },
  // Bottom-Left (Air 💨) - 240°
  { Icon: AirIcon, delay: 4000, angle: 240, duration: 6200 },
  // Top-Left (Metal ⚙️) - 300°
  { Icon: MetalIcon, delay: 5000, angle: 300, duration: 6800 },
];

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
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10" />
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

                {/* Floating Elements - Evenly Spaced */}
                {FLOATING_ELEMENTS.map((el, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${el.angle}deg) translateY(calc(-100px - 6vw)) rotate(-${el.angle}deg)`,
                    }}
                  >
                    <div
                      className="animate-float"
                      style={{
                        animationDelay: `${el.delay}ms`,
                        animationDuration: `${el.duration}ms`,
                      }}
                    >
                      <el.Icon
                        className="drop-shadow-xl filter drop-shadow-lg cursor-default hover:scale-110 transition-transform duration-300"
                        size={48}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            <p className={cn("text-xl text-muted-foreground font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300", showOrb ? "max-w-2xl" : "max-w-3xl mx-auto")}>
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

              {/* Floating Elements - Evenly Spaced */}
              {FLOATING_ELEMENTS.map((el, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${el.angle}deg) translateY(-220px) rotate(-${el.angle}deg)`,
                  }}
                >
                  <div
                    className="animate-float"
                    style={{
                      animationDelay: `${el.delay}ms`,
                      animationDuration: `${el.duration}ms`,
                    }}
                  >
                    <el.Icon
                      className="drop-shadow-xl filter drop-shadow-lg cursor-default hover:scale-110 transition-transform duration-300"
                      size={56}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

        </div>
      </div>

      {/* Scroll Indicator */}
      {showOrb && (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce duration-2000 text-muted-foreground/50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      )}
    </section>
  );
}

