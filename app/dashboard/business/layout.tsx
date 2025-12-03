"use client";

import {
  SharedDashboardSidebar,
  MobileSharedSidebar,
} from "@/components/dashboard/shared-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { useState } from "react";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <SharedDashboardSidebar role="business" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
      <MobileSharedSidebar
        role="business"
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </div>
  );
}
