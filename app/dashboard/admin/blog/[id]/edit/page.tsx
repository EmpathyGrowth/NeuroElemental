'use client';

import { LazyWYSIWYG } from '@/components/editor/lazy-wysiwyg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormLabel } from '@/components/ui/form-label';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
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
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/confirm-dialog';
import { BaseFileUpload } from '@/components/forms/base-file-upload';
import { ContentRevisionHistory } from '@/components/cms/content-revision-history';
import { SEOFieldsSection, SEOFieldsData } from '@/components/cms/seo-fields-section';

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
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
}

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { loading, execute } = useAsync();
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [seoData, setSeoData] = useState<SEOFieldsData>({
    meta_title: '',
    meta_description: '',
    social_image: '',
  });

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = () => execute(async () => {
    const response = await fetch('/api/blog');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const result = await response.json();
    // API returns { posts, count, categories } - extract posts array
    const posts = result.posts || [];
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
      setSeoData({
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        social_image: post.og_image_url || '',
      });
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
          meta_title: seoData.meta_title || null,
          meta_description: seoData.meta_description || null,
          og_image_url: seoData.social_image || null,
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

  const handleDelete = () => {
    confirm({
      title: 'Delete Post',
      description: 'Are you sure you want to delete this post? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
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
      },
    });
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
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: '/dashboard/admin' },
            { label: 'Blog', href: '/dashboard/admin/blog' },
            { label: title || 'Edit Post' },
          ]}
          className="mb-4"
        />
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
              <FormLabel htmlFor="title" required>Title</FormLabel>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to Manage Your Energy as a Neurodivergent Professional"
                required
              />
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="slug" required>URL Slug</FormLabel>
              <div className="flex">
                <span className="inline-flex items-center px-3 h-10 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground bg-muted dark:bg-muted/50 dark:border-input/50">
                  /blog/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="energy-management-neurodivergent"
                  className="rounded-l-none flex-1"
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
              <Label>Featured Image</Label>
              <BaseFileUpload
                config={{
                  type: "image",
                  aspectRatio: "16:9",
                  onUpload: (url) => setFeaturedImage(url || ''),
                }}
                value={featuredImage}
                category="blogs"
                placeholder="Upload featured image"
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 1200x630 for social sharing
              </p>
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

        {/* SEO Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>Optimize your post for search engines and social sharing</CardDescription>
          </CardHeader>
          <CardContent>
            <SEOFieldsSection
              data={seoData}
              onChange={setSeoData}
              contentTitle={title}
              contentExcerpt={excerpt}
              showPreview={true}
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

        {/* Revision History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revision History</CardTitle>
            <CardDescription>View and restore previous versions of this post</CardDescription>
          </CardHeader>
          <CardContent>
            <ContentRevisionHistory
              entityType="blog_post"
              entityId={id}
              onRestore={(restoredContent) => {
                // Apply restored content to form fields
                const content = restoredContent as Record<string, unknown>;
                if (content.title) setTitle(content.title as string);
                if (content.slug) setSlug(content.slug as string);
                if (content.excerpt !== undefined) setExcerpt((content.excerpt as string) || '');
                if (content.content !== undefined) setContent((content.content as string) || '');
                if (content.category !== undefined) setCategory((content.category as string) || '');
                if (content.tags) setTags((content.tags as string[]).join(', '));
                if (content.featured_image_url !== undefined) setFeaturedImage((content.featured_image_url as string) || '');
                if (content.is_published !== undefined) setIsPublished(content.is_published as boolean);
                // Restore SEO fields
                setSeoData({
                  meta_title: (content.meta_title as string) || '',
                  meta_description: (content.meta_description as string) || '',
                  social_image: (content.og_image_url as string) || '',
                });
                toast.success('Content restored from revision');
              }}
            />
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

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
