'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Platform Overview',
    href: '/dashboard/admin/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Courses',
    href: '/dashboard/admin/courses',
    icon: BookOpen,
  },
  {
    title: 'Events',
    href: '/dashboard/admin/events',
    icon: Calendar,
  },
  {
    title: 'Blog',
    href: '/dashboard/admin/blog',
    icon: FileText,
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: Users,
  },
  {
    title: 'Resources',
    href: '/dashboard/admin/resources',
    icon: Award,
  },
  {
    title: 'Products',
    href: '/dashboard/admin/products',
    icon: ShoppingCart,
  },
  {
    title: 'Analytics',
    href: '/dashboard/admin/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/dashboard/admin/settings',
    icon: Settings,
  },
];

const b2bSidebarItems = [
  {
    title: 'Organizations',
    href: '/dashboard/admin/organizations',
    icon: Building2,
  },
  {
    title: 'Credits',
    href: '/dashboard/admin/credits',
    icon: Coins,
  },
  {
    title: 'Coupons',
    href: '/dashboard/admin/coupons',
    icon: Ticket,
  },
  {
    title: 'Waitlist',
    href: '/dashboard/admin/waitlist',
    icon: Mail,
  },
  {
    title: 'Invitations',
    href: '/dashboard/admin/invitations',
    icon: UserPlus,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border/50 bg-background/50 p-4 hidden lg:block overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold px-3 mb-1">Admin Panel</h2>
        <p className="text-sm text-muted-foreground px-3">Platform Management</p>
      </div>

      <nav className="space-y-6">
        {/* Main Admin Items */}
        <div className="space-y-1">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Core
            </h3>
          </div>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.title}
              </Link>
            );
          })}
        </div>

        {/* B2B Features */}
        <div className="space-y-1">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              B2B Features
            </h3>
          </div>
          {b2bSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
