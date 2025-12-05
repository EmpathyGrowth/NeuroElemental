"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type UserRole,
  type NavSection,
  sectionColors,
  getNavConfigByRole,
  Home,
  ChevronLeft,
  ChevronRight,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Local storage key for sidebar collapse state
 */
const COLLAPSE_STORAGE_KEY = "dashboard-sidebar-collapsed";

/**
 * Props for SharedDashboardSidebar
 */
export interface SharedDashboardSidebarProps {
  /** User's current role */
  role: UserRole;
  /** Whether to show role switcher (when user has multiple roles) */
  showRoleSwitcher?: boolean;
  /** Available roles for switching */
  availableRoles?: UserRole[];
  /** Callback when role is switched */
  onRoleSwitch?: (role: UserRole) => void;
  /** Custom class name */
  className?: string;
}


/**
 * Reusable navigation content component
 */
function SidebarNavContent({
  sections,
  onNavigate,
  isCollapsed = false,
}: {
  sections: NavSection[];
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-4" role="navigation" aria-label="Dashboard navigation">
      {sections.map((section) => {
        const colorConfig = sectionColors[section.color];

        return (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-2 flex items-center gap-2">
                <div
                  className={cn("w-1.5 h-1.5 rounded-full", colorConfig.indicator)}
                  aria-hidden="true"
                />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              if (isCollapsed) {
                return (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center justify-center p-2.5 rounded-lg transition-colors",
                            isActive
                              ? colorConfig.active
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <Icon
                            className={cn("w-5 h-5", isActive ? "" : colorConfig.icon)}
                            aria-hidden="true"
                          />
                          <span className="sr-only">{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? colorConfig.active
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon
                    className={cn("w-4 h-4 shrink-0", isActive ? "" : colorConfig.icon)}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}


/**
 * Role switcher component
 */
function RoleSwitcher({
  currentRole,
  availableRoles,
  onRoleSwitch,
  isCollapsed,
}: {
  currentRole: UserRole;
  availableRoles: UserRole[];
  onRoleSwitch: (role: UserRole) => void;
  isCollapsed: boolean;
}) {
  if (availableRoles.length <= 1) return null;

  const roleLabels: Record<UserRole, string> = {
    student: "Student",
    instructor: "Instructor",
    admin: "Admin",
    business: "Business",
  };

  if (isCollapsed) {
    return (
      <div className="px-2 py-2 border-b border-border/50">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                aria-label="Switch role"
              >
                <span className="text-xs font-medium">
                  {roleLabels[currentRole].charAt(0)}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="space-y-1">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => onRoleSwitch(role)}
                    className={cn(
                      "block w-full text-left px-2 py-1 rounded text-sm",
                      role === currentRole
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-b border-border/50">
      <label className="text-xs text-muted-foreground mb-1 block">
        Switch Role
      </label>
      <select
        value={currentRole}
        onChange={(e) => onRoleSwitch(e.target.value as UserRole)}
        className="w-full text-sm bg-muted/50 border border-border/50 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Select role"
      >
        {availableRoles.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </select>
    </div>
  );
}


/**
 * SharedDashboardSidebar - Desktop sidebar with collapsible state
 *
 * Features:
 * - Role-based navigation from centralized config
 * - Collapsible state persisted to localStorage
 * - Role switcher when user has multiple roles
 * - Responsive Sheet-based navigation on mobile
 * - Accessible with proper ARIA attributes
 *
 * @example
 * ```tsx
 * <SharedDashboardSidebar
 *   role="student"
 *   showRoleSwitcher
 *   availableRoles={["student", "instructor"]}
 *   onRoleSwitch={handleRoleSwitch}
 * />
 * ```
 */
export function SharedDashboardSidebar({
  role,
  showRoleSwitcher = false,
  availableRoles = [],
  onRoleSwitch,
  className,
}: SharedDashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const config = getNavConfigByRole(role);
  const Icon = config.icon;

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Toggle and persist collapsed state
  const toggleCollapsed = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(newState));
  }, [isCollapsed]);

  return (
    <aside
      className={cn(
        "border-r border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 hidden md:flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      aria-label={`${config.title} sidebar`}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center h-16 px-4",
          isCollapsed ? "flex-col justify-center gap-1 py-2" : "justify-between"
        )}
      >
        <Link
          href="/"
          className={cn(
            "hover:opacity-80 transition-opacity group",
            isCollapsed
              ? "p-2 rounded-full bg-linear-to-br from-purple-400/10 to-purple-200/20"
              : "flex items-center gap-2 min-w-0"
          )}
          title="Back to main site"
        >
          {isCollapsed ? (
            <Icon className="w-5 h-5 text-purple-400" aria-hidden="true" />
          ) : (
            <>
              <div className="p-2 rounded-full bg-linear-to-br from-purple-400/10 to-purple-200/20 group-hover:from-purple-400/20 group-hover:to-purple-200/30 transition-all">
                <Icon className="w-5 h-5 text-purple-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate">{config.title}</h2>
                <p className="text-xs text-muted-foreground truncate">
                  {config.subtitle}
                </p>
              </div>
            </>
          )}
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="h-8 w-8 shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 mx-auto my-1"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}

      {/* Role Switcher */}
      {showRoleSwitcher && availableRoles.length > 1 && onRoleSwitch && (
        <RoleSwitcher
          currentRole={role}
          availableRoles={availableRoles}
          onRoleSwitch={onRoleSwitch}
          isCollapsed={isCollapsed}
        />
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        <SidebarNavContent sections={config.sections} isCollapsed={isCollapsed} />
      </ScrollArea>

      {/* Footer */}
      <div
        className={cn(
          "border-t border-border/50 p-2",
          isCollapsed ? "flex justify-center" : ""
        )}
      >
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  className="flex items-center justify-center p-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Home className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">Back to Site</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Back to Site</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to Site
          </Link>
        )}
      </div>
    </aside>
  );
}


/**
 * Props for MobileSharedSidebar
 */
export interface MobileSharedSidebarProps extends SharedDashboardSidebarProps {
  /** Whether the mobile sidebar is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * MobileSharedSidebar - Mobile sidebar using Sheet component
 *
 * Visible only on mobile devices, uses Radix UI Sheet pattern.
 */
export function MobileSharedSidebar({
  role,
  showRoleSwitcher = false,
  availableRoles = [],
  onRoleSwitch,
  open,
  onOpenChange,
}: MobileSharedSidebarProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const config = getNavConfigByRole(role);
  const Icon = config.icon;

  // Close sheet on route change
  useEffect(() => {
    if (prevPathname.current !== pathname && open) {
      onOpenChange(false);
    }
    prevPathname.current = pathname;
  }, [pathname, open, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-80 p-0">
        <SheetHeader className="p-4 flex-row items-center space-y-0">
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
          >
            <div className="p-2 rounded-full bg-linear-to-br from-purple-400/10 to-purple-200/20 group-hover:from-purple-400/20 group-hover:to-purple-200/30 transition-all">
              <Icon className="w-5 h-5 text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <SheetTitle className="text-left text-base">{config.title}</SheetTitle>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
          </Link>
        </SheetHeader>

        {/* Role Switcher */}
        {showRoleSwitcher && availableRoles.length > 1 && onRoleSwitch && (
          <RoleSwitcher
            currentRole={role}
            availableRoles={availableRoles}
            onRoleSwitch={onRoleSwitch}
            isCollapsed={false}
          />
        )}

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4">
            <SidebarNavContent
              sections={config.sections}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to Site
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SharedDashboardSidebar;
