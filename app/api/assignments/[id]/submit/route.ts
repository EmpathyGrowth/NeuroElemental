import { badRequestError, createAuthenticatedRoute, internalError, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import type { Database } from '@/lib/types/supabase';
import { getCurrentTimestamp } from '@/lib/utils';
import { assignmentContentSchema } from '@/lib/validation/schemas';

type SubmissionInsert = Database['public']['Tables']['assignment_submissions']['Insert'];
type SubmissionUpdate = Database['public']['Tables']['assignment_submissions']['Update'];
type SubmissionRow = Database['public']['Tables']['assignment_submissions']['Row'];

export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, assignmentContentSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { content, attachments } = validation.data;

  // Fetch lesson to verify assignment exists
  // Note: lesson_assignments table doesn't exist yet - using course_lessons as proxy
  const { data: lesson, error: lessonError } = await supabase
    .from('course_lessons')
    .select('id, title, content_type')
    .eq('id', id)
    .single();

  if (lessonError || !lesson) {
    throw notFoundError('Assignment not found');
  }

  // Check if user already submitted
  const { data: existingSubmission } = await supabase
    .from('assignment_submissions')
    .select('id, status')
    .eq('assignment_id', id)
    .eq('user_id', user.id)
    .single();

  if (existingSubmission && existingSubmission.status === 'graded') {
    throw badRequestError('Assignment already graded. Cannot resubmit.');
  }

  // Create or update submission
  // Note: attachments stored as file_url (single file) - first attachment if provided
  const submissionData: SubmissionInsert = {
    assignment_id: id,
    user_id: user.id,
    content,
    file_url: attachments?.[0] || null,
    status: 'submitted',
    submitted_at: getCurrentTimestamp(),
  };

  let submission: SubmissionRow | null;
  if (existingSubmission) {
    // Update existing submission
    const updateData: SubmissionUpdate = {
      content,
      file_url: attachments?.[0] || null,
      status: 'submitted',
      updated_at: getCurrentTimestamp(),
    };

    const { data, error } = await supabase
      .from('assignment_submissions')
      .update(updateData)
      .eq('id', existingSubmission.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating submission', new Error(error.message));
      throw internalError('Failed to update submission');
    }
    submission = data;
  } else {
    // Create new submission
    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      logger.error('Error creating submission', new Error(error.message));
      throw internalError('Failed to create submission');
    }
    submission = data;
  }

  return successResponse({
    submission,
    message: 'Assignment submitted successfully',
  }, 201);
});

export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Fetch user's submission
  const { data: submission, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', id)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error('Error fetching submission', error instanceof Error ? error : new Error(String(error)));
    throw internalError('Failed to fetch submission');
  }

  // If submission exists, fetch the related lesson info
  let assignmentInfo = null;
  if (submission) {
    const { data: lesson } = await supabase
      .from('course_lessons')
      .select('id, title')
      .eq('id', id)
      .single();

    if (lesson) {
      assignmentInfo = {
        id: lesson.id,
        title: lesson.title,
        description: null,
        lesson_id: lesson.id,
        max_score: 100,
      };
    }
  }

  return successResponse({
    submission: submission ? { ...submission, assignment: assignmentInfo } : null,
  });
});
