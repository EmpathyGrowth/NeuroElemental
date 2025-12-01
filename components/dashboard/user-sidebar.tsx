"use client";

/**
 * User Sidebar Component
 * For shared dashboard pages (notifications, profile, settings) accessible by all users
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Bell,
  Bookmark,
  Brain,
  CreditCard,
  GraduationCap,
  Settings,
  StickyNote,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Section color configuration
type SectionColor = "blue" | "purple" | "green" | "slate";

const sectionColors: Record<
  SectionColor,
  { icon: string; active: string; indicator: string }
> = {
  blue: {
    icon: "text-blue-500",
    active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    indicator: "bg-blue-500",
  },
  purple: {
    icon: "text-purple-500",
    active: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    indicator: "bg-purple-500",
  },
  green: {
    icon: "text-green-500",
    active: "bg-green-500/10 text-green-600 dark:text-green-400",
    indicator: "bg-green-500",
  },
  slate: {
    icon: "text-slate-500",
    active: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    indicator: "bg-slate-500",
  },
};

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
  color: SectionColor;
}

const navSections: NavSection[] = [
  {
    label: "Account",
    color: "blue",
    items: [
      { title: "Profile", href: "/dashboard/profile", icon: User },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
  {
    label: "Learning",
    color: "purple",
    items: [
      { title: "My Courses", href: "/dashboard/student", icon: GraduationCap },
      { title: "Achievements", href: "/dashboard/achievements", icon: Trophy },
      { title: "Notes", href: "/dashboard/notes", icon: StickyNote },
      { title: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
    ],
  },
  {
    label: "Billing",
    color: "green",
    items: [{ title: "Billing", href: "/dashboard/billing", icon: CreditCard }],
  },
];

function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="space-y-6">
      {navSections.map((section) => {
        const colorStyle = sectionColors[section.color];
        return (
          <div key={section.label} className="space-y-1">
            <div className="px-3 mb-2 flex items-center gap-2">
              <div
                className={cn("w-1.5 h-1.5 rounded-full", colorStyle.indicator)}
              />
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
                      ? colorStyle.active
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className={cn("w-4 h-4", !active && colorStyle.icon)} />
                  <span className="flex-1">{item.title}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function UserSidebar() {
  return (
    <aside className="w-64 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block overflow-y-auto">
      <div className="h-16 px-4 flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
        >
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20 group-hover:from-purple-400/20 group-hover:to-purple-200/30 transition-all">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate">My Account</h2>
            <p className="text-xs text-muted-foreground truncate">
              Settings & preferences
            </p>
          </div>
        </Link>
      </div>
      <div className="p-4">
        <SidebarNavContent />
      </div>
    </aside>
  );
}

interface MobileUserSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileUserSidebar({
  open,
  onOpenChange,
}: MobileUserSidebarProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname && open) {
      onOpenChange(false);
    }
    prevPathname.current = pathname;
  }, [pathname, open, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-80 p-0">
        <SheetHeader className="p-4 flex-row items-center gap-2 space-y-0">
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <SheetTitle className="text-left text-base">My Account</SheetTitle>
            <p className="text-xs text-muted-foreground text-left">
              Settings & preferences
            </p>
          </div>
        </SheetHeader>
        <div className="p-4 overflow-y-auto h-[calc(100vh-5rem)]">
          <SidebarNavContent onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
