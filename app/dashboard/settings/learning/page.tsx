'use client';

import { LearningPreferences } from '@/components/settings';

export default function LearningPreferencesPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Preferences</h1>
        <p className="text-muted-foreground">
          Customize your learning experience to match your style
        </p>
      </div>
      <LearningPreferences />
    </div>
  );
}
