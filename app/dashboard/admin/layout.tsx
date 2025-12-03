"use client";

import {
  SharedDashboardSidebar,
  MobileSharedSidebar,
} from "@/components/dashboard/shared-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <SharedDashboardSidebar role="admin" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with breadcrumbs and mobile menu trigger */}
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile Sidebar */}
      <MobileSharedSidebar
        role="admin"
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </div>
  );
}
