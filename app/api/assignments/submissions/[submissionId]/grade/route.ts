import { badRequestError, createAuthenticatedRoute, forbiddenError, internalError, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { getUserRole } from '@/lib/middleware';
import { getCompletionTimestamp, getCurrentTimestamp } from '@/lib/utils';
import { assignmentGradeSchema } from '@/lib/validation/schemas';

/** Assignment info from join */
interface AssignmentInfo {
  id: string;
  max_score: number | null;
  lesson_id: string;
  course_id: string;
}

/** Submission record with assignment */
interface SubmissionRecord {
  id: string;
  user_id: string;
  assignment_id: string;
  content: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  assignment?: AssignmentInfo;
}

/** Grade update data */
interface GradeUpdateData {
  score: number;
  feedback?: string;
  status: string;
  graded_by: string;
  graded_at: string;
  updated_at: string;
}

/** Lesson completion upsert data */
interface LessonCompletionUpsert {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

/** Notification insert data */
interface NotificationInsert {
  user_id: string;
  title: string;
  message: string;
  type: string;
  action_url: string;
}

export const POST = createAuthenticatedRoute<{ submissionId: string }>(async (request, context, user) => {
  const { submissionId } = await context.params;
  const supabase = await getSupabaseServer();

  // Check if user is instructor or admin
  const role = await getUserRole();
  if (role !== 'admin' && role !== 'instructor') {
    throw forbiddenError('Only instructors and admins can grade assignments');
  }

  // Validate request body
  const validation = await validateRequest(request, assignmentGradeSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { score, feedback } = validation.data;

  // Fetch submission and assignment details
  const { data: submission, error: submissionError } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      assignment:lesson_assignments(
        id,
        max_score,
        lesson_id,
        course_id
      )
    `)
    .eq('id', submissionId)
    .single() as { data: SubmissionRecord | null; error: { message: string } | null };

  if (submissionError || !submission) {
    throw notFoundError('Submission not found');
  }

  const maxScore = submission.assignment?.max_score || 100;

  if (score > maxScore) {
    throw badRequestError(`Score cannot exceed maximum score of ${maxScore}`);
  }

  // Update submission with grade
  const gradeData: GradeUpdateData = {
    score,
    feedback,
    status: 'graded',
    graded_by: user.id,
    graded_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  };

  const { data: gradedSubmission, error: gradeError } = await (supabase as any)
    .from('assignment_submissions')
    .update(gradeData)
    .eq('id', submissionId)
    .select()
    .single() as { data: SubmissionRecord | null; error: { message: string } | null };

  if (gradeError) {
    logger.error('Error grading submission', gradeError instanceof Error ? gradeError : new Error(String(gradeError)));
    throw internalError('Failed to grade submission');
  }

  // If score meets passing criteria, mark lesson as completed
  const passingPercentage = 70;
  const scorePercentage = (score / maxScore) * 100;

  if (scorePercentage >= passingPercentage && submission.assignment?.lesson_id) {
    const completionData: LessonCompletionUpsert = {
      user_id: submission.user_id,
      lesson_id: submission.assignment.lesson_id,
      ...getCompletionTimestamp(),
    };
    await (supabase as any)
      .from('lesson_completions')
      .upsert(completionData);
  }

  // Create notification for student
  const notificationData: NotificationInsert = {
    user_id: submission.user_id,
    title: 'Assignment Graded',
    message: `Your assignment has been graded. Score: ${score}/${maxScore}`,
    type: 'info',
    action_url: `/assignments/${submission.assignment_id}`,
  };
  await (supabase as any)
    .from('notifications')
    .insert(notificationData);

  return successResponse({
    submission: gradedSubmission,
    message: 'Assignment graded successfully',
  });
});
