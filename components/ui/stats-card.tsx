"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import * as React from "react";

// ============================================================================
// Types
// ============================================================================

type TrendDirection = "up" | "down" | "neutral";

interface Trend {
  direction: TrendDirection;
  value: string;
  label?: string;
}

// ============================================================================
// Stats Card
// ============================================================================

type AccentColor =
  | "default"
  | "blue"
  | "purple"
  | "green"
  | "amber"
  | "pink"
  | "cyan"
  | "red"
  | "indigo";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: Trend;
  footer?: React.ReactNode;
  loading?: boolean;
  className?: string;
  accent?: AccentColor;
}

// Accent color styles for icon backgrounds
const accentStyles: Record<AccentColor, { icon: string; border?: string }> = {
  default: { icon: "bg-primary/10 text-primary" },
  blue: { icon: "bg-blue-500/10 text-blue-600", border: "border-l-blue-500" },
  purple: {
    icon: "bg-purple-500/10 text-purple-600",
    border: "border-l-purple-500",
  },
  green: {
    icon: "bg-green-500/10 text-green-600",
    border: "border-l-green-500",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600",
    border: "border-l-amber-500",
  },
  pink: { icon: "bg-pink-500/10 text-pink-600", border: "border-l-pink-500" },
  cyan: { icon: "bg-cyan-500/10 text-cyan-600", border: "border-l-cyan-500" },
  red: { icon: "bg-red-500/10 text-red-600", border: "border-l-red-500" },
  indigo: {
    icon: "bg-indigo-500/10 text-indigo-600",
    border: "border-l-indigo-500",
  },
};

const trendColors = {
  up: "text-green-600 bg-green-500/10",
  down: "text-red-600 bg-red-500/10",
  neutral: "text-gray-600 bg-gray-500/10",
};

const TrendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  footer,
  loading = false,
  className,
  accent = "default",
}: StatsCardProps) {
  const TrendIcon = trend ? TrendIcons[trend.direction] : null;
  const accentStyle = accentStyles[accent];

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-6 shadow-sm",
          accentStyle.border && `border-l-2 ${accentStyle.border}`,
          className
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        accentStyle.border && `border-l-2 ${accentStyle.border}`,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        {icon && (
          <div className={cn("rounded-lg p-2.5", accentStyle.icon)}>{icon}</div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                trendColors[trend.direction],
                trend.direction === "up" && "ring-green-500/20",
                trend.direction === "down" && "ring-red-500/20",
                trend.direction === "neutral" && "ring-gray-500/20"
              )}
            >
              {TrendIcon && <TrendIcon className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
          {trend?.label && (
            <span className="text-sm text-muted-foreground">{trend.label}</span>
          )}
        </div>
      )}

      {footer && <div className="mt-4 border-t pt-4">{footer}</div>}
    </div>
  );
}

// ============================================================================
// Stats Card Grid
// ============================================================================

interface StatsCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

const gridColumns = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
};

export function StatsCardGrid({
  children,
  columns = 4,
  className,
}: StatsCardGridProps) {
  return (
    <div className={cn("grid gap-4", gridColumns[columns], className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Mini Stats Row
// ============================================================================

interface MiniStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: TrendDirection;
  trendValue?: string;
}

export function MiniStatRow({ stats }: { stats: MiniStatProps[] }) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {stats.map((stat, index) => {
        const TrendIcon = stat.trend ? TrendIcons[stat.trend] : null;
        return (
          <div key={index} className="flex items-center gap-3">
            {stat.icon && (
              <div className="text-muted-foreground">{stat.icon}</div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{stat.value}</p>
                {stat.trend && stat.trendValue && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs",
                      stat.trend === "up" && "text-green-600",
                      stat.trend === "down" && "text-red-600",
                      stat.trend === "neutral" && "text-gray-600"
                    )}
                  >
                    {TrendIcon && <TrendIcon className="h-3 w-3" />}
                    {stat.trendValue}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Progress Stats Card
// ============================================================================

interface ProgressStatsCardProps {
  title: string;
  current: number;
  total: number;
  unit?: string;
  description?: string;
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "error";
  accent?: AccentColor;
  className?: string;
}

const progressColors = {
  primary: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
};

export function ProgressStatsCard({
  title,
  current,
  total,
  unit = "",
  description,
  icon,
  color = "primary",
  accent = "default",
  className,
}: ProgressStatsCardProps) {
  const percentage = Math.min(100, Math.round((current / total) * 100));
  const isComplete = current >= total;
  const accentStyle = accentStyles[accent];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        accentStyle.border && `border-l-2 ${accentStyle.border}`,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {current.toLocaleString()}
            <span className="text-lg text-muted-foreground">
              {" "}
              / {total.toLocaleString()}
              {unit}
            </span>
          </p>
        </div>
        {icon && (
          <div className={cn("rounded-lg p-2.5", accentStyle.icon)}>{icon}</div>
        )}
      </div>

      <div className="space-y-2">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isComplete ? "bg-green-500" : progressColors[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{percentage}% complete</span>
          {isComplete ? (
            <span className="text-green-600 font-medium">Goal reached!</span>
          ) : (
            <span>
              {(total - current).toLocaleString()}
              {unit} remaining
            </span>
          )}
        </div>
      </div>

      {description && (
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// ============================================================================
// Comparison Stats Card
// ============================================================================

interface ComparisonStatsCardProps {
  title: string;
  current: {
    label: string;
    value: string | number;
  };
  previous: {
    label: string;
    value: string | number;
  };
  change?: {
    direction: TrendDirection;
    value: string;
  };
  icon?: React.ReactNode;
  accent?: AccentColor;
  className?: string;
}

export function ComparisonStatsCard({
  title,
  current,
  previous,
  change,
  icon,
  accent = "default",
  className,
}: ComparisonStatsCardProps) {
  const ChangeIcon = change ? TrendIcons[change.direction] : null;
  const accentStyle = accentStyles[accent];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        accentStyle.border && `border-l-2 ${accentStyle.border}`,
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className={cn("rounded-lg p-2", accentStyle.icon)}>{icon}</div>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{current.label}</p>
          <p className="text-2xl font-bold">{current.value}</p>
        </div>

        {change && (
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
              change.direction === "up" && "bg-green-500/10 text-green-600",
              change.direction === "down" && "bg-red-500/10 text-red-600",
              change.direction === "neutral" && "bg-gray-500/10 text-gray-600"
            )}
          >
            {ChangeIcon && <ChangeIcon className="h-3.5 w-3.5" />}
            {change.value}
          </div>
        )}

        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">{previous.label}</p>
          <p className="text-lg text-muted-foreground">{previous.value}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Live Stats Card (with pulse indicator)
// ============================================================================

interface LiveStatsCardProps extends Omit<StatsCardProps, "loading"> {
  isLive?: boolean;
  lastUpdated?: string;
}

export function LiveStatsCard({
  isLive = true,
  lastUpdated,
  className,
  ...props
}: LiveStatsCardProps) {
  return (
    <div className={cn("relative", className)}>
      {isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Live
        </div>
      )}
      {!isLive && lastUpdated && (
        <div className="absolute top-4 right-4 text-xs text-muted-foreground">
          Updated {lastUpdated}
        </div>
      )}
      <StatsCard {...props} className={className} />
    </div>
  );
}

// ============================================================================
// Metric Card (compact version)
// ============================================================================

// Accent color styles for MetricCard (top border + value color)
const metricAccentStyles: Record<
  AccentColor,
  { border: string; value: string }
> = {
  default: { border: "", value: "" },
  blue: {
    border: "border-t-2 border-t-blue-500",
    value: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    border: "border-t-2 border-t-purple-500",
    value: "text-purple-600 dark:text-purple-400",
  },
  green: {
    border: "border-t-2 border-t-green-500",
    value: "text-green-600 dark:text-green-400",
  },
  amber: {
    border: "border-t-2 border-t-amber-500",
    value: "text-amber-600 dark:text-amber-400",
  },
  pink: {
    border: "border-t-2 border-t-pink-500",
    value: "text-pink-600 dark:text-pink-400",
  },
  cyan: {
    border: "border-t-2 border-t-cyan-500",
    value: "text-cyan-600 dark:text-cyan-400",
  },
  red: {
    border: "border-t-2 border-t-red-500",
    value: "text-red-600 dark:text-red-400",
  },
  indigo: {
    border: "border-t-2 border-t-indigo-500",
    value: "text-indigo-600 dark:text-indigo-400",
  },
};

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: TrendDirection;
  accent?: AccentColor;
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  changeType = "neutral",
  accent = "default",
  className,
}: MetricCardProps) {
  const accentStyle = metricAccentStyles[accent];

  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-muted/50",
        accentStyle.border,
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className={cn("text-2xl font-semibold", accentStyle.value)}>
          {value}
        </p>
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              changeType === "up" && "text-green-600",
              changeType === "down" && "text-red-600",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Metric Row (inline metrics)
// ============================================================================

export function MetricRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{children}</div>
  );
}
