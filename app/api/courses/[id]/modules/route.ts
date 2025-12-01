import { createAuthenticatedRoute, createPublicRoute, forbiddenError, successResponse, validateRequest } from '@/lib/api';
import { moduleRepository } from '@/lib/db/modules';
import { getUserRole } from '@/lib/middleware';
import { moduleCreateSchema } from '@/lib/validation/schemas';

export const GET = createPublicRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;

  // Get course modules with nested lessons using repository
  const modules = await moduleRepository.getWithLessons(params.id);

  // Enrich with computed fields
  const enrichedModules = modules.map((module) => {
    const sortedLessons = module.lessons.map((lesson, index) => ({
      ...lesson,
      completed: false,
      locked: !lesson.is_preview && index > 0, // Lock non-preview lessons except first one
    }));

    const total_duration = sortedLessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

    return {
      ...module,
      lessons: sortedLessons,
      total_duration,
      completion_percentage: 0, // No completion for public
    };
  });

  return successResponse({ modules: enrichedModules });
});

export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, _user) => {
  const params = await context.params;

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

  // Create module using repository
  const module = await moduleRepository.createModule({
    course_id: params.id,
    title,
    description,
    order_index,
  });

  return successResponse({ module }, 201);
});
