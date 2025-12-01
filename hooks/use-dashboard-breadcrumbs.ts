'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { BreadcrumbItem } from '@/components/ui/breadcrumbs';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  Award,
  FileText,
  ShoppingCart,
  BarChart3,
  Settings,
  Building2,
  Coins,
  Ticket,
  Mail,
  UserPlus,
  User,
  GraduationCap,
  Briefcase,
  School,
  Star,
  Bell,
  Bookmark,
  StickyNote,
  Trophy,
  Palette,
  Brain,
} from 'lucide-react';
import React from 'react';

/**
 * Mapping of URL segments to human-readable labels
 */
const SEGMENT_LABELS: Record<string, string> = {
  // Main sections
  dashboard: 'Dashboard',
  admin: 'Admin',
  student: 'Student',
  instructor: 'Instructor',
  business: 'Business',
  school: 'School',

  // Admin pages
  courses: 'Courses',
  events: 'Events',
  blog: 'Blog',
  users: 'Users',
  resources: 'Resources',
  products: 'Products',
  analytics: 'Analytics',
  settings: 'Settings',
  organizations: 'Organizations',
  credits: 'Credits',
  coupons: 'Coupons',
  waitlist: 'Waitlist',
  invitations: 'Invitations',
  quizzes: 'Quizzes',
  overview: 'Overview',

  // User pages
  profile: 'Profile',
  billing: 'Billing',
  plans: 'Plans',
  notifications: 'Notifications',
  bookmarks: 'Bookmarks',
  notes: 'Notes',
  achievements: 'Achievements',

  // Settings sub-pages
  appearance: 'Appearance',
  learning: 'Learning Preferences',

  // Actions
  new: 'New',
  edit: 'Edit',
  certification: 'Certification',
  registrations: 'Registrations',
};

/**
 * Icons for specific URL segments (React elements, created lazily)
 */
const getSegmentIcon = (segment: string): React.ReactNode => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    dashboard: LayoutDashboard,
    admin: Settings,
    student: GraduationCap,
    instructor: Award,
    business: Briefcase,
    school: School,
    courses: BookOpen,
    events: Calendar,
    blog: FileText,
    users: Users,
    resources: Award,
    products: ShoppingCart,
    analytics: BarChart3,
    settings: Settings,
    organizations: Building2,
    credits: Coins,
    coupons: Ticket,
    waitlist: Mail,
    invitations: UserPlus,
    profile: User,
    billing: Coins,
    notifications: Bell,
    bookmarks: Bookmark,
    notes: StickyNote,
    achievements: Trophy,
    appearance: Palette,
    learning: Brain,
    quizzes: Star,
    overview: LayoutDashboard,
  };

  const IconComponent = iconMap[segment];
  if (IconComponent) {
    return React.createElement(IconComponent, { className: 'h-4 w-4' });
  }
  return null;
};

/**
 * Build a human-readable label from a URL segment
 */
function formatSegmentLabel(segment: string): string {
  // Check custom mapping first
  if (SEGMENT_LABELS[segment]) {
    return SEGMENT_LABELS[segment];
  }

  // Check if it looks like a UUID (skip showing as breadcrumb text)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return 'Details';
  }

  // Convert kebab-case or snake_case to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Hook to generate dashboard breadcrumbs from the current pathname
 * @param customLabels - Optional override for specific path segments
 * @returns Array of BreadcrumbItem for use with Breadcrumbs component
 */
export function useDashboardBreadcrumbs(
  customLabels?: Record<string, string>
): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    if (!pathname) return [];

    // Split path and filter empty segments
    const segments = pathname.split('/').filter(Boolean);

    // Build breadcrumb items
    const items: BreadcrumbItem[] = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const isCurrentPage = index === segments.length - 1;

      // Use custom label if provided, otherwise format the segment
      const label = customLabels?.[segment] || formatSegmentLabel(segment);

      return {
        id: href,
        label,
        href,
        icon: getSegmentIcon(segment),
        isCurrentPage,
      };
    });

    return items;
  }, [pathname, customLabels]);
}

/**
 * Hook to get the current page title from the breadcrumb path
 */
export function usePageTitle(customTitle?: string): string {
  const breadcrumbs = useDashboardBreadcrumbs();

  return useMemo(() => {
    if (customTitle) return customTitle;
    if (breadcrumbs.length === 0) return 'Dashboard';

    const lastItem = breadcrumbs[breadcrumbs.length - 1];
    return lastItem.label;
  }, [breadcrumbs, customTitle]);
}
