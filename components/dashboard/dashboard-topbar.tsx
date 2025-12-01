"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { NotificationBell } from "@/components/global/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/supabase";
import { cn } from "@/lib/utils";
import {
  Brain,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface DashboardTopbarProps {
  className?: string;
  onMenuClick?: () => void;
}

/**
 * Get breadcrumb items from pathname
 */
function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

  // Map of path segments to display labels
  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    admin: "Admin",
    instructor: "Instructor",
    student: "Student",
    overview: "Overview",
    courses: "Courses",
    events: "Events",
    blog: "Blog",
    users: "Users",
    resources: "Resources",
    products: "Products",
    analytics: "Analytics",
    settings: "Settings",
    cms: "CMS",
    content: "Content",
    faqs: "FAQs",
    navigation: "Navigation",
    media: "Media",
    seo: "SEO",
    redirects: "Redirects",
    theme: "Theme",
    organizations: "Organizations",
    credits: "Credits",
    coupons: "Coupons",
    waitlist: "Waitlist",
    invitations: "Invitations",
    profile: "Profile",
    notifications: "Notifications",
  };

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip 'dashboard' as first item if we're going deeper
    if (segment === "dashboard" && segments.length > 1) {
      return;
    }

    const label =
      labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label,
      href: currentPath,
      isLast: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}

export function DashboardTopbar({
  className,
  onMenuClick,
}: DashboardTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const breadcrumbs = getBreadcrumbs(pathname);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6",
        className
      )}
    >
      {/* Mobile Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 md:hidden group"
      >
        <div className="p-2 rounded-full bg-gradient-to-br from-purple-400/10 to-purple-200/20 group-hover:from-purple-400/20 group-hover:to-purple-200/30 transition-all">
          <Brain className="w-5 h-5 !text-purple-400" />
        </div>
      </Link>

      {/* Breadcrumbs - Hidden on very small screens */}
      <nav className="flex-1 min-w-0" aria-label="Breadcrumb">
        <ol className="hidden sm:flex items-center gap-1.5 text-sm">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only md:not-sr-only">Dashboard</span>
            </Link>
          </li>
          {breadcrumbs.map((crumb) => (
            <li key={crumb.href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              {crumb.isLast ? (
                <span className="font-medium text-foreground max-w-[150px] truncate md:max-w-none">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors max-w-[100px] truncate md:max-w-none"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>

        {/* Mobile: Just show current page title */}
        <h1 className="sm:hidden font-semibold text-sm truncate">
          {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
        </h1>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {isAuthenticated && (
          <>
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(profile?.full_name || user?.email || null)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || user?.email || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Mobile Menu Button */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
