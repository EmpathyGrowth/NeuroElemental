'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Clock,
  Volume2,
  Subtitles,
  Play,
  Pause,
  Sparkles,
  Brain,
  Timer,
  Target,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LearningPreferencesData {
  // Learning Style
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  contentPacing: 'slow' | 'normal' | 'fast';

  // Video/Audio
  autoPlayVideos: boolean;
  defaultVideoSpeed: number;
  showCaptions: boolean;
  audioDescriptions: boolean;

  // Session Settings
  sessionDuration: number; // minutes
  breakReminders: boolean;
  breakInterval: number; // minutes
  dailyGoal: number; // minutes per day

  // Focus Mode
  focusModeEnabled: boolean;
  hideDistractions: boolean;

  // Notifications
  progressReminders: boolean;
  achievementNotifications: boolean;
  streakReminders: boolean;
}

const learningStyles = [
  { value: 'visual', label: 'Visual', description: 'Learn best with images, diagrams, and videos', icon: '👁️' },
  { value: 'auditory', label: 'Auditory', description: 'Learn best by listening and discussing', icon: '👂' },
  { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learn best through hands-on practice', icon: '✋' },
  { value: 'reading', label: 'Reading/Writing', description: 'Learn best through text and notes', icon: '📖' },
];

export function LearningPreferences() {
  const [preferences, setPreferences] = useState<LearningPreferencesData>({
    preferredLearningStyle: 'visual',
    contentPacing: 'normal',
    autoPlayVideos: true,
    defaultVideoSpeed: 1,
    showCaptions: false,
    audioDescriptions: false,
    sessionDuration: 30,
    breakReminders: true,
    breakInterval: 25,
    dailyGoal: 30,
    focusModeEnabled: false,
    hideDistractions: false,
    progressReminders: true,
    achievementNotifications: true,
    streakReminders: true,
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const res = await fetch('/api/user/learning-preferences');
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPreferences({ ...preferences, ...data.preferences });
        }
      }
    } catch (_error) {
      // Use defaults
    }
  };

  const updatePreference = <K extends keyof LearningPreferencesData>(
    key: K,
    value: LearningPreferencesData[K]
  ) => {
    setPreferences({ ...preferences, [key]: value });
    setHasChanges(true);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/learning-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (res.ok) {
        toast.success('Learning preferences saved');
        setHasChanges(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (_error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Learning Style */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Learning Style</CardTitle>
              <CardDescription>
                Choose your preferred way of learning to get personalized content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.preferredLearningStyle}
            onValueChange={(value) => updatePreference('preferredLearningStyle', value as any)}
            className="grid gap-4 md:grid-cols-2"
          >
            {learningStyles.map((style) => (
              <Label
                key={style.value}
                htmlFor={style.value}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  preferences.preferredLearningStyle === style.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem value={style.value} id={style.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{style.icon}</span>
                    <span className="font-medium">{style.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Content Pacing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Content Pacing</CardTitle>
              <CardDescription>
                Set how quickly you want to move through content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences.contentPacing}
            onValueChange={(value) => updatePreference('contentPacing', value as any)}
            className="flex gap-4"
          >
            {[
              { value: 'slow', label: 'Relaxed', description: 'Take your time' },
              { value: 'normal', label: 'Normal', description: 'Standard pace' },
              { value: 'fast', label: 'Accelerated', description: 'Move quickly' },
            ].map((option) => (
              <Label
                key={option.value}
                htmlFor={`pace-${option.value}`}
                className={cn(
                  'flex-1 p-4 rounded-lg border-2 cursor-pointer text-center transition-all',
                  preferences.contentPacing === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`pace-${option.value}`}
                  className="sr-only"
                />
                <span className="font-medium block">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Video & Audio Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Video & Audio</CardTitle>
              <CardDescription>Customize your media playback experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-play Videos</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start videos when they come into view
              </p>
            </div>
            <Switch
              checked={preferences.autoPlayVideos}
              onCheckedChange={(checked) => updatePreference('autoPlayVideos', checked)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Default Video Speed</Label>
              <Badge variant="outline">{preferences.defaultVideoSpeed}x</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Pause className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[preferences.defaultVideoSpeed]}
                onValueChange={([value]) => updatePreference('defaultVideoSpeed', value)}
                min={0.5}
                max={2}
                step={0.25}
                className="flex-1"
              />
              <Play className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Subtitles className="w-4 h-4" />
                Show Captions
              </Label>
              <p className="text-sm text-muted-foreground">
                Display subtitles on video content
              </p>
            </div>
            <Switch
              checked={preferences.showCaptions}
              onCheckedChange={(checked) => updatePreference('showCaptions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Audio Descriptions
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable audio descriptions for visual content
              </p>
            </div>
            <Switch
              checked={preferences.audioDescriptions}
              onCheckedChange={(checked) => updatePreference('audioDescriptions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session & Break Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Study Sessions</CardTitle>
              <CardDescription>Configure your learning sessions and breaks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Daily Learning Goal</Label>
              <Badge variant="outline">{preferences.dailyGoal} min/day</Badge>
            </div>
            <Slider
              value={[preferences.dailyGoal]}
              onValueChange={([value]) => updatePreference('dailyGoal', value)}
              min={15}
              max={120}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15 min</span>
              <span>1 hour</span>
              <span>2 hours</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Break Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders to take breaks during long sessions
              </p>
            </div>
            <Switch
              checked={preferences.breakReminders}
              onCheckedChange={(checked) => updatePreference('breakReminders', checked)}
            />
          </div>

          {preferences.breakReminders && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pl-4 border-l-2 border-primary/30"
            >
              <div className="flex items-center justify-between">
                <Label>Break Interval (Pomodoro)</Label>
                <Badge variant="outline">{preferences.breakInterval} min</Badge>
              </div>
              <Slider
                value={[preferences.breakInterval]}
                onValueChange={([value]) => updatePreference('breakInterval', value)}
                min={15}
                max={60}
                step={5}
                className="w-full"
              />
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Focus Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Focus Mode</CardTitle>
              <CardDescription>Minimize distractions while learning</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Focus Mode</Label>
              <p className="text-sm text-muted-foreground">
                Hide non-essential UI elements during lessons
              </p>
            </div>
            <Switch
              checked={preferences.focusModeEnabled}
              onCheckedChange={(checked) => updatePreference('focusModeEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hide Distractions</Label>
              <p className="text-sm text-muted-foreground">
                Minimize notifications and sidebar during focus
              </p>
            </div>
            <Switch
              checked={preferences.hideDistractions}
              onCheckedChange={(checked) => updatePreference('hideDistractions', checked)}
              disabled={!preferences.focusModeEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Learning Notifications</CardTitle>
              <CardDescription>Control learning-related notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Progress Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders to continue incomplete courses
              </p>
            </div>
            <Switch
              checked={preferences.progressReminders}
              onCheckedChange={(checked) => updatePreference('progressReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Achievement Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Celebrate when you earn badges and achievements
              </p>
            </div>
            <Switch
              checked={preferences.achievementNotifications}
              onCheckedChange={(checked) => updatePreference('achievementNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Streak Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Daily reminders to maintain your learning streak
              </p>
            </div>
            <Switch
              checked={preferences.streakReminders}
              onCheckedChange={(checked) => updatePreference('streakReminders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving || !hasChanges}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
