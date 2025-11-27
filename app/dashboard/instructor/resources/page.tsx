'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logging';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  FileText,
  Video,
  Image,
  Download,
  ExternalLink,
  Presentation,
  BookOpen,
  Users,
  Loader2,
  Play,
} from 'lucide-react';
import { useAsync } from '@/hooks/use-async';
import type {
  InstructorResource,
  InstructorResourceCategory,
  InstructorResourceType,
} from '@/lib/db';

const typeIcons: Record<InstructorResourceType, typeof FileText> = {
  pdf: FileText,
  video: Video,
  presentation: Presentation,
  image: Image,
  link: ExternalLink,
  document: FileText,
  audio: Play,
};

const categoryLabels: Record<InstructorResourceCategory, string> = {
  workshop_materials: 'Workshop Materials',
  training_videos: 'Training Videos',
  marketing: 'Marketing',
  community: 'Community',
  templates: 'Templates',
  guides: 'Guides',
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function InstructorResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('workshop_materials');

  interface ResourcesData {
    resources: InstructorResource[];
  }

  const { data, loading, error, execute } = useAsync<ResourcesData>();
  const resources = data?.resources || [];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = () =>
    execute(async () => {
      const res = await fetch('/api/instructor/resources');
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    });

  const handleDownload = async (resource: InstructorResource) => {
    try {
      const res = await fetch(`/api/instructor/resources/${resource.id}/download`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to get download URL');

      const { downloadUrl } = await res.json();
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } catch (err) {
      logger.error('Download error:', err as Error);
    }
  };

  const filterResources = (category: InstructorResourceCategory) => {
    return resources
      .filter((r) => r.category === category)
      .filter(
        (r) =>
          !searchQuery ||
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const getCategoryStats = () => {
    const stats: Record<InstructorResourceCategory, number> = {
      workshop_materials: 0,
      training_videos: 0,
      marketing: 0,
      community: 0,
      templates: 0,
      guides: 0,
    };

    resources.forEach((r) => {
      stats[r.category]++;
    });

    return stats;
  };

  const stats = getCategoryStats();

  if (loading && resources.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-7xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load resources. Please try again.</p>
            <Button onClick={fetchResources} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teaching Resources</h1>
        <p className="text-muted-foreground">
          Everything you need to facilitate NeuroElemental workshops and trainings
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshop Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workshop_materials}</div>
            <p className="text-xs text-muted-foreground">Guides and templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.training_videos}</div>
            <p className="text-xs text-muted-foreground">Hours of instruction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing Assets</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.marketing}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Resources</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.community}</div>
            <p className="text-xs text-muted-foreground">Links and tools</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search resources"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workshop_materials">Workshop Materials</TabsTrigger>
          <TabsTrigger value="training_videos">Training Videos</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        {(['workshop_materials', 'training_videos', 'marketing', 'community'] as InstructorResourceCategory[]).map(
          (category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {filterResources(category).length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    {searchQuery
                      ? 'No resources found matching your search.'
                      : `No ${categoryLabels[category].toLowerCase()} available yet.`}
                  </CardContent>
                </Card>
              ) : (
                filterResources(category).map((resource) => {
                  const Icon = typeIcons[resource.type] || FileText;
                  const isLink = resource.type === 'link';
                  const isVideo = resource.type === 'video';

                  return (
                    <Card key={resource.id} className="glass-card hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                              <CardDescription>{resource.description}</CardDescription>
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                {resource.file_size_bytes && (
                                  <span>{formatFileSize(resource.file_size_bytes)}</span>
                                )}
                                {isVideo && resource.duration_seconds && (
                                  <span>{formatDuration(resource.duration_seconds)}</span>
                                )}
                                {resource.download_count > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{resource.download_count} downloads</span>
                                  </>
                                )}
                                {resource.view_count > 0 && isVideo && (
                                  <>
                                    <span>•</span>
                                    <span>{resource.view_count} views</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isLink ? (
                            <Button
                              variant="outline"
                              onClick={() => window.open(resource.external_url || '', '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open
                            </Button>
                          ) : isVideo ? (
                            <Button onClick={() => handleDownload(resource)}>
                              <Video className="w-4 h-4 mr-2" />
                              Watch
                            </Button>
                          ) : (
                            <Button onClick={() => handleDownload(resource)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
