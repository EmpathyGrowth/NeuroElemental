"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { AvatarUpload } from "@/components/forms/avatar-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { updateUserProfile } from "@/lib/auth/supabase";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Shield,
  Twitter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ExtendedProfile {
  bio?: string;
  location?: string;
  timezone?: string;
  website?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central Europe (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "China (CST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
];

/** Delay in ms before hiding success message */
const SUCCESS_MESSAGE_DELAY = 3000;

export default function ProfilePage() {
  const { user, profile, refetchProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  // Extended profile state
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile>({});
  const [extendedLoading, setExtendedLoading] = useState(false);
  const [extendedSaving, setExtendedSaving] = useState(false);

  // Fetch extended profile
  useEffect(() => {
    const fetchExtendedProfile = async () => {
      setExtendedLoading(true);
      try {
        const res = await fetch("/api/user/profile/extended");
        if (res.ok) {
          const data = await res.json();
          setExtendedProfile(data.extended_profile || {});
        }
      } catch {
        // Silently fail
      } finally {
        setExtendedLoading(false);
      }
    };
    if (user?.id) {
      fetchExtendedProfile();
    }
  }, [user?.id]);

  // Save extended profile
  const handleSaveExtended = async () => {
    setExtendedSaving(true);
    try {
      const res = await fetch("/api/user/profile/extended", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extendedProfile),
      });
      if (res.ok) {
        toast.success("Extended profile saved");
      } else {
        toast.error("Failed to save extended profile");
      }
    } catch {
      toast.error("Failed to save extended profile");
    } finally {
      setExtendedSaving(false);
    }
  };

  const updateExtendedField = <K extends keyof ExtendedProfile>(
    key: K,
    value: ExtendedProfile[K]
  ) => {
    setExtendedProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocialLink = (
    platform: keyof NonNullable<ExtendedProfile["social_links"]>,
    value: string
  ) => {
    setExtendedProfile((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [platform]: value },
    }));
  };

  // Sync local state with profile changes (e.g., after refetchProfile)
  useEffect(() => {
    if (profile?.full_name !== undefined) {
      setFullName(profile.full_name || "");
    }
    if (profile?.avatar_url !== undefined) {
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile?.full_name, profile?.avatar_url]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await updateUserProfile(user!.id, {
        full_name: fullName,
        avatar_url: avatarUrl || undefined,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        await refetchProfile();
        successTimeoutRef.current = setTimeout(
          () => setSuccess(false),
          SUCCESS_MESSAGE_DELAY
        );
      }
    } catch (_error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { label: "Admin", className: "bg-red-500/10 text-red-500" },
      instructor: {
        label: "Certified Instructor",
        className: "bg-purple-500/10 text-purple-500",
      },
      student: { label: "Student", className: "bg-blue-500/10 text-blue-500" },
      business: {
        label: "Business Account",
        className: "bg-green-500/10 text-green-500",
      },
      school: {
        label: "School Account",
        className: "bg-cyan-500/10 text-cyan-500",
      },
      registered: {
        label: "Free Account",
        className: "bg-gray-500/10 text-gray-500",
      },
    };

    return badges[role as keyof typeof badges] || badges.registered;
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile.role);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Overview Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>
              Your account information at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">
                    {profile.full_name || "Anonymous User"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={roleBadge.className}>
                    <Shield className="w-3 h-3 mr-1" />
                    {roleBadge.label}
                  </Badge>
                  {profile.instructor_status === "approved" && (
                    <Badge className="bg-green-500/10 text-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Certified
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-500 rounded-lg">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">Profile updated successfully!</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to
                    update it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <AvatarUpload
                    currentAvatarUrl={avatarUrl}
                    userId={user!.id}
                    fullName={fullName}
                    onUploadComplete={(url) => {
                      setAvatarUrl(url);
                      // Auto-save avatar changes
                      updateUserProfile(user!.id, {
                        avatar_url: url || undefined,
                      }).then(({ error: updateError }) => {
                        if (updateError) {
                          toast.error("Failed to save avatar");
                        } else {
                          toast.success("Avatar updated");
                          refetchProfile();
                        }
                      });
                    }}
                    onError={(error) => toast.error(error)}
                    size="lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                    <Badge className={roleBadge.className}>
                      {roleBadge.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {profile.role === "registered" &&
                        "Upgrade by enrolling in courses"}
                      {profile.role === "student" &&
                        "Access to all your enrolled courses"}
                      {profile.role === "instructor" &&
                        "Full access to teaching materials"}
                      {profile.role === "admin" &&
                        "Full platform administration access"}
                      {(profile.role === "business" ||
                        profile.role === "school") &&
                        "Organization account with team features"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Extended Profile */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Extended Profile</CardTitle>
            <CardDescription>Additional information about you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {extendedLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={extendedProfile.bio || ""}
                    onChange={(e) => updateExtendedField("bio", e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(extendedProfile.bio || "").length}/500
                  </p>
                </div>

                {/* Location & Timezone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={extendedProfile.location || ""}
                      onChange={(e) =>
                        updateExtendedField("location", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="timezone"
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Timezone
                    </Label>
                    <Select
                      value={extendedProfile.timezone || ""}
                      onValueChange={(v) => updateExtendedField("timezone", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Company & Job Title */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="company"
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Company
                    </Label>
                    <Input
                      id="company"
                      placeholder="Your company"
                      value={extendedProfile.company || ""}
                      onChange={(e) =>
                        updateExtendedField("company", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Your role"
                      value={extendedProfile.job_title || ""}
                      onChange={(e) =>
                        updateExtendedField("job_title", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={extendedProfile.website || ""}
                    onChange={(e) =>
                      updateExtendedField("website", e.target.value)
                    }
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-3">
                  <Label>Social Links</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="twitter"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Twitter className="w-4 h-4" />
                        Twitter/X
                      </Label>
                      <Input
                        id="twitter"
                        placeholder="@username"
                        value={extendedProfile.social_links?.twitter || ""}
                        onChange={(e) =>
                          updateSocialLink("twitter", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="linkedin"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        placeholder="linkedin.com/in/username"
                        value={extendedProfile.social_links?.linkedin || ""}
                        onChange={(e) =>
                          updateSocialLink("linkedin", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="github"
                        className="flex items-center gap-2 text-sm"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        placeholder="github.com/username"
                        value={extendedProfile.social_links?.github || ""}
                        onChange={(e) =>
                          updateSocialLink("github", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveExtended}
                    disabled={extendedSaving}
                  >
                    {extendedSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Extended Profile
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your activity on NeuroElemental</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">0</div>
                <div className="text-sm text-muted-foreground">
                  Courses Enrolled
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">0</div>
                <div className="text-sm text-muted-foreground">
                  Certificates Earned
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">0</div>
                <div className="text-sm text-muted-foreground">
                  Events Attended
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {profile.role === "registered" && (
          <Card className="glass-card border-primary/50">
            <CardHeader>
              <CardTitle>Upgrade Your Account</CardTitle>
              <CardDescription>
                Unlock more features with our courses and programs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Become a Student</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enroll in courses to unlock student features
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/courses")}
                  >
                    Browse Courses
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Become an Instructor</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get certified to teach the NeuroElemental framework
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/certification")}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
