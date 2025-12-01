'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Type,
  Maximize2,
  Sparkles,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AppearanceSettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: number;
  compactMode: boolean;
  accentColor: string;
}

const accentColors = [
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<AppearanceSettings>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 100,
    compactMode: false,
    accentColor: 'purple',
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('appearance-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings: AppearanceSettings) => {
    // Apply font size
    document.documentElement.style.fontSize = `${newSettings.fontSize}%`;

    // Apply reduced motion
    if (newSettings.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply high contrast
    if (newSettings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply compact mode
    if (newSettings.compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
  };

  const updateSetting = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
    applySettings(newSettings);
  };

  const saveSettings = () => {
    localStorage.setItem('appearance-settings', JSON.stringify(settings));
    setHasChanges(false);
    toast.success('Appearance settings saved');
  };

  const resetSettings = () => {
    const defaultSettings: AppearanceSettings = {
      reducedMotion: false,
      highContrast: false,
      fontSize: 100,
      compactMode: false,
      accentColor: 'purple',
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.removeItem('appearance-settings');
    setHasChanges(false);
    toast.success('Settings reset to defaults');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your preferred color scheme</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map((option) => (
              <Label
                key={option.value}
                htmlFor={option.value}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  theme === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />
                <option.icon className={cn(
                  'w-6 h-6',
                  theme === option.value ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className="text-sm font-medium">{option.label}</span>
                {theme === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <Check className="w-4 h-4 text-primary" />
                  </motion.div>
                )}
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Accent Color</CardTitle>
              <CardDescription>Customize interface highlights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => updateSetting('accentColor', color.value)}
                className={cn(
                  'w-10 h-10 rounded-full transition-all',
                  color.class,
                  settings.accentColor === color.value
                    ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                    : 'hover:scale-105'
                )}
                title={color.name}
              >
                {settings.accentColor === color.value && (
                  <Check className="w-5 h-5 text-white mx-auto" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Font Size</CardTitle>
              <CardDescription>Adjust text size for better readability</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">A</span>
            <span className="text-lg font-medium">{settings.fontSize}%</span>
            <span className="text-xl">A</span>
          </div>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSetting('fontSize', value)}
            min={80}
            max={150}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Smaller</span>
            <span>Default</span>
            <span>Larger</span>
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Maximize2 className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Layout</CardTitle>
              <CardDescription>Customize the interface layout</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for more content on screen
              </p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSetting('compactMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Options */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Options to improve accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={resetSettings}>
          Reset to Defaults
        </Button>
        <Button onClick={saveSettings} disabled={!hasChanges}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
