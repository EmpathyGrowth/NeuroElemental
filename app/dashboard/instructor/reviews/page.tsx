"use client";

import { DashboardHeader } from "@/components/dashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Filter,
  MessageSquare,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  course_id: string;
  course_title: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  helpful_count: number;
  created_at: string;
  responded: boolean;
}

interface RatingSummary {
  average: number;
  total: number;
  distribution: { stars: number; count: number; percentage: number }[];
}

interface CourseRating {
  course_id: string;
  title: string;
  average_rating: number;
  review_count: number;
}

export default function InstructorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary>({
    average: 4.7,
    total: 47,
    distribution: [
      { stars: 5, count: 32, percentage: 68 },
      { stars: 4, count: 10, percentage: 21 },
      { stars: 3, count: 3, percentage: 6 },
      { stars: 2, count: 1, percentage: 2 },
      { stars: 1, count: 1, percentage: 2 },
    ],
  });
  const [courseRatings, setCourseRatings] = useState<CourseRating[]>([]);
  const [_loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/instructor/reviews?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setSummary(data.summary);
        setCourseRatings(data.courseRatings);
      } else {
        // Use mock data
        setReviews([
          {
            id: "1",
            course_id: "1",
            course_title: "Energy Mastery Fundamentals",
            user_name: "Sarah M.",
            rating: 5,
            comment:
              "This course completely changed how I understand my energy patterns. The practical exercises were especially helpful for implementing what I learned.",
            helpful_count: 12,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            responded: true,
          },
          {
            id: "2",
            course_id: "1",
            course_title: "Energy Mastery Fundamentals",
            user_name: "Michael R.",
            rating: 4,
            comment:
              "Great content overall. Would have loved more examples for the Water element specifically, but still very valuable.",
            helpful_count: 8,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            responded: false,
          },
          {
            id: "3",
            course_id: "2",
            course_title: "Advanced Energy Techniques",
            user_name: "Emily T.",
            rating: 5,
            comment:
              "The advanced techniques really helped me take my energy management to the next level. Highly recommend for anyone who completed the fundamentals course!",
            helpful_count: 15,
            created_at: new Date(Date.now() - 259200000).toISOString(),
            responded: true,
          },
        ]);
        setCourseRatings([
          {
            course_id: "1",
            title: "Energy Mastery Fundamentals",
            average_rating: 4.8,
            review_count: 25,
          },
          {
            course_id: "2",
            title: "Advanced Energy Techniques",
            average_rating: 4.9,
            review_count: 10,
          },
          {
            course_id: "3",
            title: "Element Relationships Workshop",
            average_rating: 4.6,
            review_count: 12,
          },
        ]);
      }
    } catch {
      // Keep mock data
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="Course Reviews"
        subtitle="Student feedback and ratings"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/instructor">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{summary.average}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{summary.total}</p>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {summary.distribution[0].percentage}%
                </p>
                <p className="text-sm text-muted-foreground">5-Star Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {reviews.filter((r) => !r.responded).length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Reply</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.distribution.map((d) => (
              <div key={d.stars} className="flex items-center gap-3">
                <span className="text-sm w-12">{d.stars} star</span>
                <Progress value={d.percentage} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {d.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Course Ratings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ratings by Course</CardTitle>
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseRatings.map((course) => (
                <div
                  key={course.course_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.review_count} reviews
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(course.average_rating), "sm")}
                    <span className="font-semibold">
                      {course.average_rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>
                Latest feedback from your students
              </CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Pending Reply</SelectItem>
                <SelectItem value="5star">5 Stars Only</SelectItem>
                <SelectItem value="low">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b pb-6 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user_avatar} />
                      <AvatarFallback>
                        {review.user_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.user_name}</p>
                        {review.responded && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-500/10 text-green-600 border-green-500/30"
                          >
                            Replied
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {review.course_title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(review.rating)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(review.created_at)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {review.comment}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{review.helpful_count} found helpful</span>
                  </div>
                  {!review.responded && (
                    <Button size="sm" variant="outline">
                      Reply to Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
