import { Footer } from '@/components/footer';
import { CourseReviews } from '@/components/feedback/course-reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { courseRepository } from '@/lib/db';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Lock,
  PlayCircle,
  Star,
  Users,
  Video,
} from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds

// Sample course data - in production, this would come from Supabase
const coursesData: Record<string, any> = {
  'energy-management-fundamentals': {
    id: '1',
    slug: 'energy-management-fundamentals',
    title: 'Energy Management Fundamentals',
    subtitle: 'Master the basics of your Element Mix',
    description: 'Learn the core principles of energy management and how to work with your unique Element Mix to prevent burnout and maximize productivity.',
    longDescription: 'This comprehensive course takes you through the fundamentals of the NeuroElemental framework, helping you understand your energy patterns, recognize depletion signals, and build sustainable regeneration practices. Perfect for anyone new to the framework or looking to deepen their self-understanding.',
    instructor: 'Jannik Laursen',
    instructorBio: 'Creator of the NeuroElemental framework and specialist in neurodivergent energy patterns.',
    duration: 6.5,
    difficulty: 'Beginner',
    price: 97,
    thumbnail: '/courses/energy-fundamentals.jpg',
    category: 'Energy Management',
    tags: ['Fundamentals', 'Self-Discovery', 'Burnout Prevention'],
    students: 1247,
    rating: 4.9,
    reviewCount: 342,
    lessons: 24,
    isPublished: true,
    features: [
      'Understand all 6 Elements in depth',
      'Identify your personal energy patterns',
      'Create a custom regeneration plan',
      'Learn to read depletion signals early',
      'Build sustainable daily practices',
      'Certificate of completion',
      'Lifetime access to course materials',
      'Downloadable workbooks and resources',
    ],
    modules: [
      {
        title: 'Introduction to the Elements',
        lessons: 4,
        duration: '45 min',
        description: 'Overview of the 6 Elements and how they interact',
      },
      {
        title: 'Understanding Your Element Mix',
        lessons: 5,
        duration: '1h 15min',
        description: 'Deep dive into your personal Element profile',
      },
      {
        title: 'Energy Depletion Patterns',
        lessons: 4,
        duration: '50 min',
        description: 'How to recognize when you\'re running on empty',
      },
      {
        title: 'Regeneration Strategies',
        lessons: 6,
        duration: '1h 30min',
        description: 'Element-specific ways to restore your energy',
      },
      {
        title: 'Building Sustainable Systems',
        lessons: 5,
        duration: '1h 20min',
        description: 'Create daily routines that actually work for you',
      },
    ],
    whatYouWillLearn: [
      'Complete understanding of all 6 Elements and their characteristics',
      'How to identify your dominant and supporting Elements',
      'Recognition of your unique energy depletion patterns',
      'Element-specific regeneration strategies that actually work',
      'How to design a life that honors your energetic needs',
      'Tools to prevent burnout before it starts',
      'Communication strategies based on Element Mix',
      'How to navigate relationships with different Element types',
    ],
    requirements: [
      'Take the free NeuroElemental assessment (5 minutes)',
      'Open mind and willingness to self-reflect',
      'Notebook or digital tool for journaling',
      'No prior knowledge required',
    ],
  },
  // Add other courses here...
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await courseRepository.getCourseBySlug(slug);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} | NeuroElemental`,
    description: course.description || '',
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try to get course from database
  const dbCourse = await courseRepository.getCourseBySlug(slug);
  let course = dbCourse;

  // Fallback to hardcoded data if database is empty
  if (!course && coursesData[slug]) {
    course = coursesData[slug];
  }

  // Get enrollment count if course exists in database
  const studentCount = course?.id ? await courseRepository.getCourseEnrollmentCount(course.id) : coursesData[slug]?.students || 0;

  if (!course) {
    notFound();
  }

  // Merge database course with fallback data for additional fields
  const fullCourse = {
    ...coursesData[slug], // Fallback data (modules, features, etc.)
    ...course, // Database data (overrides fallback)
    students: studentCount,
    reviewCount: coursesData[slug]?.reviewCount || 0,
    lessons: coursesData[slug]?.lessons || 0,
    modules: coursesData[slug]?.modules || [],
    features: coursesData[slug]?.features || [],
    whatYouWillLearn: coursesData[slug]?.whatYouWillLearn || [],
    requirements: coursesData[slug]?.requirements || [],
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-background" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge>{fullCourse.category || 'Uncategorized'}</Badge>
                <Badge variant="outline" className="capitalize">{fullCourse.difficulty_level || fullCourse.difficulty || 'all levels'}</Badge>
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                  {fullCourse.rating || 4.8} ({fullCourse.reviewCount || 0} reviews)
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {fullCourse.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                {fullCourse.subtitle}
              </p>

              <div className="flex flex-wrap gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{fullCourse.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{fullCourse.duration_hours || fullCourse.duration || 0} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{fullCourse.lessons || 0} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>Certificate included</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">
                {fullCourse.long_description || fullCourse.longDescription || fullCourse.description}
              </p>

              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                  JL
                </div>
                <div>
                  <div className="font-medium">{fullCourse.instructor_name || fullCourse.instructor || 'Jannik Laursen'}</div>
                  <div className="text-sm text-muted-foreground">{fullCourse.instructorBio || 'NeuroElemental framework creator'}</div>
                </div>
              </div>
            </div>

            {/* Sidebar - Purchase Card */}
            <div className="lg:col-span-1">
              <Card className="glass-card sticky top-24 border-primary/50">
                <CardHeader>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <PlayCircle className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">${fullCourse.price_usd || fullCourse.price || 0}</CardTitle>
                  <CardDescription>one-time payment • lifetime access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/auth/signup">
                    <Button className="w-full bg-gradient-to-r from-primary to-[#764BA2] hover:shadow-lg" size="lg">
                      Enroll Now
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full" size="lg">
                      Sign In to Purchase
                    </Button>
                  </Link>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">This course includes:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span>{fullCourse.duration_hours || fullCourse.duration || 0}h on-demand video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-primary" />
                        <span>Downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span>{fullCourse.lessons || 0} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>60-day money-back guarantee</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Outcomes */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(fullCourse.whatYouWillLearn || []).map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Modules */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    {(fullCourse.modules || []).length} modules • {fullCourse.lessons || 0} lessons • {fullCourse.duration_hours || fullCourse.duration || 0}h total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(fullCourse.modules || []).map((module: { title: string; lessons: number; duration: string; description: string }, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">
                              Module {idx + 1}: {module.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {module.description}
                            </p>
                          </div>
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {module.lessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {module.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(fullCourse.requirements || []).map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Student Reviews */}
              {fullCourse.id && (
                <CourseReviews courseId={fullCourse.id} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-card border-primary/50 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to master your energy patterns?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join {fullCourse.students.toLocaleString()} students already transforming their relationship with energy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-primary to-[#764BA2]">
                  Enroll for ${fullCourse.price_usd || fullCourse.price || 0}
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline">
                  View All Courses
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              60-day money-back guarantee • Lifetime access • Certificate included
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
