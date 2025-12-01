"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function AdminOrganizationsPage() {
  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Organizations"
        description="Manage all organizations on the platform"
        actions={
          <Button asChild>
            <Link href="/dashboard/organizations/new">
              <Building2 className="w-4 h-4 mr-2" />
              Create Organization
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Organizations management coming soon</p>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
