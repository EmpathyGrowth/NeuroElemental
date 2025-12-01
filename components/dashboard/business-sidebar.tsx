"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Brain,
  Building2,
  Coins,
  FileText,
  Key,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  Webhook,
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
type SectionColor = "blue" | "green" | "purple" | "slate";

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
  green: {
    icon: "text-green-500",
    active: "bg-green-500/10 text-green-600 dark:text-green-400",
    indicator: "bg-green-500",
  },
  purple: {
    icon: "text-purple-500",
    active: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    indicator: "bg-purple-500",
  },
  slate: {
    icon: "text-slate-500",
    active: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    indicator: "bg-slate-500",
  },
};

const navSections: NavSection[] = [
  {
    title: "Overview",
    color: "blue",
    items: [
      {
        title: "Overview",
        href: "/dashboard/business",
        icon: LayoutDashboard,
      },
      {
        title: "Organizations",
        href: "/dashboard/organizations",
        icon: Building2,
      },
    ],
  },
  {
    title: "Management",
    color: "green",
    items: [
      {
        title: "Team Members",
        href: "/dashboard/organizations/[id]/invite",
        icon: Users,
      },
      {
        title: "Analytics",
        href: "/dashboard/organizations/[id]/analytics",
        icon: BarChart3,
      },
      {
        title: "Credits",
        href: "/dashboard/organizations/[id]/credits",
        icon: Coins,
      },
    ],
  },
  {
    title: "Developer",
    color: "purple",
    items: [
      {
        title: "API Keys",
        href: "/dashboard/organizations/[id]/api-keys",
        icon: Key,
      },
      {
        title: "Webhooks",
        href: "/dashboard/organizations/[id]/webhooks",
        icon: Webhook,
      },
      {
        title: "SSO",
        href: "/dashboard/organizations/[id]/sso",
        icon: Shield,
      },
      {
        title: "Audit Log",
        href: "/dashboard/organizations/[id]/audit",
        icon: FileText,
      },
    ],
  },
  {
    title: "Settings",
    color: "slate",
    items: [
      {
        title: "Settings",
        href: "/dashboard/organizations/[id]/settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarNavContentProps {
  orgId?: string;
  onNavigate?: () => void;
}

/**
 * Reusable navigation content component
 */
function SidebarNavContent({ orgId, onNavigate }: SidebarNavContentProps) {
  const pathname = usePathname();

  const resolveHref = (href: string) => {
    if (orgId && href.includes("[id]")) {
      return href.replace("[id]", orgId);
    }
    return href;
  };

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
              const href = resolveHref(item.href);
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              const isDisabled = href.includes("[id]") && !orgId;

              if (isDisabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                  >
                    <Icon
                      className={cn("w-4 h-4", colorConfig.icon, "opacity-50")}
                    />
                    <span className="flex-1">{item.title}</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={href}
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

interface BusinessSidebarProps {
  orgId?: string;
}

/**
 * Desktop sidebar - hidden on mobile/tablet
 */
export function BusinessSidebar({ orgId }: BusinessSidebarProps) {
  return (
    <aside className="w-64 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block overflow-y-auto">
      <div className="h-16 px-4 flex items-center gap-2">
        <div className="p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold truncate">Business Dashboard</h2>
          <p className="text-xs text-muted-foreground truncate">
            Manage your organization
          </p>
        </div>
      </div>
      <div className="p-4">
        <SidebarNavContent orgId={orgId} />
      </div>
    </aside>
  );
}

/**
 * Mobile sidebar using Sheet component - visible only on mobile
 */
interface MobileBusinessSidebarProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileBusinessSidebar({
  orgId,
  open,
  onOpenChange,
}: MobileBusinessSidebarProps) {
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
              Business Dashboard
            </SheetTitle>
            <p className="text-xs text-muted-foreground text-left">
              Manage your organization
            </p>
          </div>
        </SheetHeader>
        <div className="p-4 overflow-y-auto h-[calc(100vh-5rem)]">
          <SidebarNavContent
            orgId={orgId}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
