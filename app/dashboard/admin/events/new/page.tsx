"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { LazyWYSIWYG } from "@/components/editor/lazy-wysiwyg";
import { BaseFileUpload } from "@/components/forms/base-file-upload";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form-label";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { logger } from "@/lib/logging";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const eventTypes = [
  { value: "online_workshop", label: "Online Workshop" },
  { value: "in_person_workshop", label: "In-Person Workshop" },
  { value: "webinar", label: "Webinar" },
  { value: "conference", label: "Conference" },
];

const timezones = ["PST", "MST", "CST", "EST", "GMT", "CET", "JST", "AEST"];

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  const [locationStreet, setLocationStreet] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationZip, setLocationZip] = useState("");
  const [onlineMeetingUrl, setOnlineMeetingUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const startDatetime = `${startDate}T${startTime}:00`;
      const endDatetime = `${endDate}T${endTime}:00`;

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          event_type: eventType,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          timezone,
          price_usd: parseFloat(priceUsd) || 0,
          capacity: capacity ? parseInt(capacity) : null,
          location_name: locationName || null,
          location_address:
            locationStreet || locationCity || locationState || locationZip
              ? {
                  street: locationStreet,
                  city: locationCity,
                  state: locationState,
                  zip: locationZip,
                }
              : null,
          online_meeting_url: onlineMeetingUrl || null,
          thumbnail_url: thumbnailUrl || null,
          is_published: isPublished,
          spots_taken: 0,
        }),
      });

      if (response.ok) {
        toast.success("Event created successfully");
        router.push("/dashboard/admin/events");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create event");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error("Error creating event:", err as Error);
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const isOnline = eventType === "online_workshop" || eventType === "webinar";

  return (
    <AdminPageShell>
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/dashboard/admin" },
            { label: "Events", href: "/dashboard/admin/events" },
            { label: "New Event" },
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
        title="Create New Event"
        description="Add a new event to your calendar"
      />

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
              <FormLabel htmlFor="title" required>
                Title
              </FormLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Energy Reset Workshop"
                required
              />
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="slug" required>
                URL Slug
              </FormLabel>
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
              <FormLabel htmlFor="eventType" required>
                Event Type
              </FormLabel>
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
                <FormLabel htmlFor="startDate" required>
                  Start Date
                </FormLabel>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="startTime" required>
                  Start Time
                </FormLabel>
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
                <FormLabel htmlFor="endDate" required>
                  End Date
                </FormLabel>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="endTime" required>
                  End Time
                </FormLabel>
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
              <FormLabel htmlFor="timezone" required>
                Timezone
              </FormLabel>
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
                  <Label htmlFor="locationStreet">Street Address</Label>
                  <Input
                    id="locationStreet"
                    value={locationStreet}
                    onChange={(e) => setLocationStreet(e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationCity">City</Label>
                    <Input
                      id="locationCity"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="New York"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationState">State</Label>
                    <Input
                      id="locationState"
                      value={locationState}
                      onChange={(e) => setLocationState(e.target.value)}
                      placeholder="NY"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationZip">ZIP Code</Label>
                    <Input
                      id="locationZip"
                      value={locationZip}
                      onChange={(e) => setLocationZip(e.target.value)}
                      placeholder="10001"
                    />
                  </div>
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
                <FormLabel htmlFor="priceUsd" required>
                  Ticket Price (USD)
                </FormLabel>
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
                  Leave blank for unlimited
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
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !title ||
              !slug ||
              !startDate ||
              !startTime ||
              !endDate ||
              !endTime
            }
            className="bg-gradient-to-r from-primary to-[#764BA2]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            {isPublished ? "Create & Publish" : "Save as Draft"}
          </Button>
        </div>
      </div>
    </AdminPageShell>
  );
}
