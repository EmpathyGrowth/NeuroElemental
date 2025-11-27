'use client';

import { LazyWYSIWYG } from '@/components/editor/lazy-wysiwyg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';

const categories = [
  'Energy Management',
  'Neurodivergence',
  'Framework Insights',
  'Research',
  'Community',
  'Instructor Tips',
];

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Auto-generate slug from title
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

  const handleSubmit = async (publish: boolean) => {
    setLoading(true);

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          featured_image_url: featuredImage || null,
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
        }),
      });

      if (response.ok) {
        toast.success('Post created successfully');
        router.push('/dashboard/admin/blog');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create post');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error creating post:', err as Error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Post</h1>
        <p className="text-muted-foreground">
          Write and publish new content to your blog
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Basic information about your post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="How to Manage Your Energy as a Neurodivergent Professional"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 border border-r-0 rounded-l-md text-sm text-muted-foreground bg-muted">
                  /blog/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="energy-management-neurodivergent"
                  className="rounded-l-none"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                URL-friendly version of the title (auto-generated)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief summary of the post (140-160 characters)"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                Used in previews and SEO ({excerpt.length}/160 characters)
              </p>
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
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="ADHD, Burnout, Energy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">Featured Image URL</Label>
              <Input
                id="featuredImage"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Write your blog post content</CardDescription>
          </CardHeader>
          <CardContent>
            <LazyWYSIWYG
              content={content}
              onChange={setContent}
              placeholder="Write your post content here..."
            />
          </CardContent>
        </Card>

        {/* Publishing Options */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Control when and how this post is published</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publish">Publish Immediately</Label>
                <p className="text-sm text-muted-foreground">
                  Make this post visible on your blog
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
          <Link href="/dashboard/admin/blog">
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={loading || !title || !slug}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={loading || !title || !slug}
              className="bg-gradient-to-r from-primary to-[#764BA2]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Eye className="w-4 h-4 mr-2" />
              Publish Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
