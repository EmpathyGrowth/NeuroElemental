"use client";

import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import {
  InstructorSidebar,
  MobileInstructorSidebar,
} from "@/components/dashboard/instructor-sidebar";
import { useState } from "react";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
      <MobileInstructorSidebar
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </div>
  );
}
