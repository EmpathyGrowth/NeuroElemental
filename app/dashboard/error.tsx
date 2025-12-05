
'use client';

import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logging';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Dashboard segment error:', error, {
      digest: error.digest,
      url: window.location.href,
    });
  }, [error]);

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-destructive/20 shadow-lg">
        <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Error</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "We couldn't load your dashboard. Please try again."}
        </p>
        <div className="flex gap-4 justify-center">
            <Button onClick={() => reset()} variant="default" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
                Reload Page
            </Button>
        </div>
      </div>
    </div>
  );
}
