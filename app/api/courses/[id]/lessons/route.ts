import { badRequestError, createAuthenticatedRoute, createPublicRoute, forbiddenError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { lessonCreateSchema } from '@/lib/validation/schemas';

/** Course lesson record */
interface LessonRecord {
  id: string;
  module_id: string | null;
  title: string;
  content_type: string;
  content_text: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean | null;
  created_at: string | null;
}

/** Lesson insert data */
interface LessonInsert {
  module_id: string;
  title: string;
  content_type: string;
  content_text?: string;
  content_url?: string;
  duration_minutes?: number;
  order_index: number;
  is_preview?: boolean;
}

export const GET = createPublicRoute<{ id: string }>(async (request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // Get course modules first
  const { data: modules, error: modulesError } = await (supabase as any)
    .from('course_modules')
    .select('id')
    .eq('course_id', params.id) as { data: Array<{ id: string }> | null; error: { message: string } | null };

  if (modulesError) {
    throw badRequestError(modulesError.message);
  }

  const moduleIds = modules?.map((m: { id: string }) => m.id) || [];

  if (moduleIds.length === 0) {
    return successResponse({ lessons: [] });
  }

  // Get lessons for all modules in this course
  const { data: lessons, error } = await supabase
    .from('course_lessons')
    .select('*')
    .in('module_id', moduleIds)
    .order('order_index', { ascending: true }) as { data: LessonRecord[] | null; error: { message: string } | null };

  if (error) {
    throw badRequestError(error.message);
  }

  // Mark preview lessons
  const lessonsWithAccess = lessons?.map((lesson) => ({
    ...lesson,
    hasAccess: lesson.is_preview, // Public can see which are preview
    isCompleted: false, // No completion status without auth
  }));

  return successResponse({ lessons: lessonsWithAccess });
});

export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, _user) => {
  const _params = await context.params;
  const supabase = await getSupabaseServer();

  // Check if user is admin or instructor
  const role = await getUserRole();
  if (role !== 'admin' && role !== 'instructor') {
    throw forbiddenError('Admin or instructor access required');
  }

  // Validate request body
  const validation = await validateRequest(request, lessonCreateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { title, content_text, video_url, duration_minutes, order_index, is_preview, content_type } = validation.data;

  // module_id is required but not in the schema - get from request body
  const body = await request.clone().json();
  const module_id = body.module_id;

  if (!module_id) {
    throw badRequestError('module_id is required');
  }

  const lessonData: LessonInsert = {
    module_id,
    title,
    content_type: content_type || 'text', // Default to text content
    content_text,
    content_url: video_url,
    duration_minutes,
    order_index,
    is_preview,
  };

  const { data, error } = await (supabase as any)
    .from('course_lessons')
    .insert(lessonData)
    .select()
    .single() as { data: LessonRecord | null; error: { message: string } | null };

  if (error) {
    throw badRequestError(error.message);
  }

  return successResponse({ lesson: data }, 201);
});
