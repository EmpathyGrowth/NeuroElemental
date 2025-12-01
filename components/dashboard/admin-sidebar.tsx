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
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  FileText,
  Home,
  Image,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  Mail,
  MessageSquare,
  Navigation,
  Palette,
  Quote,
  Search,
  Settings,
  ShoppingCart,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// Section color configuration for visual distinction
type SectionColor = "blue" | "purple" | "pink" | "green" | "amber" | "slate";

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
  pink: {
    icon: "text-pink-500",
    active: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    indicator: "bg-pink-500",
  },
  green: {
    icon: "text-green-500",
    active: "bg-green-500/10 text-green-600 dark:text-green-400",
    indicator: "bg-green-500",
  },
  amber: {
    icon: "text-amber-500",
    active: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    indicator: "bg-amber-500",
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
        title: "Dashboard",
        href: "/dashboard/admin/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/dashboard/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Content",
    color: "purple",
    items: [
      { title: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
      {
        title: "Quizzes",
        href: "/dashboard/admin/quizzes",
        icon: ClipboardList,
      },
      { title: "Events", href: "/dashboard/admin/events", icon: Calendar },
      { title: "Blog", href: "/dashboard/admin/blog", icon: FileText },
      { title: "Resources", href: "/dashboard/admin/resources", icon: Award },
      {
        title: "Testimonials",
        href: "/dashboard/admin/testimonials",
        icon: Quote,
      },
      { title: "FAQs", href: "/dashboard/admin/cms/faqs", icon: MessageSquare },
      {
        title: "Media Library",
        href: "/dashboard/admin/cms/media",
        icon: Image,
      },
    ],
  },
  {
    title: "Marketing",
    color: "pink",
    items: [
      {
        title: "Announcements",
        href: "/dashboard/admin/cms/announcements",
        icon: AlertTriangle,
      },
      { title: "Coupons", href: "/dashboard/admin/coupons", icon: Ticket },
      { title: "SEO Settings", href: "/dashboard/admin/cms/seo", icon: Search },
      {
        title: "Redirects",
        href: "/dashboard/admin/cms/redirects",
        icon: Link2,
      },
    ],
  },
  {
    title: "Platform",
    color: "green",
    items: [
      { title: "Users", href: "/dashboard/admin/users", icon: Users },
      {
        title: "Organizations",
        href: "/dashboard/admin/organizations",
        icon: Building2,
      },
      { title: "Credits", href: "/dashboard/admin/credits", icon: Coins },
      { title: "Waitlist", href: "/dashboard/admin/waitlist", icon: Mail },
      {
        title: "Invitations",
        href: "/dashboard/admin/invitations",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Design",
    color: "amber",
    items: [
      { title: "Theme", href: "/dashboard/admin/cms/theme", icon: Palette },
      {
        title: "Content Blocks",
        href: "/dashboard/admin/cms/blocks",
        icon: LayoutGrid,
      },
      {
        title: "Navigation",
        href: "/dashboard/admin/cms/navigation",
        icon: Navigation,
      },
      {
        title: "Email Templates",
        href: "/dashboard/admin/cms/email-templates",
        icon: Mail,
      },
      {
        title: "Contact Forms",
        href: "/dashboard/admin/cms/forms",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "System",
    color: "slate",
    items: [
      {
        title: "Products",
        href: "/dashboard/admin/products",
        icon: ShoppingCart,
      },
      { title: "Settings", href: "/dashboard/admin/settings", icon: Settings },
    ],
  },
];

/**
 * Reusable navigation content component
 */
function SidebarNavContent({
  onNavigate,
  isCollapsed = false,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-4">
      {navSections.map((section) => {
        const colorConfig = sectionColors[section.color];

        return (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
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
                            className={cn(
                              "w-5 h-5",
                              isActive ? "" : colorConfig.icon
                            )}
                          />
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
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "" : colorConfig.icon
                    )}
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
 * Desktop sidebar - hidden on mobile, with collapsible state
 */
export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", String(newState));
  };

  return (
    <aside
      className={cn(
        "border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
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
              ? "p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20"
              : "flex items-center gap-2 min-w-0"
          )}
          title="Back to main site"
        >
          {isCollapsed ? (
            <Brain className="w-5 h-5 text-purple-400" />
          ) : (
            <>
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20 group-hover:from-purple-400/20 group-hover:to-purple-200/30 transition-all">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold truncate">Admin Panel</h2>
                <p className="text-xs text-muted-foreground truncate">
                  Management
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
            className="h-8 w-8 flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expand button when collapsed - positioned at bottom of header area */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 mx-auto my-1"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        <SidebarNavContent isCollapsed={isCollapsed} />
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
                  <Home className="w-5 h-5" />
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
            <Home className="w-4 h-4" />
            Back to Site
          </Link>
        )}
      </div>
    </aside>
  );
}

/**
 * Mobile sidebar using Sheet component - visible only on mobile
 */
interface MobileAdminSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileAdminSidebar({
  open,
  onOpenChange,
}: MobileAdminSidebarProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

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
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20 group-hover:from-purple-400/20 group-hover:to-purple-200/30 transition-all">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <SheetTitle className="text-left text-base">
                Admin Panel
              </SheetTitle>
              <p className="text-xs text-muted-foreground">
                Platform Management
              </p>
            </div>
          </Link>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-4">
            <SidebarNavContent onNavigate={() => onOpenChange(false)} />
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
