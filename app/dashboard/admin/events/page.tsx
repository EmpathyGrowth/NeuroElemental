"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import {
  BulkAction,
  Column,
  DataTable,
  FilterConfig,
  RowActionItem,
  RowActions,
  RowActionSeparator,
  StatusBadge,
} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { format } from "date-fns";
import {
  Archive,
  Building,
  Calendar,
  Copy,
  DollarSign,
  Edit,
  Eye,
  Plus,
  Send,
  Trash2,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_type: string;
  price_usd: number;
  capacity: number;
  location: string;
  start_datetime: string;
  end_datetime: string;
  is_published: boolean;
  spots_taken: number;
  registered: number;
}

const eventTypeConfig: Record<
  string,
  { label: string; icon: typeof Video; className: string }
> = {
  online_workshop: {
    label: "Online Workshop",
    icon: Video,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  in_person_workshop: {
    label: "In-Person",
    icon: Building,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  webinar: {
    label: "Webinar",
    icon: Video,
    className: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
  conference: {
    label: "Conference",
    icon: Building,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
};

export default function AdminEventsPage() {
  const router = useRouter();
  const { data: events, loading, execute } = useAsync<Event[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [registrationsDialog, setRegistrationsDialog] = useState<{
    open: boolean;
    event: Event | null;
  }>({
    open: false,
    event: null,
  });
  const { confirm, dialogProps } = useConfirmDialog();

  const fetchEvents = useCallback(() => {
    execute(async () => {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const result = await response.json();
      return result;
    });
  }, [execute]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedEvents([]);
  }, [searchQuery, typeFilter, statusFilter]);

  const handleDelete = (event: Event) => {
    confirm({
      title: "Delete Event",
      description: `Are you sure you want to delete "${event.title}"? This will also delete all registrations. This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/events/${event.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Event deleted successfully");
            fetchEvents();
          } else {
            throw new Error("Failed to delete event");
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error("Error deleting event:", err);
          toast.error("Failed to delete event. Please try again.");
        }
      },
    });
  };

  const handleDuplicate = async (event: Event) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${event.title} (Copy)`,
          description: event.description,
          event_type: event.event_type,
          price_usd: event.price_usd,
          capacity: event.capacity,
          location: event.location,
          is_published: false,
          start_datetime: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          end_datetime: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
          ).toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Event duplicated", {
          description: "The event has been duplicated as a draft.",
        });
        router.push(
          `/dashboard/admin/events/${result.event?.id || result.id}/edit`
        );
      } else {
        throw new Error("Failed to duplicate event");
      }
    } catch (error) {
      logger.error("Error duplicating event:", error as Error);
      toast.error("Failed to duplicate event. Please try again.");
    }
  };

  const handleBulkPublish = async (events: Event[]) => {
    try {
      const results = await Promise.allSettled(
        events.map((event) =>
          fetch(`/api/events/${event.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_published: true }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Published ${successful} events, ${failed} failed`);
      } else {
        toast.success(`Published ${successful} events`);
      }

      setSelectedEvents([]);
      fetchEvents();
    } catch (error) {
      logger.error("Error bulk publishing:", error as Error);
      toast.error("Failed to publish events");
    }
  };

  const handleBulkUnpublish = async (events: Event[]) => {
    try {
      const results = await Promise.allSettled(
        events.map((event) =>
          fetch(`/api/events/${event.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_published: false }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`Unpublished ${successful} events`);
      setSelectedEvents([]);
      fetchEvents();
    } catch (error) {
      logger.error("Error bulk unpublishing:", error as Error);
      toast.error("Failed to unpublish events");
    }
  };

  const handleBulkDelete = async (events: Event[]) => {
    try {
      const results = await Promise.allSettled(
        events.map((event) =>
          fetch(`/api/events/${event.id}`, { method: "DELETE" })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Deleted ${successful} events, ${failed} failed`);
      } else {
        toast.success(`Deleted ${successful} events`);
      }

      setSelectedEvents([]);
      fetchEvents();
    } catch (error) {
      logger.error("Error bulk deleting:", error as Error);
      toast.error("Failed to delete events");
    }
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData =
        selectedEvents.length > 0 ? selectedEvents : events || [];

      if (format === "csv") {
        const headers = [
          "Title",
          "Type",
          "Date",
          "Price",
          "Registered",
          "Capacity",
          "Status",
        ];
        const rows = exportData.map((event) => [
          event.title,
          eventTypeConfig[event.event_type]?.label || event.event_type,
          format === "csv"
            ? new Date(event.start_datetime).toLocaleDateString()
            : event.start_datetime,
          event.price_usd === 0 ? "FREE" : `$${event.price_usd}`,
          (event.spots_taken || 0).toString(),
          (event.capacity || "Unlimited").toString(),
          event.is_published ? "Published" : "Draft",
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `events_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `events_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} events to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting events:", error as Error);
      toast.error("Failed to export events");
    }
  };

  // Filter events
  const filteredEvents = useMemo(
    () =>
      (events || []).filter((event) => {
        const matchesSearch = event.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesType = !typeFilter || event.event_type === typeFilter;
        const matchesStatus =
          !statusFilter ||
          (statusFilter === "published" && event.is_published) ||
          (statusFilter === "draft" && !event.is_published);
        return matchesSearch && matchesType && matchesStatus;
      }),
    [events, searchQuery, typeFilter, statusFilter]
  );

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Stats calculations
  const stats = useMemo(() => {
    const allEvents = events || [];
    const upcomingEvents = allEvents.filter(
      (e) => new Date(e.start_datetime) > new Date() && e.is_published
    ).length;
    const totalRegistrations = allEvents.reduce(
      (sum, e) => sum + (e.spots_taken || 0),
      0
    );
    const totalRevenue = allEvents.reduce(
      (sum, e) => sum + (e.price_usd || 0) * (e.spots_taken || 0),
      0
    );
    const eventsWithRegistrations = allEvents.filter(
      (e) => (e.spots_taken || 0) > 0
    ).length;
    const avgAttendance =
      eventsWithRegistrations > 0
        ? Math.round(totalRegistrations / eventsWithRegistrations)
        : 0;
    const totalCapacity = allEvents.reduce(
      (sum, e) => sum + (e.capacity || 0),
      0
    );

    return {
      totalEvents: allEvents.length,
      upcomingEvents,
      totalRegistrations,
      totalRevenue,
      avgAttendance,
      totalCapacity,
    };
  }, [events]);

  // Table columns
  const columns: Column<Event>[] = [
    {
      id: "event",
      header: "Event",
      cell: (event) => (
        <div>
          <div className="font-medium">{event.title}</div>
          <div className="text-sm text-muted-foreground">
            /events/{event.slug}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      cell: (event) => {
        const config = eventTypeConfig[event.event_type] || {
          label: event.event_type,
          icon: Video,
          className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        };
        const EventTypeIcon = config.icon;
        return (
          <Badge className={`gap-1 ${config.className}`}>
            <EventTypeIcon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      id: "date",
      header: "Date",
      cell: (event) => (
        <div>
          <div className="font-medium">
            {format(new Date(event.start_datetime), "MMM d, yyyy")}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(event.start_datetime), "h:mm a")}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "price",
      header: "Price",
      cell: (event) =>
        event.price_usd === 0 ? (
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            FREE
          </Badge>
        ) : (
          <span className="font-medium">${event.price_usd || 0}</span>
        ),
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      id: "registered",
      header: "Registered",
      cell: (event) => {
        const fillRate = event.capacity
          ? ((event.spots_taken || 0) / event.capacity) * 100
          : 0;
        return (
          <div>
            <div className="font-medium">
              {event.spots_taken || 0} / {event.capacity || "∞"}
            </div>
            <div className="text-sm text-muted-foreground">
              {fillRate.toFixed(0)}% full
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (event) =>
        event.is_published ? (
          <StatusBadge status="active" label="Published" />
        ) : (
          <StatusBadge status="inactive" label="Draft" />
        ),
      sortable: true,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Event>[] = [
    {
      id: "publish",
      label: "Publish",
      icon: <Send className="h-3 w-3" />,
      onAction: handleBulkPublish,
    },
    {
      id: "unpublish",
      label: "Unpublish",
      icon: <Archive className="h-3 w-3" />,
      onAction: handleBulkUnpublish,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3 w-3" />,
      variant: "destructive",
      onAction: handleBulkDelete,
      requireConfirm: true,
      confirmMessage:
        "Are you sure you want to delete the selected events? This will also delete all registrations.",
    },
  ];

  // Filters
  const filters: FilterConfig[] = [
    {
      id: "type",
      label: "Type",
      type: "select",
      placeholder: "All types",
      options: [
        { label: "Online Workshop", value: "online_workshop" },
        { label: "In-Person", value: "in_person_workshop" },
        { label: "Webinar", value: "webinar" },
        { label: "Conference", value: "conference" },
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      placeholder: "All status",
      options: [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ],
    },
  ];

  // Row actions renderer
  const renderRowActions = (event: Event) => (
    <RowActions>
      <RowActionItem asChild>
        <Link href={`/events/${event.slug}`} target="_blank">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Link>
      </RowActionItem>
      <RowActionItem asChild>
        <Link href={`/dashboard/admin/events/${event.id}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Event
        </Link>
      </RowActionItem>
      <RowActionItem
        onClick={() => setRegistrationsDialog({ open: true, event })}
      >
        <Users className="mr-2 h-4 w-4" />
        View Registrations ({event.spots_taken || 0})
      </RowActionItem>
      <RowActionItem onClick={() => handleDuplicate(event)}>
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </RowActionItem>
      <RowActionSeparator />
      <RowActionItem
        className="text-destructive"
        onClick={() => handleDelete(event)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </RowActionItem>
    </RowActions>
  );

  return (
    <AdminPageShell>
      <div className="space-y-8">
        {/* Header */}
        <AdminPageHeader
          title="Event Management"
          description="Create and manage workshops, webinars, and events"
          actions={
            <Link href="/dashboard/admin/events/new">
              <Button className="bg-gradient-to-r from-primary to-[#764BA2]">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          }
        />

        {/* Stats Cards */}
        <StatsCardGrid columns={4}>
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            description={`${stats.upcomingEvents} upcoming`}
            icon={<Calendar className="h-5 w-5" />}
            accent="purple"
            trend={
              stats.upcomingEvents > 0
                ? {
                    direction: "up",
                    value: `${stats.upcomingEvents}`,
                    label: "scheduled",
                  }
                : undefined
            }
            loading={loading && !events}
          />
          <StatsCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            description="Across all events"
            icon={<Users className="h-5 w-5" />}
            accent="cyan"
            loading={loading && !events}
          />
          <StatsCard
            title="Event Revenue"
            value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`}
            description="Lifetime ticket sales"
            icon={<DollarSign className="h-5 w-5" />}
            accent="green"
            trend={
              stats.totalRevenue > 0
                ? {
                    direction: "up",
                    value: "+8%",
                    label: "this month",
                  }
                : undefined
            }
            loading={loading && !events}
          />
          <StatsCard
            title="Avg. Attendance"
            value={stats.avgAttendance}
            description="Per event"
            icon={<TrendingUp className="h-5 w-5" />}
            accent="pink"
            loading={loading && !events}
          />
        </StatsCardGrid>

        {/* Events Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">All Events</h2>
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length} events found
            </p>
          </div>
          <div className="p-6">
            <DataTable
              data={paginatedEvents}
              columns={columns}
              keyField="id"
              selectable
              selectedRows={selectedEvents}
              onSelectionChange={setSelectedEvents}
              bulkActions={bulkActions}
              searchable
              searchPlaceholder="Search events..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              filterValues={{ type: typeFilter, status: statusFilter }}
              onFilterChange={(id, value) => {
                if (id === "type") setTypeFilter((value as string) || "");
                if (id === "status") setStatusFilter((value as string) || "");
              }}
              onClearFilters={() => {
                setTypeFilter("");
                setStatusFilter("");
              }}
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredEvents.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              rowActions={renderRowActions}
              exportable
              onExport={handleExport}
              loading={loading && !events}
              emptyTitle="No events yet"
              emptyDescription="Create your first event to get started"
              emptyAction={
                <Link href="/dashboard/admin/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Event
                  </Button>
                </Link>
              }
              striped
            />
          </div>
        </div>

        {/* Registrations Dialog */}
        <Dialog
          open={registrationsDialog.open}
          onOpenChange={(open) =>
            setRegistrationsDialog({
              open,
              event: open ? registrationsDialog.event : null,
            })
          }
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Event Registrations</DialogTitle>
              <DialogDescription>
                {registrationsDialog.event?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {registrationsDialog.event?.spots_taken || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Registered
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {registrationsDialog.event?.capacity || "∞"}
                  </div>
                  <div className="text-sm text-muted-foreground">Capacity</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                To view individual registrations and attendee details, visit the
                full event management page.
              </p>
              <div className="flex justify-center mt-4">
                <Link
                  href={`/dashboard/admin/events/${registrationsDialog.event?.id}/registrations`}
                >
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    View All Registrations
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <ConfirmDialog {...dialogProps} />
      </div>
    </AdminPageShell>
  );
}
