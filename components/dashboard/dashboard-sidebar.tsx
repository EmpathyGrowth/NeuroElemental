"use client";

/**
 * Unified Dashboard Sidebar Component
 * Replaces admin-sidebar, instructor-sidebar, and student-sidebar with a single configurable component
 * Reduces code duplication from ~620 lines to ~150 lines
 */

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/**
 * Navigation item configuration
 */
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

/**
 * Navigation section (group of items with a label)
 */
export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Sidebar configuration props
 */
export interface DashboardSidebarConfig {
  title: string;
  subtitle: string;
  sections: NavSection[];
  /** Use startsWith matching for active state (default: exact match only) */
  usePathPrefix?: boolean;
}

interface SidebarNavContentProps {
  sections: NavSection[];
  usePathPrefix?: boolean;
  onNavigate?: () => void;
}

/**
 * Reusable navigation content component
 */
function SidebarNavContent({
  sections,
  usePathPrefix = false,
  onNavigate,
}: SidebarNavContentProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (usePathPrefix) {
      return pathname === href || pathname.startsWith(href + "/");
    }
    return pathname === href;
  };

  return (
    <nav className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-1">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.label}
            </h3>
          </div>
          {section.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/**
 * Desktop sidebar - hidden on mobile
 */
export function DashboardSidebar({
  title,
  subtitle,
  sections,
  usePathPrefix,
}: DashboardSidebarConfig) {
  return (
    <aside className="w-64 border-r border-border/50 bg-background/50 p-4 hidden lg:block overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold px-3 mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground px-3">{subtitle}</p>
      </div>
      <SidebarNavContent sections={sections} usePathPrefix={usePathPrefix} />
    </aside>
  );
}

/**
 * Mobile sidebar using Sheet component - visible only on mobile/tablet
 */
export function MobileDashboardSidebar({
  title,
  subtitle,
  sections,
  usePathPrefix,
}: DashboardSidebarConfig) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">{title}</SheetTitle>
            <p className="text-sm text-muted-foreground text-left">
              {subtitle}
            </p>
          </SheetHeader>
          <div className="p-4 overflow-y-auto h-[calc(100vh-5rem)]">
            <SidebarNavContent
              sections={sections}
              usePathPrefix={usePathPrefix}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
