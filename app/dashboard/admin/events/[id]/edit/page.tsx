"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { LazyWYSIWYG } from "@/components/editor/lazy-wysiwyg";
import { BaseFileUpload } from "@/components/forms/base-file-upload";
import { SEOFieldsSection, SEOFieldsData } from "@/components/cms/seo-fields-section";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  location_name: string | null;
  location_address: Record<string, string> | null;
  online_meeting_url: string | null;
  price_usd: number;
  capacity: number | null;
  is_published: boolean;
  thumbnail_url: string | null;
  spots_taken: number;
}

const eventTypes = [
  { value: "online_workshop", label: "Online Workshop" },
  { value: "in_person_workshop", label: "In-Person Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "conference", label: "Conference" },
];

const timezones = ["PST", "MST", "CST", "EST", "GMT", "CET", "JST", "AEST"];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const {
    data: event,
    loading: loadingEvent,
    execute: fetchEvent,
  } = useAsync<EventData>();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("online_workshop");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState("PST");
  const [priceUsd, setPriceUsd] = useState("");
  const [capacity, setCapacity] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [seoData, setSeoData] = useState<SEOFieldsData>({
    meta_title: "",
    meta_description: "",
    social_image: "",
  });

  useEffect(() => {
    if (eventId) {
      fetchEvent(async () => {
        const res = await fetch(`/api/events/${eventId}`);
        if (!res.ok) throw new Error("Failed to fetch event");
        return res.json();
      });
    }
  }, [eventId]);

  // Populate form when event data loads
  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setSlug(event.slug || "");
      setDescription(event.description || "");
      setEventType(event.event_type || "online_workshop");
      setTimezone(event.timezone || "PST");
      setPriceUsd(String(event.price_usd || 0));
      setCapacity(event.capacity ? String(event.capacity) : "");
      setLocationName(event.location_name || "");
      setLocationAddress(
        event.location_address
          ? JSON.stringify(event.location_address, null, 2)
          : ""
      );
      setOnlineMeetingUrl(event.online_meeting_url || "");
      setThumbnailUrl(event.thumbnail_url || "");
      setIsPublished(event.is_published || false);
      setSeoData({
        meta_title: (event as Record<string, unknown>).meta_title as string || "",
        meta_description: (event as Record<string, unknown>).meta_description as string || "",
        social_image: (event as Record<string, unknown>).og_image_url as string || "",
      });

      // Parse datetime
      if (event.start_datetime) {
        const startDt = new Date(event.start_datetime);
        setStartDate(startDt.toISOString().split("T")[0]);
        setStartTime(startDt.toTimeString().slice(0, 5));
      }
      if (event.end_datetime) {
        const endDt = new Date(event.end_datetime);
        setEndDate(endDt.toISOString().split("T")[0]);
        setEndTime(endDt.toTimeString().slice(0, 5));
      }
    }
  }, [event]);

  const handleSubmit = async () => {
    setSaving(true);

    try {
      const startDatetime = `${startDate}T${startTime}:00`;
      const endDatetime = `${endDate}T${endTime}:00`;

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description: description || null,
          event_type: eventType,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          timezone,
          price_usd: parseFloat(priceUsd) || 0,
          capacity: capacity ? parseInt(capacity) : null,
          location_name: locationName || null,
          location_address: locationAddress
            ? JSON.parse(locationAddress)
            : null,
          online_meeting_url: onlineMeetingUrl || null,
          thumbnail_url: thumbnailUrl || null,
          is_published: isPublished,
          meta_title: seoData.meta_title || null,
          meta_description: seoData.meta_description || null,
          og_image_url: seoData.social_image || null,
        }),
      });

      if (response.ok) {
        toast.success("Event updated successfully");
        router.push("/dashboard/admin/events");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update event");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error updating event:", err);
      toast.error("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Event deleted successfully");
        router.push("/dashboard/admin/events");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete event");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error deleting event:", err);
      toast.error("Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const isOnline = eventType === "online_workshop" || eventType === "webinar";

  if (loadingEvent) {
    return (
      <AdminPageShell>
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminPageShell>
    );
  }

  if (!event) {
    return (
      <AdminPageShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Event not found</p>
          <Button asChild>
            <Link href="/dashboard/admin/events">Back to Events</Link>
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Events", href: "/dashboard/admin/events" },
            { label: event.title || "Edit Event" },
          ]}
          className="mb-4"
        />
        <Link href="/dashboard/admin/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      <AdminPageHeader
        title="Edit Event"
        description="Update event details and settings"
        actions={
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || event.spots_taken > 0}
          >
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Event
          </Button>
        }
      />

      {event.spots_taken > 0 && (
        <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
          <CardContent className="pt-6">
            <p className="text-amber-600 dark:text-amber-400">
              This event has {event.spots_taken} registration(s). Deleting is
              disabled to protect attendee data.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Basic information about your event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Energy Reset Workshop"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 h-10 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground bg-muted dark:bg-muted/50 dark:border-input/50">
                  /events/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="energy-reset-workshop"
                  className="rounded-l-none flex-1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <LazyWYSIWYG
                content={description}
                onChange={setDescription}
                placeholder="A brief overview of the event..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
            <CardDescription>When is your event?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone *</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              {isOnline
                ? "Online meeting details"
                : "Physical location details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isOnline ? (
              <div className="space-y-2">
                <Label htmlFor="onlineMeetingUrl">Meeting URL</Label>
                <Input
                  id="onlineMeetingUrl"
                  value={onlineMeetingUrl}
                  onChange={(e) => setOnlineMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                />
                <p className="text-xs text-muted-foreground">
                  Zoom, Google Meet, or other video conference link
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="locationName">Venue Name</Label>
                  <Input
                    id="locationName"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Manhattan Conference Center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationAddress">Address (JSON format)</Label>
                  <Textarea
                    id="locationAddress"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder='{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001"}'
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format as JSON object with street, city, state, zip
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Capacity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Pricing & Capacity</CardTitle>
            <CardDescription>
              Set ticket price and attendee limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceUsd">Ticket Price (USD) *</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 h-10 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground bg-muted dark:bg-muted/50 dark:border-input/50">
                    $
                  </span>
                  <Input
                    id="priceUsd"
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="47"
                    min="0"
                    step="1"
                    className="rounded-l-none flex-1"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Set to 0 for free events
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (Optional)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="50"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for unlimited. Current registrations:{" "}
                  {event.spots_taken}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Event thumbnail image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              <BaseFileUpload
                config={{
                  type: "image",
                  aspectRatio: "16:9",
                  onUpload: (url) => setThumbnailUrl(url || ""),
                }}
                value={thumbnailUrl}
                category="events"
                placeholder="Upload event thumbnail"
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 1280x720 (16:9 aspect ratio)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Optimize your event for search engines and social sharing</CardDescription>
          </CardHeader>
          <CardContent>
            <SEOFieldsSection
              data={seoData}
              onChange={setSeoData}
              contentTitle={title}
              contentExcerpt={description}
              showPreview={true}
            />
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Control event visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publish">Publish Event</Label>
                <p className="text-sm text-muted-foreground">
                  Make this event visible and accept registrations
                </p>
              </div>
              <Switch
                id="publish"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/admin/events">
            <Button variant="outline" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={
              saving ||
              !title ||
              !slug ||
              !startDate ||
              !startTime ||
              !endDate ||
              !endTime
            }
            className="bg-gradient-to-r from-primary to-[#764BA2]"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </AdminPageShell>
  );
}
