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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  Loader2,
  Mail,
  MoreVertical,
  Search,
  Ticket,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

interface Registration {
  id: string;
  user_id: string | null;
  event_id: string | null;
  ticket_code: string;
  registered_at: string | null;
  attended: boolean | null;
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

interface EventInfo {
  id: string;
  title: string;
  capacity: number | null;
  start_datetime: string;
}

interface Stats {
  total: number;
  attended: number;
  pending: number;
  capacity: number | null;
  fillRate: number;
}

export default function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = use(params);
  const { data, loading, execute } = useAsync<{
    event: EventInfo;
    registrations: Registration[];
    stats: Stats;
  }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState<
    "all" | "attended" | "pending"
  >("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = () =>
    execute(async () => {
      const response = await fetch(`/api/events/${eventId}/registrations`);
      if (!response.ok) throw new Error("Failed to fetch registrations");
      return response.json();
    });

  const updateAttendance = async (
    registrationId: string,
    attended: boolean
  ) => {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: registrationId, attended }),
      });

      if (response.ok) {
        toast.success(
          attended ? "Marked as attended" : "Marked as not attended"
        );
        fetchRegistrations();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      logger.error("Error updating attendance:", error as Error);
      toast.error("Failed to update attendance");
    }
  };

  const handleBulkUpdate = async (attended: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);

    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/events/${eventId}/registrations`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registration_id: id, attended }),
        })
      );

      await Promise.all(promises);
      toast.success(`Updated ${selectedIds.size} registrations`);
      setSelectedIds(new Set());
      fetchRegistrations();
    } catch (error) {
      logger.error("Error bulk updating:", error as Error);
      toast.error("Failed to update some registrations");
    } finally {
      setBulkUpdating(false);
    }
  };

  const exportRegistrations = () => {
    if (!data?.registrations) return;

    const csvContent = [
      ["Name", "Email", "Ticket Code", "Registered At", "Attended"].join(","),
      ...data.registrations.map((r) =>
        [
          r.user?.full_name || "N/A",
          r.user?.email || "N/A",
          r.ticket_code,
          r.registered_at
            ? format(new Date(r.registered_at), "yyyy-MM-dd HH:mm")
            : "N/A",
          r.attended ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${eventId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Registrations exported");
  };

  const registrations = data?.registrations || [];
  const stats = data?.stats;
  const event = data?.event;

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      (reg.user?.full_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (reg.user?.email?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      reg.ticket_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      attendanceFilter === "all" ||
      (attendanceFilter === "attended" && reg.attended) ||
      (attendanceFilter === "pending" && !reg.attended);

    return matchesSearch && matchesFilter;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard/admin/events"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold mb-2">Event Registrations</h1>
          <p className="text-muted-foreground">{event?.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportRegistrations}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Link href={`/dashboard/admin/events/${eventId}/edit`}>
            <Button variant="outline">Edit Event</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCardGrid columns={4} className="mb-8">
        <StatsCard
          title="Total Registered"
          value={stats?.total || 0}
          description={
            stats?.capacity
              ? `of ${stats.capacity} capacity`
              : "No capacity limit"
          }
          icon={<Users className="h-5 w-5" />}
          accent="blue"
        />
        <StatsCard
          title="Attended"
          value={stats?.attended || 0}
          description={
            stats?.total
              ? `${Math.round((stats.attended / stats.total) * 100)}% attendance`
              : "0%"
          }
          icon={<UserCheck className="h-5 w-5" />}
          accent="green"
        />
        <StatsCard
          title="Pending"
          value={stats?.pending || 0}
          description="Not yet attended"
          icon={<UserX className="h-5 w-5" />}
          accent="amber"
        />
        <StatsCard
          title="Event Date"
          value={
            event?.start_datetime
              ? format(new Date(event.start_datetime), "MMM d, yyyy")
              : "N/A"
          }
          description={
            event?.start_datetime
              ? format(new Date(event.start_datetime), "h:mm a")
              : ""
          }
          icon={<Calendar className="h-5 w-5" />}
          accent="purple"
        />
      </StatsCardGrid>

      {/* Filters & Bulk Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ticket code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search registrations"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={attendanceFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setAttendanceFilter("all")}
              >
                All ({registrations.length})
              </Button>
              <Button
                variant={
                  attendanceFilter === "attended" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setAttendanceFilter("attended")}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Attended ({stats?.attended || 0})
              </Button>
              <Button
                variant={attendanceFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setAttendanceFilter("pending")}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Pending ({stats?.pending || 0})
              </Button>
            </div>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mt-4 p-2 bg-muted rounded-lg">
              <span className="text-sm">{selectedIds.size} selected</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkUpdate(true)}
                disabled={bulkUpdating}
              >
                <UserCheck className="w-3 h-3 mr-1" />
                Mark Attended
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkUpdate(false)}
                disabled={bulkUpdating}
              >
                <UserX className="w-3 h-3 mr-1" />
                Mark Pending
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            Manage attendee registrations and check-ins
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {registrations.length === 0 ? (
                <>
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No registrations yet</p>
                </>
              ) : (
                "No registrations found matching your search."
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedIds.size === filteredRegistrations.length &&
                        filteredRegistrations.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all registrations"
                    />
                  </TableHead>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Ticket Code</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(reg.id)}
                        onCheckedChange={() => toggleSelect(reg.id)}
                        aria-label={`Select ${reg.user?.full_name || "registration"}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {reg.user?.full_name || "Unknown User"}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {reg.user?.email || "No email"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        <Ticket className="w-3 h-3 mr-1" />
                        {reg.ticket_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {reg.registered_at
                        ? format(
                            new Date(reg.registered_at),
                            "MMM d, yyyy h:mm a"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {reg.attended ? (
                        <Badge
                          variant="default"
                          className="bg-green-500/10 text-green-500"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Attended
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open registration actions menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {reg.attended ? (
                            <DropdownMenuItem
                              onClick={() => updateAttendance(reg.id, false)}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Mark as Pending
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => updateAttendance(reg.id, true)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Mark as Attended
                            </DropdownMenuItem>
                          )}
                          {reg.user?.email && (
                            <DropdownMenuItem
                              onClick={() => {
                                window.location.href = `mailto:${reg.user?.email}`;
                              }}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
