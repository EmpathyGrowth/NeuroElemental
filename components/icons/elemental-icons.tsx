'use client';

import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';

interface IconProps {
  className?: string;
  size?: number | string;
}

// ============================================
// ELEMENTAL ICONS
// ============================================

export function ElectricIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:high-voltage"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function FireIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:fire"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function WaterIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:water-wave"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function EarthIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:herb"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function AirIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:dashing-away"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function MetalIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:gear"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

// ============================================
// CORE ICONS (for Energy Orb center)
// ============================================

export function BrainIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:brain"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function BatteryIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:battery"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function HeartIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:red-heart"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

// ============================================
// ICON MAP (for dynamic rendering)
// ============================================

export const ElementalIcons = {
  electric: ElectricIcon,
  fire: FireIcon,
  water: WaterIcon,
  earth: EarthIcon,
  air: AirIcon,
  metal: MetalIcon,
} as const;

export const CoreIcons = {
  brain: BrainIcon,
  battery: BatteryIcon,
  heart: HeartIcon,
} as const;

// ============================================
// REGENERATION TYPE ICONS
// ============================================

export function ActiveIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:person-running"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function PassiveIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:zzz"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function ProactiveIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:light-bulb"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

// ============================================
// STATE ICONS
// ============================================

export function BiologicalIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:microbe"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function SocietalIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:handshake"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function PassionIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:sparkles"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function SurvivalIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:shield"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

// ============================================
// FRAMEWORK FEATURE ICONS
// ============================================

export function EnergyFirstIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:battery"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function DynamicStatesIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:cyclone"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function NeurodivergentIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:brain"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function EthicalIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:check-mark-button"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

// ============================================
// HOMEPAGE ICONS
// ============================================

export function LockIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:locked"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function FileQuestionIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:question-mark"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function SparklesIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:sparkles"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function ShieldIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:shield"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function AlertCircleIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:warning"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function CheckCircleIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:white-check-mark"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function HeartIcon2({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:red-heart"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function MailIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:envelope"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function TargetIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:direct-hit"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}

export function UsersIcon({ className, size = 48 }: IconProps) {
  return (
    <Icon
      icon="twemoji:busts-in-silhouette"
      width={size}
      height={size}
      className={cn("inline-block", className)}
    />
  );
}
