import { getSupabaseServer } from '@/lib/db';
import { conflictError, createAuthenticatedRoute, createPublicRoute, formatPaginationMeta, getQueryParam, getPaginationParams, internalError, requireCourseEnrollment, successResponse, validateRequest } from '@/lib/api';
import { getTimestampFields } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { reviewContentSchema } from '@/lib/validation/schemas';

/** User info for reviews */
interface ReviewUserInfo {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

/** Review record from database */
interface ReviewRecord {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  would_recommend: boolean;
  is_published: boolean;
  helpful_count: number;
  created_at: string;
  user?: ReviewUserInfo;
}

/** Rating stat for distribution */
interface RatingStat {
  rating: number;
}

/** ID result for existence checks */
interface IdResult {
  id: string;
}

/** Review insert data */
interface ReviewInsert {
  course_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  would_recommend: boolean;
  is_published: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export const GET = createPublicRoute<{ id: string }>(async (request, context) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  const { limit, offset } = getPaginationParams(request, { limit: 10 });
  const sortBy = getQueryParam(request, 'sort') || 'recent'; // recent, helpful, rating

  let query = supabase
    .from('course_reviews')
    .select(`
      *,
      user:profiles!reviewsuser_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('course_id', id)
    .eq('is_published', true);

  // Apply sorting
  switch (sortBy) {
    case 'helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data: reviews, error, count } = await query;

  if (error) {
    logger.error('Error fetching reviews', undefined, { errorMsg: error instanceof Error ? error.message : String(error) });
    throw internalError('Failed to fetch reviews');
  }

  // Calculate average rating and distribution
  const { data: stats } = await supabase
    .from('course_reviews')
    .select('rating')
    .eq('course_id', id)
    .eq('is_published', true) as { data: RatingStat[] | null; error: unknown };

  let averageRating = 0;
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (stats && stats.length > 0) {
    const sum = stats.reduce((acc, r) => acc + (r.rating || 0), 0);
    averageRating = sum / stats.length;

    stats.forEach((r) => {
      if (r.rating && r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating]++;
      }
    });
  }

  return successResponse({
    reviews: reviews || [],
    stats: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: count || 0,
      distribution,
    },
    pagination: formatPaginationMeta(count || 0, limit, offset),
  });
});

export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Check if user is enrolled in the course
  await requireCourseEnrollment(user.id, id);

  // Check if user already has a review for this course
  const { data: existingReview } = await supabase
    .from('course_reviews')
    .select('id')
    .eq('course_id', id)
    .eq('user_id', user.id)
    .single() as { data: IdResult | null; error: unknown };

  if (existingReview) {
    throw conflictError('You have already reviewed this course');
  }

  // Parse and validate request body
  const validation = await validateRequest(request, reviewContentSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { rating, content, title, would_recommend = true } = validation.data;

  const reviewData: ReviewInsert = {
    course_id: id,
    user_id: user.id,
    rating,
    title,
    content,
    would_recommend,
    is_published: true, // Auto-publish, but can be moderated later
    helpful_count: 0,
    ...getTimestampFields(),
  };

  const { data: review, error } = await (supabase as any)
    .from('course_reviews')
    .insert(reviewData)
    .select(`
      *,
      user:profiles!reviewsuser_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `)
    .single() as { data: ReviewRecord | null; error: { message: string } | null };

  if (error) {
    logger.error('Error creating review', undefined, { errorMsg: error instanceof Error ? error.message : String(error) });
    throw internalError('Failed to create review');
  }

  // Note: Course rating aggregation would need to be calculated dynamically
  // or via a database trigger since update_course_rating RPC doesn't exist

  return successResponse({ review }, 201);
});
