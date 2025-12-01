'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  context?: string;
}

const SHORTCUTS: { category: string; shortcuts: Shortcut[] }[] = [
  {
    category: 'Video Player',
    shortcuts: [
      { keys: ['Space', 'K'], description: 'Play / Pause' },
      { keys: ['←', 'J'], description: 'Rewind 10 seconds' },
      { keys: ['→', 'L'], description: 'Forward 10 seconds' },
      { keys: ['↑'], description: 'Volume up' },
      { keys: ['↓'], description: 'Volume down' },
      { keys: ['M'], description: 'Toggle mute' },
      { keys: ['F'], description: 'Toggle fullscreen' },
      { keys: ['1-9'], description: 'Jump to 10-90%' },
      { keys: ['0', 'Home'], description: 'Jump to start' },
      { keys: ['End'], description: 'Jump to end' },
      { keys: [','], description: 'Previous frame (paused)' },
      { keys: ['.'], description: 'Next frame (paused)' },
      { keys: ['<'], description: 'Decrease speed' },
      { keys: ['>'], description: 'Increase speed' },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close dialogs/menus' },
    ],
  },
];

/**
 * Global keyboard shortcuts help dialog
 * Triggered by pressing "?" key
 */
export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setOpen(true);
      }

      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="w-6 h-6 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate and control the platform more efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {SHORTCUTS.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && (
                            <span className="text-xs text-muted-foreground">or</span>
                          )}
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-1 bg-muted/50"
                          >
                            {key}
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <Badge variant="outline" className="font-mono mx-1">?</Badge> anytime to view shortcuts
            • Press <Badge variant="outline" className="font-mono mx-1">Esc</Badge> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
