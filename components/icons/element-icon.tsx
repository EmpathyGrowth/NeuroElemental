'use client';

import { ElementalIcons } from './elemental-icons';

// Map element slugs to icon keys
const slugToIconKey: Record<string, keyof typeof ElementalIcons> = {
  electric: 'electric',
  fiery: 'fire',
  aquatic: 'water',
  earthly: 'earth',
  airy: 'air',
  metallic: 'metal',
};

interface ElementIconProps {
  slug: string;
  size?: number | string;
  className?: string;
}

export function ElementIcon({ slug, size = '3rem', className }: ElementIconProps) {
  const iconKey = slugToIconKey[slug];
  const Icon = iconKey ? ElementalIcons[iconKey] : null;

  if (!Icon) {
    return null;
  }

  return <Icon size={size} className={className} />;
}




