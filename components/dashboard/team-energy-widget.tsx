'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, BarChart3, Loader2, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TeamEnergyData {
  totalMembers: number;
  optedInMembers: number;
  checkInsThisWeek: number;
  averageEnergy: number;
  modeDistribution: Record<string, number>;
  protectionModeAlerts: number;
}

interface TeamEnergyWidgetProps {
  organizationId: string;
  className?: string;
}

/**
 * Team Energy Dashboard Widget
 * Requirements: 16.1, 16.2, 16.3
 *
 * Displays aggregate check-in data for an organization
 * Only includes data from users who have opted in
 */
export function TeamEnergyWidget({ organizationId, className }: TeamEnergyWidgetProps) {
  const [data, setData] = useState<TeamEnergyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/energy-analytics`
        );
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch team energy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  if (loading) {
    return (
      <Card className={cn('glass-card', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={cn('glass-card', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load team energy data
        </CardContent>
      </Card>
    );
  }

  const modeColors: Record<string, string> = {
    biological: 'bg-green-500',
    societal: 'bg-blue-500',
    passion: 'bg-pink-500',
    protection: 'bg-red-500',
  };

  return (
    <Card className={cn('glass-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Energy Overview
        </CardTitle>
        <CardDescription>
          Aggregate energy data from {data.optedInMembers} opted-in team members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{data.optedInMembers}</div>
            <div className="text-xs text-muted-foreground">Sharing Data</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{data.checkInsThisWeek}</div>
            <div className="text-xs text-muted-foreground">Check-ins This Week</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{data.averageEnergy.toFixed(1)}/5</div>
            <div className="text-xs text-muted-foreground">Avg Energy Level</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">
              {Math.round((data.checkInsThisWeek / (data.optedInMembers * 7)) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Participation Rate</div>
          </div>
        </div>

        {/* Mode Distribution */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Operating Mode Distribution</span>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            {Object.entries(data.modeDistribution).map(([mode, percentage]) => (
              <div
                key={mode}
                className={cn(modeColors[mode] || 'bg-gray-500')}
                style={{ width: `${percentage}%` }}
                title={`${mode}: ${percentage}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {Object.entries(data.modeDistribution).map(([mode, percentage]) => (
              <div key={mode} className="flex items-center gap-1.5">
                <div className={cn('w-2.5 h-2.5 rounded-full', modeColors[mode])} />
                <span className="capitalize">{mode}</span>
                <span className="text-muted-foreground">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Protection Mode Alerts */}
        {/* Requirements: 16.3 - Flag team members in Protection Mode 3+ days */}
        {data.protectionModeAlerts > 0 && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="font-medium text-amber-600 dark:text-amber-400">
                  {data.protectionModeAlerts} team member{data.protectionModeAlerts > 1 ? 's' : ''} may need support
                </div>
                <div className="text-sm text-muted-foreground">
                  In Protection Mode for 3+ consecutive days
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>Only aggregate data from opted-in members is shown</span>
        </div>
      </CardContent>
    </Card>
  );
}
