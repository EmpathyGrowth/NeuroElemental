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
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAsync } from '@/hooks/use-async';
import { logger } from '@/lib/logging';

const categories = [
  'Energy Management',
  'Neurodivergence',
  'Framework Insights',
  'Research',
  'Community',
  'Instructor Tips',
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  tags: string[];
  featured_image_url: string | null;
  is_published: boolean;
}

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, execute } = useAsync();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = () => execute(async () => {
    const response = await fetch('/api/blog');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const posts = await response.json();
    const post = posts.find((p: BlogPost) => p.id === id);

    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
      setCategory(post.category || '');
      setTags((post.tags || []).join(', '));
      setFeaturedImage(post.featured_image_url || '');
      setIsPublished(post.is_published);
    }
    return null;
  });

  const handleUpdate = async (publish?: boolean) => {
    setSaving(true);

    try {
      const publishStatus = publish !== undefined ? publish : isPublished;

      const response = await fetch(`/api/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          excerpt,
          content,
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          featured_image_url: featuredImage || null,
          is_published: publishStatus,
          published_at: publishStatus && !isPublished ? new Date().toISOString() : undefined,
        }),
      });

      if (response.ok) {
        toast.success('Post updated successfully');
        router.push('/dashboard/admin/blog');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update post');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error updating post:', err as Error);
      toast.error('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        router.push('/dashboard/admin/blog');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      logger.error('Error deleting post:', error as Error);
      toast.error('Failed to delete post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold mb-2">Edit Post</h1>
        <p className="text-muted-foreground">
          Update your blog post content
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
                onChange={(e) => setTitle(e.target.value)}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief summary of the post"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {excerpt.length}/160 characters
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
            <CardDescription>Control the publish status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publish">Published</Label>
                <p className="text-sm text-muted-foreground">
                  {isPublished ? 'This post is live on your blog' : 'This post is a draft'}
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={saving}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Post
          </Button>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/blog">
              <Button variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button
              onClick={() => handleUpdate()}
              disabled={saving || !title || !slug}
              className="bg-gradient-to-r from-primary to-[#764BA2]"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {isPublished ? 'Update & Publish' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
