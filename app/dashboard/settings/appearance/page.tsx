'use client';

import { AppearanceSettings } from '@/components/settings';

export default function AppearanceSettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Appearance Settings</h1>
        <p className="text-muted-foreground">
          Customize how NeuroElemental looks and feels
        </p>
      </div>
      <AppearanceSettings />
    </div>
  );
}
