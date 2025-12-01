"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { logger } from "@/lib/logging";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, Star, ThumbsUp, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ReviewUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  would_recommend: boolean;
  helpful_count: number;
  created_at: string;
  user?: ReviewUser;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface ReviewsResponse {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface CourseReviewsProps {
  courseId: string;
  className?: string;
  isEnrolled?: boolean;
}

type SortOption = "recent" | "helpful" | "rating";

function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRate?.(star)}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function CourseReviews({
  courseId,
  className = "",
  isEnrolled = false,
}: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const fetchReviews = useCallback(
    async (reset = false) => {
      const currentOffset = reset ? 0 : offset;
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await fetch(
          `/api/courses/${courseId}/reviews?sort=${sortBy}&limit=10&offset=${currentOffset}`
        );
        if (response.ok) {
          const data: ReviewsResponse = await response.json();
          if (reset) {
            setReviews(data.reviews);
          } else {
            setReviews((prev) => [...prev, ...data.reviews]);
          }
          setStats(data.stats);
          setHasMore(data.pagination.hasMore);
          setOffset(currentOffset + data.reviews.length);
        }
      } catch (error) {
        logger.error(
          "Failed to fetch reviews",
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [courseId, sortBy, offset]
  );

  useEffect(() => {
    fetchReviews(true);
  }, [courseId, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title || undefined,
          content: content || undefined,
          would_recommend: wouldRecommend,
        }),
      });

      if (response.ok) {
        toast.success("Review submitted successfully!");
        setShowForm(false);
        setRating(0);
        setTitle("");
        setContent("");
        setWouldRecommend(true);
        fetchReviews(true);
      } else {
        const error = await response.json();
        toast.error(error.error?.message || "Failed to submit review");
      }
    } catch (error) {
      logger.error(
        "Failed to submit review",
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Student Reviews
          </CardTitle>
          <CardDescription>
            {stats?.totalReviews || 0} reviews from verified students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-bold">
                  {stats?.averageRating || 0}
                </p>
                <StarRating rating={Math.round(stats?.averageRating || 0)} />
                <p className="text-sm text-muted-foreground mt-1">
                  Course Rating
                </p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats?.distribution[star] || 0;
                const percentage = stats?.totalReviews
                  ? Math.round((count / stats.totalReviews) * 100)
                  : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm">{star}</span>
                    </div>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Button */}
          {isEnrolled && !showForm && (
            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={() => setShowForm(true)}
                className="w-full md:w-auto"
              >
                Write a Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm && (
        <Card className="glass-card border-primary/50">
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
            <CardDescription>
              Share your experience to help other students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Your Rating *</Label>
                <StarRating
                  rating={rating}
                  onRate={setRating}
                  interactive
                  size="lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-title">Review Title</Label>
                <Input
                  id="review-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-content">Your Review</Label>
                <Textarea
                  id="review-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What did you like or dislike? What did you learn?"
                  rows={4}
                  maxLength={2000}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="would-recommend"
                  checked={wouldRecommend}
                  onCheckedChange={(checked) =>
                    setWouldRecommend(checked === true)
                  }
                />
                <Label
                  htmlFor="would-recommend"
                  className="text-sm cursor-pointer"
                >
                  I would recommend this course to others
                </Label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Submit Review
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Reviews</CardTitle>
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="pb-6 border-b last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(review.user?.full_name || null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-medium">
                            {review.user?.full_name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(review.created_at),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        {review.would_recommend && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            Recommends
                          </span>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-semibold mt-2">{review.title}</h4>
                      )}
                      {review.content && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {review.content}
                        </p>
                      )}
                      {review.helpful_count > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {review.helpful_count} people found this helpful
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchReviews(false)}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Load More Reviews
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {reviews.length === 0 && !loading && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this course!
            </p>
            {isEnrolled && !showForm && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Write a Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
