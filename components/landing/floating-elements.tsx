'use client';

/**
 * Floating Elements Component
 * Animated elemental icons that float around the Energy Orb
 * Used on the landing page hero section
 */

import { AirIcon, EarthIcon, ElectricIcon, FireIcon, MetalIcon, WaterIcon } from '../icons/elemental-icons';
import { ComponentType } from 'react';

// Configuration for floating elemental icons positioned around the orb
interface FloatingElementConfig {
  Icon: ComponentType<{ className?: string; size?: number }>;
  delay: number;      // Animation delay in ms
  angle: number;      // Position angle in degrees (0 = top)
  duration: number;   // Float animation duration in ms
}

export const FLOATING_ELEMENTS: FloatingElementConfig[] = [
  // Top (Electric) - 0°
  { Icon: ElectricIcon, delay: 0, angle: 0, duration: 6000 },
  // Top-Right (Fire) - 60°
  { Icon: FireIcon, delay: 1000, angle: 60, duration: 7000 },
  // Bottom-Right (Water) - 120°
  { Icon: WaterIcon, delay: 2000, angle: 120, duration: 6500 },
  // Bottom (Earth) - 180°
  { Icon: EarthIcon, delay: 3000, angle: 180, duration: 7500 },
  // Bottom-Left (Air) - 240°
  { Icon: AirIcon, delay: 4000, angle: 240, duration: 6200 },
  // Top-Left (Metal) - 300°
  { Icon: MetalIcon, delay: 5000, angle: 300, duration: 6800 },
];

interface FloatingElementsProps {
  /** Distance from center to icons */
  radius: string;
  /** Icon size in pixels */
  iconSize: number;
}

/**
 * Renders floating elemental icons around a central point
 * Uses CSS transforms to position icons in a circle
 */
export function FloatingElements({ radius, iconSize }: FloatingElementsProps) {
  return (
    <>
      {FLOATING_ELEMENTS.map((el, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) rotate(${el.angle}deg) translateY(${radius}) rotate(-${el.angle}deg)`,
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
              size={iconSize}
            />
          </div>
        </div>
      ))}
    </>
  );
}
