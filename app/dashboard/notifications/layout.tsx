"use client";

import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import {
  MobileUserSidebar,
  UserSidebar,
} from "@/components/dashboard/user-sidebar";
import { useState } from "react";

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <UserSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <MobileUserSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </div>
  );
}
