import { badRequestError, createAuthenticatedRoute, createPublicRoute, forbiddenError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { moduleCreateSchema } from '@/lib/validation/schemas';

/** Lesson resource */
interface LessonResource {
  id: string;
  title: string;
  type: string;
  url: string;
  size: number | null;
}

/** Quiz question */
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

/** Lesson quiz */
interface LessonQuiz {
  id: string;
  passing_score: number;
  questions: QuizQuestion[];
}

/** Course lesson with nested data */
interface CourseLesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  resources: LessonResource[];
  quiz: LessonQuiz[];
}

/** Course module with lessons */
interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: CourseLesson[];
}

/** Module insert data */
interface ModuleInsert {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export const GET = createPublicRoute<{ id: string }>(async (request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // Get course modules with nested lessons
  const { data: modules, error } = await supabase
    .from('course_modules')
    .select(`
      *,
      lessons:course_lessons(
        id,
        title,
        description,
        content,
        video_url,
        duration_minutes,
        order_index,
        is_free,
        resources:lesson_resources(
          id,
          title,
          type,
          url,
          size
        ),
        quiz:lesson_quizzes(
          id,
          passing_score,
          questions:quiz_questions(
            id,
            question,
            options,
            correct_answer
          )
        )
      )
    `)
    .eq('course_id', params.id)
    .order('order_index', { ascending: true }) as { data: CourseModule[] | null; error: { message: string } | null };

  if (error) {
    throw badRequestError(error.message);
  }

  // Enrich modules with public data (no auth)
  const enrichedModules = modules?.map((module) => {
    const lessons = module.lessons?.map((lesson, index) => ({
      ...lesson,
      completed: false,
      locked: !lesson.is_free && index > 0, // Lock non-free lessons except first one
    }));

    const total_duration = lessons?.reduce((acc, l) => acc + l.duration_minutes, 0) || 0;

    return {
      ...module,
      lessons,
      total_duration,
      completion_percentage: 0, // No completion for public
    };
  }) || [];

  return successResponse({ modules: enrichedModules });
});

export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, _user) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // Check if user is instructor or admin
  const role = await getUserRole();
  if (role !== 'admin' && role !== 'instructor') {
    throw forbiddenError('Admin or instructor access required');
  }

  // Validate request body
  const validation = await validateRequest(request, moduleCreateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { title, description, order_index } = validation.data;

  const insertData: ModuleInsert = {
    course_id: params.id,
    title,
    description,
    order_index,
  };

  const { data, error } = await supabase
    .from('course_modules')
    .insert(insertData)
    .select()
    .single() as { data: CourseModule | null; error: { message: string } | null };

  if (error) {
    throw badRequestError(error.message);
  }

  return successResponse({ module: data }, 201);
});
