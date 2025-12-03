'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormLabel } from '@/components/ui/form-label';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Video,
  FileText,
  Pencil,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Copy,
} from 'lucide-react';
import { DragDropList, DragHandle, updateDisplayOrder } from '@/components/ui/drag-drop-list';
import Link from 'next/link';
import { logger } from '@/lib/logging';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { LazyWYSIWYG } from '@/components/editor/lazy-wysiwyg';
import { BaseFileUpload } from '@/components/forms/base-file-upload';
import { SEOFieldsSection, SEOFieldsData } from '@/components/cms/seo-fields-section';

const categories = [
  'Energy Management',
  'Relationships',
  'Professional Development',
  'Family & Relationships',
  'Advanced Training',
];

const difficulties = ['beginner', 'intermediate', 'advanced'];

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  content_text: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  long_description: string | null;
  instructor_name: string | null;
  duration_hours: number | null;
  difficulty_level: string | null;
  price_usd: number | null;
  category: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  is_published: boolean;
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Course details
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [priceUsd, setPriceUsd] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [seoData, setSeoData] = useState<SEOFieldsData>({
    meta_title: '',
    meta_description: '',
    social_image: '',
  });

  // Modules and lessons
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // Module dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [savingModule, setSavingModule] = useState(false);

  // Lesson dialog
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonModuleId, setLessonModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContentType, setLessonContentType] = useState('video');
  const [lessonContentText, setLessonContentText] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);

  // Confirmation dialog
  const { confirm, dialogProps } = useConfirmDialog();

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          toast.error('Course not found');
          router.push('/dashboard/admin/courses');
          return;
        }

        const data = await response.json();
        const courseData = data.course || data;
        setCourse(courseData);
        setTitle(courseData.title || '');
        setSlug(courseData.slug || '');
        setSubtitle(courseData.subtitle || '');
        setDescription(courseData.description || '');
        setLongDescription(courseData.long_description || '');
        setInstructorName(courseData.instructor_name || '');
        setDurationHours(courseData.duration_hours?.toString() || '');
        setDifficultyLevel(courseData.difficulty_level || 'beginner');
        setPriceUsd(courseData.price_usd?.toString() || '');
        setCategory(courseData.category || '');
        setTags((courseData.tags || []).join(', '));
        setThumbnailUrl(courseData.thumbnail_url || '');
        setPreviewVideoUrl(courseData.preview_video_url || '');
        setIsPublished(courseData.is_published || false);
        setSeoData({
          meta_title: courseData.meta_title || '',
          meta_description: courseData.meta_description || '',
          social_image: courseData.og_image_url || '',
        });
      } catch (error) {
        logger.error('Error fetching course:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, router]);

  // Fetch modules and lessons
  const fetchModules = useCallback(async () => {
    setLoadingModules(true);
    try {
      const response = await fetch(`/api/courses/${id}/modules`);
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      logger.error('Error fetching modules:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingModules(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchModules();
    }
  }, [id, fetchModules]);

  // Save course details
  const handleSaveCourse = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
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
          meta_title: seoData.meta_title || null,
          meta_description: seoData.meta_description || null,
          og_image_url: seoData.social_image || null,
        }),
      });

      if (response.ok) {
        toast.success('Course updated successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update course');
      }
    } catch (error) {
      logger.error('Error updating course:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  // Module CRUD operations
  const openModuleDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleTitle(module.title);
      setModuleDescription(module.description || '');
    } else {
      setEditingModule(null);
      setModuleTitle('');
      setModuleDescription('');
    }
    setModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!moduleTitle.trim()) {
      toast.error('Module title is required');
      return;
    }

    setSavingModule(true);
    try {
      if (editingModule) {
        // Update existing module
        const response = await fetch(`/api/modules/${editingModule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: moduleTitle,
            description: moduleDescription,
          }),
        });

        if (response.ok) {
          toast.success('Module updated');
          fetchModules();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to update module');
        }
      } else {
        // Create new module
        const response = await fetch(`/api/courses/${id}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: moduleTitle,
            description: moduleDescription,
            order_index: modules.length,
          }),
        });

        if (response.ok) {
          toast.success('Module created');
          fetchModules();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to create module');
        }
      }

      setModuleDialogOpen(false);
    } catch (error) {
      logger.error('Error saving module:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to save module');
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    confirm({
      title: 'Delete Module',
      description: 'Are you sure? This will delete all lessons in this module. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/modules/${moduleId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            toast.success('Module deleted');
            fetchModules();
          } else {
            const error = await response.json();
            toast.error(error.error || 'Failed to delete module');
          }
        } catch (error) {
          logger.error('Error deleting module:', error instanceof Error ? error : new Error(String(error)));
          toast.error('Failed to delete module');
        }
      },
    });
  };

  // Lesson CRUD operations
  const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setLessonModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonContentType(lesson.content_type || 'video');
      setLessonContentText(lesson.content_text || '');
      setLessonVideoUrl(lesson.content_url || '');
      setLessonDuration(lesson.duration_minutes?.toString() || '');
      setLessonIsPreview(lesson.is_preview || false);
    } else {
      setEditingLesson(null);
      setLessonTitle('');
      setLessonContentType('video');
      setLessonContentText('');
      setLessonVideoUrl('');
      setLessonDuration('');
      setLessonIsPreview(false);
    }
    setLessonDialogOpen(true);
  };

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    setSavingLesson(true);
    try {
      const lessonData = {
        title: lessonTitle,
        content_type: lessonContentType,
        content_text: lessonContentText || null,
        video_url: lessonVideoUrl || null,
        duration_minutes: parseInt(lessonDuration) || null,
        is_preview: lessonIsPreview,
      };

      if (editingLesson) {
        // Update existing lesson
        const response = await fetch(`/api/lessons/${editingLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        });

        if (response.ok) {
          toast.success('Lesson updated');
          fetchModules();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to update lesson');
        }
      } else {
        // Create new lesson
        const module = modules.find(m => m.id === lessonModuleId);
        const lessonCount = module?.lessons?.length || 0;

        const response = await fetch(`/api/courses/${id}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...lessonData,
            module_id: lessonModuleId,
            order_index: lessonCount,
          }),
        });

        if (response.ok) {
          toast.success('Lesson created');
          fetchModules();
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to create lesson');
        }
      }

      setLessonDialogOpen(false);
    } catch (error) {
      logger.error('Error saving lesson:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to save lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    confirm({
      title: 'Delete Lesson',
      description: 'Are you sure you want to delete this lesson? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/lessons/${lessonId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            toast.success('Lesson deleted');
            fetchModules();
          } else {
            const error = await response.json();
            toast.error(error.error || 'Failed to delete lesson');
          }
        } catch (error) {
          logger.error('Error deleting lesson:', error instanceof Error ? error : new Error(String(error)));
          toast.error('Failed to delete lesson');
        }
      },
    });
  };

  // Module reordering
  const handleMoveModule = async (moduleIndex: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    // Create new order
    const reorderedModules = [...modules];
    const [movedModule] = reorderedModules.splice(moduleIndex, 1);
    reorderedModules.splice(newIndex, 0, movedModule);

    // Optimistically update UI
    setModules(reorderedModules);

    try {
      const response = await fetch('/api/modules/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: reorderedModules.map((m, i) => ({ id: m.id, order_index: i })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to reorder modules');
        fetchModules(); // Revert on error
      }
    } catch (error) {
      logger.error('Error reordering modules:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to reorder modules');
      fetchModules(); // Revert on error
    }
  };

  // Lesson reordering within a module
  const handleMoveLesson = async (moduleId: string, lessonIndex: number, direction: 'up' | 'down') => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newIndex = direction === 'up' ? lessonIndex - 1 : lessonIndex + 1;
    if (newIndex < 0 || newIndex >= module.lessons.length) return;

    // Create new order
    const reorderedLessons = [...module.lessons];
    const [movedLesson] = reorderedLessons.splice(lessonIndex, 1);
    reorderedLessons.splice(newIndex, 0, movedLesson);

    // Optimistically update UI
    setModules(modules.map(m =>
      m.id === moduleId ? { ...m, lessons: reorderedLessons } : m
    ));

    try {
      const response = await fetch('/api/lessons/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessons: reorderedLessons.map((l, i) => ({ id: l.id, order_index: i })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to reorder lessons');
        fetchModules(); // Revert on error
      }
    } catch (error) {
      logger.error('Error reordering lessons:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to reorder lessons');
      fetchModules(); // Revert on error
    }
  };

  // Drag-drop module reordering
  const handleDragDropModules = async (reorderedModules: Module[]) => {
    // Update with new order indices
    const updated = reorderedModules.map((m, i) => ({ ...m, order_index: i }));
    setModules(updated);

    try {
      const response = await fetch('/api/modules/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: updated.map((m, i) => ({ id: m.id, order_index: i })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to reorder modules');
        fetchModules();
      }
    } catch (error) {
      logger.error('Error reordering modules:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to reorder modules');
      fetchModules();
    }
  };

  // Drag-drop lesson reordering within a module
  const handleDragDropLessons = async (moduleId: string, reorderedLessons: Lesson[]) => {
    // Update with new order indices
    const updated = reorderedLessons.map((l, i) => ({ ...l, order_index: i }));
    setModules(modules.map(m =>
      m.id === moduleId ? { ...m, lessons: updated } : m
    ));

    try {
      const response = await fetch('/api/lessons/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessons: updated.map((l, i) => ({ id: l.id, order_index: i })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to reorder lessons');
        fetchModules();
      }
    } catch (error) {
      logger.error('Error reordering lessons:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to reorder lessons');
      fetchModules();
    }
  };

  // Duplicate module with all lessons
  const handleDuplicateModule = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    try {
      const response = await fetch(`/api/modules/${moduleId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: id,
          order_index: modules.length,
        }),
      });

      if (response.ok) {
        toast.success('Module duplicated');
        fetchModules();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to duplicate module');
      }
    } catch (error) {
      logger.error('Error duplicating module:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to duplicate module');
    }
  };

  // Duplicate lesson
  const handleDuplicateLesson = async (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    try {
      const response = await fetch(`/api/lessons/${lessonId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: moduleId,
          order_index: module.lessons.length,
        }),
      });

      if (response.ok) {
        toast.success('Lesson duplicated');
        fetchModules();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to duplicate lesson');
      }
    } catch (error) {
      logger.error('Error duplicating lesson:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to duplicate lesson');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: '/dashboard/admin' },
            { label: 'Courses', href: '/dashboard/admin/courses' },
            { label: course?.title || 'Edit Course' },
          ]}
          className="mb-4"
        />
        <Link href="/dashboard/admin/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Course</h1>
          <p className="text-muted-foreground">{course?.title}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/courses/${slug}`} target="_blank">
            <Button variant="outline">Preview</Button>
          </Link>
          <Button
            onClick={handleSaveCourse}
            disabled={saving}
            className="bg-gradient-to-r from-primary to-[#764BA2]"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Basic information about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormLabel htmlFor="title" required>Title</FormLabel>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Course title"
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="slug" required>URL Slug</FormLabel>
                <div className="flex">
                  <span className="inline-flex items-center px-3 h-10 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground bg-muted dark:bg-muted/50 dark:border-input/50">
                    /courses/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="rounded-l-none flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
          <Card>
            <CardHeader>
              <CardTitle>Course Metadata</CardTitle>
              <CardDescription>Pricing, duration, and categorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceUsd">Price (USD)</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 h-10 border border-r-0 border-input rounded-l-md text-sm text-muted-foreground bg-muted dark:bg-muted/50 dark:border-input/50">
                      $
                    </span>
                    <Input
                      id="priceUsd"
                      type="number"
                      value={priceUsd}
                      onChange={(e) => setPriceUsd(e.target.value)}
                      className="rounded-l-none flex-1"
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Course images and preview video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <BaseFileUpload
                  config={{
                    type: "image",
                    aspectRatio: "16:9",
                    onUpload: (url) => setThumbnailUrl(url || ''),
                  }}
                  value={thumbnailUrl}
                  category="courses"
                  placeholder="Upload course thumbnail"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1280x720 (16:9 aspect ratio)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previewVideoUrl">Preview Video URL</Label>
                <Input
                  id="previewVideoUrl"
                  value={previewVideoUrl}
                  onChange={(e) => setPreviewVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  YouTube, Vimeo, or direct video URL
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>Organize your course into modules and lessons</CardDescription>
                </div>
                <Button onClick={() => openModuleDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingModules ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Loading curriculum...</p>
                </div>
              ) : modules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">No modules yet. Create your first module!</p>
                  <Button onClick={() => openModuleDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Module
                  </Button>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <AccordionItem
                      key={module.id}
                      value={module.id}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex flex-col gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveModule(moduleIndex, 'up');
                              }}
                              disabled={moduleIndex === 0}
                              aria-label="Move module up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveModule(moduleIndex, 'down');
                              }}
                              disabled={moduleIndex === modules.length - 1}
                              aria-label="Move module down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-medium">
                              Module {moduleIndex + 1}: {module.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {module.lessons?.length || 0} lessons
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-4 space-y-4">
                          {/* Module actions */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModuleDialog(module)}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Module
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openLessonDialog(module.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Lesson
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateModule(module.id)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>

                          {/* Lessons list */}
                          {module.lessons && module.lessons.length > 0 ? (
                            <div className="space-y-2">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border',
                                    'hover:bg-muted/50 transition-colors'
                                  )}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => handleMoveLesson(module.id, lessonIndex, 'up')}
                                      disabled={lessonIndex === 0}
                                      aria-label="Move lesson up"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => handleMoveLesson(module.id, lessonIndex, 'down')}
                                      disabled={lessonIndex === module.lessons.length - 1}
                                      aria-label="Move lesson down"
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {lesson.content_type === 'video' ? (
                                      <Video className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">
                                      {lessonIndex + 1}. {lesson.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {lesson.content_type}
                                      {lesson.duration_minutes && ` • ${lesson.duration_minutes} min`}
                                      {lesson.is_preview && ' • Preview'}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Link
                                      href={`/courses/${slug}/learn?lesson=${lesson.id}&preview=true`}
                                      target="_blank"
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Preview lesson"
                                        title="Preview as student"
                                      >
                                        <Video className="w-4 h-4 text-primary" />
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openLessonDialog(module.id, lesson)}
                                      aria-label="Edit lesson"
                                      title="Edit lesson"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDuplicateLesson(module.id, lesson.id)}
                                      aria-label="Duplicate lesson"
                                      title="Duplicate lesson"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      aria-label="Delete lesson"
                                      title="Delete lesson"
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm py-4">
                              No lessons in this module yet.
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your course for search engines and social sharing</CardDescription>
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

          <Card>
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
        </TabsContent>
      </Tabs>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Edit Module' : 'Add Module'}
            </DialogTitle>
            <DialogDescription>
              {editingModule
                ? 'Update the module details'
                : 'Create a new module for this course'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel htmlFor="moduleTitle" required>Module Title</FormLabel>
              <Input
                id="moduleTitle"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="e.g., Getting Started"
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="moduleDescription" optional>Description</FormLabel>
              <Textarea
                id="moduleDescription"
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
                placeholder="Brief description of this module..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveModule} disabled={savingModule}>
              {savingModule && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingModule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
            </DialogTitle>
            <DialogDescription>
              {editingLesson
                ? 'Update the lesson details'
                : 'Create a new lesson for this module'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel htmlFor="lessonTitle" required>Lesson Title</FormLabel>
              <Input
                id="lessonTitle"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g., Introduction to the Course"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessonContentType">Content Type</Label>
                <Select value={lessonContentType} onValueChange={setLessonContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="download">Download</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lessonDuration">Duration (minutes)</Label>
                <Input
                  id="lessonDuration"
                  type="number"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="e.g., 15"
                />
              </div>
            </div>

            {lessonContentType === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="lessonVideoUrl">Video URL</Label>
                <Input
                  id="lessonVideoUrl"
                  value={lessonVideoUrl}
                  onChange={(e) => setLessonVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, or direct video URLs
                </p>
              </div>
            )}

            {lessonContentType === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="lessonContentText">Content</Label>
                <Textarea
                  id="lessonContentText"
                  value={lessonContentText}
                  onChange={(e) => setLessonContentText(e.target.value)}
                  placeholder="Lesson content (supports HTML)..."
                  rows={6}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="lessonIsPreview">Free Preview</Label>
                <p className="text-sm text-muted-foreground">
                  Allow non-enrolled users to view this lesson
                </p>
              </div>
              <Switch
                id="lessonIsPreview"
                checked={lessonIsPreview}
                onCheckedChange={setLessonIsPreview}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} disabled={savingLesson}>
              {savingLesson && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingLesson ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
