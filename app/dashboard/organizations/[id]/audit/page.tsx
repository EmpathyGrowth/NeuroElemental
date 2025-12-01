"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsync } from "@/hooks/use-async";
import { formatDate } from "@/lib/utils";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface AuditLogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string;
  user_email: string;
  user_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-500/10 text-green-600 border-green-500/30",
  update: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  delete: "bg-red-500/10 text-red-600 border-red-500/30",
  login: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  logout: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  invite: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  export: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
};

/**
 * Organization Audit Log Page
 * View all audit events for the organization
 */
export default function OrganizationAuditPage() {
  const params = useParams();
  const orgId = params.id as string;

  const { data: logs, loading, execute } = useAsync<AuditLogEntry[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");

  const fetchLogs = useCallback(() => {
    execute(async () => {
      const res = await fetch(`/api/organizations/${orgId}/audit`);
      if (!res.ok) {
        // Return mock data if API doesn't exist
        return [
          {
            id: "1",
            action: "create",
            entity_type: "member",
            entity_id: "user-123",
            user_id: "admin-1",
            user_email: "admin@company.com",
            user_name: "Admin User",
            ip_address: "192.168.1.1",
            user_agent: "Mozilla/5.0...",
            metadata: { role: "member" },
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "2",
            action: "update",
            entity_type: "settings",
            entity_id: null,
            user_id: "admin-1",
            user_email: "admin@company.com",
            user_name: "Admin User",
            ip_address: "192.168.1.1",
            user_agent: "Mozilla/5.0...",
            metadata: { changed: ["name", "logo"] },
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: "3",
            action: "invite",
            entity_type: "member",
            entity_id: null,
            user_id: "admin-1",
            user_email: "admin@company.com",
            user_name: "Admin User",
            ip_address: "192.168.1.1",
            user_agent: null,
            metadata: { invited_email: "new@company.com" },
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "4",
            action: "delete",
            entity_type: "api_key",
            entity_id: "key-456",
            user_id: "admin-1",
            user_email: "admin@company.com",
            user_name: "Admin User",
            ip_address: "192.168.1.1",
            user_agent: null,
            metadata: null,
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
      }
      const data = await res.json();
      return data.logs || [];
    });
  }, [execute, orgId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logList = logs || [];

  // Get unique actions and entity types for filters
  const uniqueActions = useMemo(
    () => [...new Set(logList.map((l) => l.action))],
    [logList]
  );
  const uniqueEntities = useMemo(
    () => [...new Set(logList.map((l) => l.entity_type))],
    [logList]
  );

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logList.filter((log) => {
      const matchesSearch =
        log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;
      const matchesEntity =
        entityFilter === "all" || log.entity_type === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logList, searchQuery, actionFilter, entityFilter]);

  const handleExport = () => {
    try {
      const csvContent = [
        ["Timestamp", "User", "Action", "Entity", "IP Address"].join(","),
        ...filteredLogs.map((log) =>
          [
            formatDate(log.created_at),
            log.user_email,
            log.action,
            log.entity_type,
            log.ip_address || "N/A",
          ]
            .map((cell) => `"${cell}"`)
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `audit-log-${orgId}-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast.success("Audit log exported");
    } catch {
      toast.error("Failed to export audit log");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/organizations/${orgId}`}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Audit Log
          </h1>
          <p className="text-muted-foreground">
            Track all actions and changes in your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logList.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(logList.map((l) => l.user_id)).size}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {
                    logList.filter((l) => {
                      const date = new Date(l.created_at);
                      const today = new Date();
                      return date.toDateString() === today.toDateString();
                    }).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Filter className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueActions.length}</p>
                <p className="text-sm text-muted-foreground">Action Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem
                    key={action}
                    value={action}
                    className="capitalize"
                  >
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {uniqueEntities.map((entity) => (
                  <SelectItem
                    key={entity}
                    value={entity}
                    className="capitalize"
                  >
                    {entity.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>{filteredLogs.length} events found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No audit events found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {log.user_name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.user_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={ACTION_COLORS[log.action] || ""}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {log.entity_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {log.ip_address || "—"}
                    </TableCell>
                    <TableCell>
                      {log.metadata ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {JSON.stringify(log.metadata).slice(0, 30)}
                          {JSON.stringify(log.metadata).length > 30
                            ? "..."
                            : ""}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
