/**
 * Centralized Navigation Configuration
 *
 * Defines navigation items for all dashboard sidebars.
 * Used by SharedDashboardSidebar component for role-based navigation.
 */

import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  BookOpen,
  Bookmark,
  Brain,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  FileText,
  GraduationCap,
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
  StickyNote,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  AlertTriangle,
  Briefcase,
  PieChart,
} from "lucide-react";

/**
 * User roles in the system
 */
export type UserRole = "student" | "instructor" | "admin" | "business";

/**
 * Section color configuration for visual distinction
 */
export type SectionColor = "blue" | "purple" | "pink" | "green" | "amber" | "slate";

/**
 * Navigation item definition
 */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

/**
 * Navigation section definition
 */
export interface NavSection {
  title: string;
  color: SectionColor;
  items: NavItem[];
}


/**
 * Dashboard configuration per role
 */
export interface DashboardConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  sections: NavSection[];
}

/**
 * Color styles for each section
 */
export const sectionColors: Record<
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

/**
 * Student dashboard navigation configuration
 */
export const studentNavConfig: DashboardConfig = {
  title: "Student Dashboard",
  subtitle: "Your learning journey",
  icon: Brain,
  sections: [
    {
      title: "Learning",
      color: "blue",
      items: [
        { title: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
        { title: "My Courses", href: "/dashboard/student/courses", icon: BookOpen },
        { title: "Certificates", href: "/dashboard/student/certificates", icon: Award },
        { title: "Bookmarks", href: "/dashboard/student/bookmarks", icon: Bookmark },
      ],
    },
    {
      title: "Progress",
      color: "green",
      items: [
        { title: "Notes", href: "/dashboard/student/notes", icon: StickyNote },
        { title: "Achievements", href: "/dashboard/student/achievements", icon: Trophy },
        { title: "Goals", href: "/dashboard/student/goals", icon: Target },
        { title: "Progress", href: "/dashboard/student/progress", icon: TrendingUp },
      ],
    },
  ],
};


/**
 * Instructor dashboard navigation configuration
 */
export const instructorNavConfig: DashboardConfig = {
  title: "Instructor Dashboard",
  subtitle: "Teaching resources",
  icon: GraduationCap,
  sections: [
    {
      title: "Overview",
      color: "blue",
      items: [
        { title: "Dashboard", href: "/dashboard/instructor", icon: LayoutDashboard },
        { title: "Analytics", href: "/dashboard/instructor/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Content",
      color: "purple",
      items: [
        { title: "My Courses", href: "/dashboard/instructor/courses", icon: BookOpen },
        { title: "Resources", href: "/dashboard/instructor/resources", icon: FileText },
        { title: "Students", href: "/dashboard/instructor/students", icon: Users },
      ],
    },
    {
      title: "Tools",
      color: "green",
      items: [
        { title: "Quizzes", href: "/dashboard/instructor/quizzes", icon: ClipboardList },
        { title: "Events", href: "/dashboard/instructor/events", icon: Calendar },
      ],
    },
  ],
};

/**
 * Business dashboard navigation configuration
 */
export const businessNavConfig: DashboardConfig = {
  title: "Business Dashboard",
  subtitle: "Team management",
  icon: Briefcase,
  sections: [
    {
      title: "Overview",
      color: "blue",
      items: [
        { title: "Dashboard", href: "/dashboard/business", icon: LayoutDashboard },
        { title: "Analytics", href: "/dashboard/business/analytics", icon: PieChart },
      ],
    },
    {
      title: "Team",
      color: "purple",
      items: [
        { title: "Members", href: "/dashboard/business/members", icon: Users },
        { title: "Invitations", href: "/dashboard/business/invitations", icon: UserPlus },
        { title: "Groups", href: "/dashboard/business/groups", icon: Building2 },
      ],
    },
    {
      title: "Learning",
      color: "green",
      items: [
        { title: "Courses", href: "/dashboard/business/courses", icon: BookOpen },
        { title: "Progress", href: "/dashboard/business/progress", icon: TrendingUp },
        { title: "Reports", href: "/dashboard/business/reports", icon: FileText },
      ],
    },
  ],
};


/**
 * Admin dashboard navigation configuration
 */
export const adminNavConfig: DashboardConfig = {
  title: "Admin Panel",
  subtitle: "Platform Management",
  icon: Brain,
  sections: [
    {
      title: "Overview",
      color: "blue",
      items: [
        { title: "Dashboard", href: "/dashboard/admin/overview", icon: LayoutDashboard },
        { title: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Content",
      color: "purple",
      items: [
        { title: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
        { title: "Quizzes", href: "/dashboard/admin/quizzes", icon: ClipboardList },
        { title: "Events", href: "/dashboard/admin/events", icon: Calendar },
        { title: "Blog", href: "/dashboard/admin/blog", icon: FileText },
        { title: "Resources", href: "/dashboard/admin/resources", icon: Award },
        { title: "Testimonials", href: "/dashboard/admin/testimonials", icon: Quote },
        { title: "FAQs", href: "/dashboard/admin/cms/faqs", icon: MessageSquare },
        { title: "Media Library", href: "/dashboard/admin/cms/media", icon: Image },
      ],
    },
    {
      title: "Marketing",
      color: "pink",
      items: [
        { title: "Announcements", href: "/dashboard/admin/cms/announcements", icon: AlertTriangle },
        { title: "Coupons", href: "/dashboard/admin/coupons", icon: Ticket },
        { title: "SEO Settings", href: "/dashboard/admin/cms/seo", icon: Search },
        { title: "Redirects", href: "/dashboard/admin/cms/redirects", icon: Link2 },
      ],
    },
    {
      title: "Platform",
      color: "green",
      items: [
        { title: "Users", href: "/dashboard/admin/users", icon: Users },
        { title: "Organizations", href: "/dashboard/admin/organizations", icon: Building2 },
        { title: "Credits", href: "/dashboard/admin/credits", icon: Coins },
        { title: "Waitlist", href: "/dashboard/admin/waitlist", icon: Mail },
        { title: "Invitations", href: "/dashboard/admin/invitations", icon: UserPlus },
      ],
    },
    {
      title: "Design",
      color: "amber",
      items: [
        { title: "Theme", href: "/dashboard/admin/cms/theme", icon: Palette },
        { title: "Content Blocks", href: "/dashboard/admin/cms/blocks", icon: LayoutGrid },
        { title: "Navigation", href: "/dashboard/admin/cms/navigation", icon: Navigation },
        { title: "Email Templates", href: "/dashboard/admin/cms/email-templates", icon: Mail },
        { title: "Contact Forms", href: "/dashboard/admin/cms/forms", icon: ClipboardList },
      ],
    },
    {
      title: "System",
      color: "slate",
      items: [
        { title: "Products", href: "/dashboard/admin/products", icon: ShoppingCart },
        { title: "Settings", href: "/dashboard/admin/settings", icon: Settings },
      ],
    },
  ],
};

/**
 * Get navigation config by role
 */
export function getNavConfigByRole(role: UserRole): DashboardConfig {
  switch (role) {
    case "student":
      return studentNavConfig;
    case "instructor":
      return instructorNavConfig;
    case "business":
      return businessNavConfig;
    case "admin":
      return adminNavConfig;
    default:
      return studentNavConfig;
  }
}

/**
 * Get all navigation items for a role (flattened)
 */
export function getNavItemsForRole(role: UserRole): NavItem[] {
  const config = getNavConfigByRole(role);
  return config.sections.flatMap((section) => section.items);
}

/**
 * Export icons for use in components
 */
export { Home, ChevronLeft, ChevronRight };
