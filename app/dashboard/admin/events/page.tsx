'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  DollarSign,
  Video,
  Building,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { logger } from '@/lib/logging';

const eventTypeLabels = {
  online_workshop: 'Online Workshop',
  in_person_workshop: 'In-Person',
  webinar: 'Webinar',
  conference: 'Conference',
};

const eventTypeIcons = {
  online_workshop: Video,
  in_person_workshop: Building,
  webinar: Video,
  conference: Building,
};

export default function AdminEventsPage() {
  const { data: events, loading, execute } = useAsync<any[]>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => execute(async () => {
    const response = await fetch('/api/events');
    if (!response.ok) throw new Error('Failed to fetch events');
    const result = await response.json();
    return result;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also delete all registrations.')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEvents(); // Refresh list
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error deleting event:', err as Error);
    }
  };

  const filteredEvents = (events || []).filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingEvents = (events || []).filter(e => {
    const startDate = new Date(e.start_datetime);
    return startDate > new Date() && e.is_published;
  }).length;
  const totalRegistrations = (events || []).reduce((sum: any, e: any) => sum + (e.spots_taken || 0), 0);
  const totalRevenue = (events || []).reduce((sum: any, e: any) => sum + ((e.price_usd || 0) * (e.spots_taken || 0)), 0);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Event Management</h1>
          <p className="text-muted-foreground">
            Create and manage workshops, webinars, and events
          </p>
        </div>
        <Link href="/dashboard/admin/events/new">
          <Button className="bg-gradient-to-r from-primary to-[#764BA2]">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">
              Lifetime ticket sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalRegistrations / ((events || []).filter(e => e.registered > 0).length || 1)))}
            </div>
            <p className="text-xs text-muted-foreground">
              Per event
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              All Types
            </Button>
            <Button variant="outline">
              All Status
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Manage your event calendar and registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {(events?.length || 0) === 0 ? (
                <>
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-4">No events yet. Create your first event!</p>
                  <Link href="/dashboard/admin/events/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Event
                    </Button>
                  </Link>
                </>
              ) : (
                'No events found matching your search.'
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event: any) => {
                  const EventTypeIcon = eventTypeIcons[event.event_type as keyof typeof eventTypeIcons];
                  const fillRate = event.capacity ? ((event.spots_taken || 0) / event.capacity) * 100 : 0;

                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            /events/{event.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <EventTypeIcon className="w-3 h-3" />
                          {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{format(new Date(event.start_datetime), 'MMM d, yyyy')}</div>
                          <div className="text-sm text-muted-foreground">{format(new Date(event.start_datetime), 'h:mm a')}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.price_usd === 0 ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500">FREE</Badge>
                        ) : (
                          `$${event.price_usd || 0}`
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.spots_taken || 0} / {event.capacity || '∞'}</div>
                          <div className="text-sm text-muted-foreground">{fillRate.toFixed(0)}% full</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.is_published ? (
                          <Badge variant="default" className="bg-green-500/10 text-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/events/${event.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Event
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View Registrations ({event.spots_taken || 0})
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
