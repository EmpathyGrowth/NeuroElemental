"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  DollarSign,
  FolderOpen,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// Section color configuration for visual distinction
type SectionColor = "blue" | "purple" | "green";

interface NavSection {
  title: string;
  color: SectionColor;
  items: NavItem[];
}

// Color styles for each section
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
};

const navSections: NavSection[] = [
  {
    title: "Teaching",
    color: "blue",
    items: [
      {
        title: "Overview",
        href: "/dashboard/instructor",
        icon: LayoutDashboard,
      },
      {
        title: "My Courses",
        href: "/dashboard/instructor/courses",
        icon: BookOpen,
      },
      {
        title: "Students",
        href: "/dashboard/instructor/students",
        icon: Users,
      },
      {
        title: "Analytics",
        href: "/dashboard/instructor/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Content",
    color: "purple",
    items: [
      {
        title: "Resources",
        href: "/dashboard/instructor/resources",
        icon: FolderOpen,
      },
      {
        title: "Certification",
        href: "/dashboard/instructor/certification",
        icon: Award,
      },
    ],
  },
  {
    title: "Business",
    color: "green",
    items: [
      {
        title: "Earnings",
        href: "/dashboard/instructor/earnings",
        icon: DollarSign,
      },
      {
        title: "Reviews",
        href: "/dashboard/instructor/reviews",
        icon: MessageSquare,
      },
      {
        title: "Settings",
        href: "/dashboard/instructor/settings",
        icon: Settings,
      },
    ],
  },
];

/**
 * Reusable navigation content component
 */
function SidebarNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {navSections.map((section) => {
        const colorConfig = sectionColors[section.color];

        return (
          <div key={section.title} className="space-y-1">
            <div className="px-3 mb-2 flex items-center gap-2">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  colorConfig.indicator
                )}
              />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

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
                    className={cn("w-4 h-4", isActive ? "" : colorConfig.icon)}
                  />
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
        );
      })}
    </nav>
  );
}

/**
 * Desktop sidebar - hidden on mobile/tablet
 */
export function InstructorSidebar() {
  return (
    <aside className="w-64 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block overflow-y-auto">
      <div className="h-16 px-4 flex items-center gap-2">
        <div className="p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate">
            Instructor Dashboard
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            Manage your courses
          </p>
        </div>
      </div>
      <div className="p-4">
        <SidebarNavContent />
      </div>
    </aside>
  );
}

/**
 * Mobile sidebar using Sheet component - visible only on mobile
 */
interface MobileInstructorSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileInstructorSidebar({
  open,
  onOpenChange,
}: MobileInstructorSidebarProps) {
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
            <SheetTitle className="text-left text-base">
              Instructor Dashboard
            </SheetTitle>
            <p className="text-xs text-muted-foreground text-left">
              Manage your courses
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
