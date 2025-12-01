"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/lib/logging";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  FileText,
  Image,
  LayoutGrid,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Navigation,
  Palette,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CMSStats {
  faqs: number;
  announcements: number;
  mediaFiles: number;
  emailTemplates: number;
  forms: number;
  submissions: number;
  redirects: number;
  blocks: number;
  seoPages: number;
}

interface RecentActivity {
  type: string;
  title: string;
  time: string;
}

export default function CMSDashboardPage() {
  const [stats, setStats] = useState<CMSStats>({
    faqs: 0,
    announcements: 0,
    mediaFiles: 0,
    emailTemplates: 0,
    forms: 0,
    submissions: 0,
    redirects: 0,
    blocks: 0,
    seoPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    // Fetch stats from various endpoints
    const fetchStats = async () => {
      try {
        const [
          faqsRes,
          formsRes,
          redirectsRes,
          templatesRes,
          blocksRes,
          seoRes,
          announcementsRes,
          mediaRes,
        ] = await Promise.all([
          fetch("/api/admin/faqs")
            .then((r) => r.json())
            .catch(() => ({ faqs: [] })),
          fetch("/api/admin/forms")
            .then((r) => r.json())
            .catch(() => ({ forms: [], stats: { new: 0 } })),
          fetch("/api/admin/redirects")
            .then((r) => r.json())
            .catch(() => ({ redirects: [], stats: { total: 0 } })),
          fetch("/api/admin/email-templates")
            .then((r) => r.json())
            .catch(() => ({ templates: [] })),
          fetch("/api/admin/blocks")
            .then((r) => r.json())
            .catch(() => ({ blocks: [] })),
          fetch("/api/admin/seo")
            .then((r) => r.json())
            .catch(() => ({ settings: [] })),
          fetch("/api/admin/announcements")
            .then((r) => r.json())
            .catch(() => ({ announcements: [], activeCount: 0 })),
          fetch("/api/admin/media")
            .then((r) => r.json())
            .catch(() => ({ items: [], total: 0 })),
        ]);

        setStats({
          faqs: faqsRes.faqs?.length || 0,
          announcements:
            announcementsRes.activeCount ||
            announcementsRes.announcements?.filter(
              (a: { is_active: boolean }) => a.is_active
            )?.length ||
            0,
          mediaFiles: mediaRes.total || mediaRes.items?.length || 0,
          emailTemplates: templatesRes.templates?.length || 0,
          forms: formsRes.forms?.length || 0,
          submissions: formsRes.stats?.new || 0,
          redirects:
            redirectsRes.stats?.total || redirectsRes.redirects?.length || 0,
          blocks: blocksRes.blocks?.length || 0,
          seoPages: seoRes.settings?.length || 0,
        });

        // Build recent activity from real data
        const activities: RecentActivity[] = [];
        if (formsRes.stats?.new > 0) {
          activities.push({
            type: "form",
            title: `${formsRes.stats.new} new form submissions`,
            time: "Recent",
          });
        }
        if (announcementsRes.announcements?.length > 0) {
          const latest = announcementsRes.announcements[0];
          activities.push({
            type: "announcement",
            title: `Announcement: ${latest.title || "Updated"}`,
            time: "Recent",
          });
        }
        if (faqsRes.faqs?.length > 0) {
          activities.push({
            type: "faq",
            title: `${faqsRes.faqs.length} FAQs configured`,
            time: "",
          });
        }
        if (mediaRes.total > 0 || mediaRes.items?.length > 0) {
          activities.push({
            type: "media",
            title: `${mediaRes.total || mediaRes.items?.length} media files`,
            time: "",
          });
        }
        setRecentActivity(
          activities.length > 0
            ? activities
            : [{ type: "info", title: "No recent activity", time: "" }]
        );
      } catch (error) {
        logger.error(
          "Error fetching CMS stats",
          error instanceof Error ? error : new Error(String(error))
        );
        setRecentActivity([
          { type: "error", title: "Failed to load activity", time: "" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cmsModules = [
    {
      title: "Site Content",
      description: "Edit landing page sections and content",
      icon: FileText,
      href: "/dashboard/admin/cms/content",
      color: "bg-blue-500",
      stat: "4 sections",
    },
    {
      title: "FAQs",
      description: "Manage frequently asked questions",
      icon: MessageSquare,
      href: "/dashboard/admin/cms/faqs",
      color: "bg-green-500",
      stat: `${stats.faqs} items`,
    },
    {
      title: "Navigation",
      description: "Edit menus and navigation links",
      icon: Navigation,
      href: "/dashboard/admin/cms/navigation",
      color: "bg-purple-500",
      stat: "3 menus",
    },
    {
      title: "Media Library",
      description: "Upload and manage images and files",
      icon: Image,
      href: "/dashboard/admin/cms/media",
      color: "bg-pink-500",
      stat: `${stats.mediaFiles} files`,
    },
    {
      title: "Email Templates",
      description: "Customize email templates",
      icon: Mail,
      href: "/dashboard/admin/cms/email-templates",
      color: "bg-orange-500",
      stat: `${stats.emailTemplates} templates`,
    },
    {
      title: "Contact Forms",
      description: "Manage forms and view submissions",
      icon: MessageSquare,
      href: "/dashboard/admin/cms/forms",
      color: "bg-cyan-500",
      stat: `${stats.submissions} new`,
      badge: stats.submissions > 0 ? "New" : undefined,
    },
    {
      title: "URL Redirects",
      description: "Manage URL redirects for SEO",
      icon: Link2,
      href: "/dashboard/admin/cms/redirects",
      color: "bg-yellow-500",
      stat: `${stats.redirects} active`,
    },
    {
      title: "SEO Settings",
      description: "Configure page SEO metadata",
      icon: Search,
      href: "/dashboard/admin/cms/seo",
      color: "bg-indigo-500",
      stat: `${stats.seoPages} pages`,
    },
    {
      title: "Content Blocks",
      description: "Reusable widgets and components",
      icon: LayoutGrid,
      href: "/dashboard/admin/cms/blocks",
      color: "bg-rose-500",
      stat: `${stats.blocks} blocks`,
    },
    {
      title: "Theme Settings",
      description: "Customize colors, fonts, and styles",
      icon: Palette,
      href: "/dashboard/admin/cms/theme",
      color: "bg-violet-500",
      stat: "1 active",
    },
    {
      title: "Announcements",
      description: "Site-wide banners and notifications",
      icon: AlertCircle,
      href: "/dashboard/admin/cms/announcements",
      color: "bg-amber-500",
      stat: `${stats.announcements} active`,
    },
    {
      title: "Platform Settings",
      description: "Global platform configuration",
      icon: Settings,
      href: "/dashboard/admin/settings",
      color: "bg-slate-500",
      stat: "Configure",
    },
  ];

  if (loading) {
    return (
      <AdminPageShell>
        <AdminPageHeader
          title="CMS Dashboard"
          description="Manage all your site content from one place"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="CMS Dashboard"
        description="Manage all your site content from one place"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Content Items
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {stats.faqs + stats.blocks}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                New Submissions
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.submissions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Media Files</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.mediaFiles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Redirects</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.redirects}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">All Modules</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          {/* CMS Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cmsModules.map((module) => (
              <Link key={module.title} href={module.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <module.icon className="h-5 w-5 text-white" />
                      </div>
                      {module.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {module.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-3">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {module.stat}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest content changes and submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/cms/faqs">+ Add FAQ</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/cms/announcements">
                + New Announcement
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/cms/media">Upload Media</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/cms/blocks">+ Create Block</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/cms/redirects">+ Add Redirect</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
