"use client";

import {
  BusinessSidebar,
  MobileBusinessSidebar,
} from "@/components/dashboard/business-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { useAsync } from "@/hooks/use-async";
import { useEffect, useState } from "react";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: orgsData, execute: fetchOrgs } = useAsync<{
    organizations: Array<{ id: string }>;
  }>();

  useEffect(() => {
    fetchOrgs(async () => {
      const res = await fetch("/api/organizations");
      if (!res.ok) return { organizations: [] };
      return res.json();
    });
  }, [fetchOrgs]);

  useEffect(() => {
    if (orgsData?.organizations?.length && !selectedOrgId) {
      setSelectedOrgId(orgsData.organizations[0].id);
    }
  }, [orgsData, selectedOrgId]);

  return (
    <div className="flex min-h-screen">
      <BusinessSidebar orgId={selectedOrgId} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
      <MobileBusinessSidebar
        orgId={selectedOrgId || ""}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </div>
  );
}
