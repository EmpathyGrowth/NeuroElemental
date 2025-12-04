import { badRequestError, conflictError, createAuthenticatedRoute, internalError, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { getCurrentTimestamp } from '@/lib/utils';
import { courseEnrollmentRequestSchema } from '@/lib/validation/schemas';

/** Course data from database */
interface Course {
  id: string;
  title: string;
  price: number | null;
  is_free: boolean;
  enrollment_count: number;
}

/** Enrollment data from database */
interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  payment_status: string | null;
  progress_percentage: number | null;
  enrolled_at: string;
}

/** Existing enrollment lookup */
interface ExistingEnrollment {
  id: string;
  payment_status: string | null;
  completed_at: string | null;
}

export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // Check if course exists
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, price, is_free, enrollment_count')
    .eq('id', params.id)
    .single() as { data: Course | null; error: { message: string } | null };

  if (courseError || !course) {
    throw notFoundError('Course');
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('course_enrollments')
    .select('id, payment_status, completed_at')
    .eq('course_id', params.id)
    .eq('user_id', user.id)
    .maybeSingle() as { data: ExistingEnrollment | null; error: unknown };

  if (existingEnrollment) {
    if (existingEnrollment.payment_status === 'paid') {
      throw conflictError('You are already enrolled in this course');
    } else if (existingEnrollment.completed_at) {
      throw conflictError('You have already completed this course');
    }
  }

  // Validate request body
  const validation = await validateRequest(request, courseEnrollmentRequestSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { payment_method } = validation.data;

  // Check if course is free or payment is required
  const courseCost = course.price || 0;
  const isFree = courseCost === 0 || course.is_free === true;

  if (!isFree && payment_method === 'free') {
    throw badRequestError('This course requires payment');
  }

  // Create or update enrollment
  const enrollmentData = {
    course_id: params.id,
    user_id: user.id,
    payment_status: isFree ? 'free' : 'pending',
    progress_percentage: 0,
    enrolled_at: getCurrentTimestamp(),
  };

  let enrollment: Enrollment | null = null;
  if (existingEnrollment) {
    // Reactivate existing enrollment
    const updateData = {
      payment_status: isFree ? 'free' : 'pending',
      enrolled_at: getCurrentTimestamp(),
    };

    const { data, error } = await (supabase as any)
      .from('course_enrollments')
      .update(updateData)
      .eq('id', existingEnrollment.id)
      .select()
      .single() as { data: Enrollment | null; error: { message: string } | null };

    enrollment = data;
    if (error) {
      logger.error('Error reactivating enrollment', new Error(error.message));
      throw internalError('Failed to reactivate enrollment');
    }
  } else {
    // Create new enrollment
    const { data, error } = await (supabase as any)
      .from('course_enrollments')
      .insert(enrollmentData)
      .select()
      .single() as { data: Enrollment | null; error: { message: string } | null };

    enrollment = data;
    if (error) {
      logger.error('Error creating enrollment', new Error(error.message));
      throw internalError('Failed to create enrollment');
    }
  }

  // Create a notification for the user
  await (supabase as any)
    .from('notifications')
    .insert({
      user_id: user.id,
      title: 'Course Enrollment Successful',
      message: `You have successfully enrolled in ${course.title}`,
      type: 'success',
      action_url: `/courses/${params.id}/modules`,
    });

  // Update course enrollment count
  await (supabase as any)
    .from('courses')
    .update({
      enrollment_count: (course.enrollment_count || 0) + 1,
    })
    .eq('id', params.id);

  return successResponse(
    {
      enrollment,
      message: 'Successfully enrolled in course',
      redirect_url: `/courses/${params.id}/modules`
    },
    201
  );
});

export const DELETE = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // Find enrollment
  const { data: enrollment, error: findError } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', params.id)
    .eq('user_id', user.id)
    .maybeSingle() as { data: { id: string } | null; error: { message: string } | null };

  if (findError || !enrollment) {
    throw notFoundError('Enrollment');
  }

  // Soft delete - set payment_status to 'cancelled'
  const { error } = await (supabase as any)
    .from('course_enrollments')
    .update({
      payment_status: 'cancelled',
    })
    .eq('id', enrollment.id);

  if (error) {
    logger.error('Error cancelling enrollment', new Error(error.message));
    throw internalError('Failed to cancel enrollment');
  }

  // Note: Enrollment counts are calculated dynamically from the enrollments table
  // No need to maintain a separate counter

  return successResponse({ message: 'Enrollment cancelled successfully' });
});
