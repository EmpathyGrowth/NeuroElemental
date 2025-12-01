'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';
import { useAuth } from '@/components/auth/auth-provider';
import { LazyWYSIWYG } from '@/components/editor/lazy-wysiwyg';

const categories = [
  'Energy Management',
  'Relationships',
  'Professional Development',
  'Family & Relationships',
  'Advanced Training',
];

const difficulties = ['beginner', 'intermediate', 'advanced'];

export default function InstructorNewCoursePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [instructorName, setInstructorName] = useState(profile?.full_name || '');
  const [durationHours, setDurationHours] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [priceUsd, setPriceUsd] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          subtitle,
          description,
          long_description: longDescription,
          instructor_name: instructorName,
          duration_hours: parseFloat(durationHours) || 0,
          difficulty_level: difficultyLevel,
          price_usd: parseFloat(priceUsd) || 0,
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          thumbnail_url: thumbnailUrl || null,
          preview_video_url: previewVideoUrl || null,
          is_published: isPublished,
        }),
      });

      if (response.ok) {
        toast.success('Course created successfully!');
        router.push('/dashboard/instructor');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create course');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error creating course:', err);
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard/instructor">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
        <p className="text-muted-foreground">
          Add a new course to your catalog
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Basic information about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Energy Management Fundamentals"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 h-10 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground bg-muted dark:bg-muted/50 dark:border-input/50">
                  /courses/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="energy-management-fundamentals"
                  className="rounded-l-none flex-1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Master the basics of your Element Mix"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief overview for course listings..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Full Description</Label>
              <LazyWYSIWYG
                content={longDescription}
                onChange={setLongDescription}
                placeholder="Write a detailed description for the course page..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Meta */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Course Metadata</CardTitle>
            <CardDescription>Pricing, duration, and categorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceUsd">Price (USD) *</Label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md text-sm text-muted-foreground bg-muted">
                    $
                  </span>
                  <Input
                    id="priceUsd"
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="97"
                    min="0"
                    step="0.01"
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationHours">Duration (hours)</Label>
                <Input
                  id="durationHours"
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="6.5"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(diff => (
                      <SelectItem key={diff} value={diff} className="capitalize">
                        {diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructorName">Instructor Name</Label>
              <Input
                id="instructorName"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Fundamentals, Self-Discovery, Burnout Prevention"
              />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Course images and preview video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail Image URL</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/course-thumbnail.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previewVideoUrl">Preview Video URL</Label>
              <Input
                id="previewVideoUrl"
                value={previewVideoUrl}
                onChange={(e) => setPreviewVideoUrl(e.target.value)}
                placeholder="https://example.com/preview-video.mp4"
              />
              <p className="text-xs text-muted-foreground">
                Optional preview video shown on course page
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Control course visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publish">Publish Course</Label>
                <p className="text-sm text-muted-foreground">
                  Make this course visible in the catalog
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
          <Link href="/dashboard/instructor">
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title || !slug || !priceUsd}
            className="bg-gradient-to-r from-primary to-[#764BA2]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            {isPublished ? 'Create & Publish' : 'Save as Draft'}
          </Button>
        </div>
      </div>
    </div>
  );
}
