import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { courseRepository } from '@/lib/db';
import { ArrowRight, BookOpen, CheckCircle, Clock, Star, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

/** Display course type that merges database and fallback data */
interface DisplayCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  long_description?: string | null;
  instructor_name?: string | null;
  duration_hours: number | null;
  difficulty_level: string | null;
  price_usd: number;
  thumbnail_url?: string | null;
  category: string | null;
  tags?: string[] | null;
  students: number;
  rating: number;
  lessons: number;
  is_published?: boolean | null;
  features: string[];
}

export const metadata: Metadata = {
  title: 'Courses | NeuroElemental',
  description: 'Learn to understand and work with your unique energy patterns through our comprehensive courses.',
};

export const revalidate = 60; // Revalidate every 60 seconds

// Fallback course data (used if database is empty)
const courses_fallback: DisplayCourse[] = [
  {
    id: '1',
    slug: 'energy-management-fundamentals',
    title: 'Energy Management Fundamentals',
    subtitle: 'Master the basics of your Element Mix',
    description: 'Learn the core principles of energy management and how to work with your unique Element Mix to prevent burnout and maximize productivity.',
    long_description: 'This comprehensive course takes you through the fundamentals of the NeuroElemental framework, helping you understand your energy patterns, recognize depletion signals, and build sustainable regeneration practices.',
    instructor_name: 'Jannik Laursen',
    duration_hours: 6.5,
    difficulty_level: 'beginner',
    price_usd: 97,
    thumbnail_url: '/courses/energy-fundamentals.jpg',
    category: 'Energy Management',
    tags: ['Fundamentals', 'Self-Discovery', 'Burnout Prevention'],
    students: 1247,
    rating: 4.9,
    lessons: 24,
    is_published: true,
    features: [
      'Understand all 6 Elements in depth',
      'Identify your personal energy patterns',
      'Create a custom regeneration plan',
      'Learn to read depletion signals early',
      'Build sustainable daily practices',
      'Certificate of completion',
    ],
  },
  {
    id: '2',
    slug: 'elemental-communication',
    title: 'Elemental Communication',
    subtitle: 'Connect across different energy types',
    description: 'Discover how different Element Mixes communicate and learn to bridge the gaps for more effective relationships and collaboration.',
    long_description: 'Communication challenges often stem from different energetic approaches. This course teaches you to recognize and adapt to different communication styles based on Element Mixes.',
    instructor_name: 'Jannik Laursen',
    duration_hours: 4,
    difficulty_level: 'intermediate',
    price_usd: 77,
    thumbnail_url: '/courses/communication.jpg',
    category: 'Relationships',
    tags: ['Communication', 'Relationships', 'Workplace'],
    students: 892,
    rating: 4.8,
    lessons: 16,
    is_published: true,
    features: [
      'Understand communication by Element',
      'Identify conversation energy drains',
      'Adapt your communication style',
      'Navigate difficult conversations',
      'Build stronger relationships',
      'Workplace communication strategies',
    ],
  },
  {
    id: '3',
    slug: 'instructor-certification-level-1',
    title: 'Instructor Certification - Level 1',
    subtitle: 'Become a Certified NeuroElemental Practitioner',
    description: 'Complete training to become a certified NeuroElemental Instructor and teach the framework professionally.',
    long_description: 'This intensive certification program prepares you to facilitate NeuroElemental assessments, workshops, and coaching sessions. Includes all teaching materials and ongoing support.',
    instructor_name: 'Jannik Laursen',
    duration_hours: 20,
    difficulty_level: 'advanced',
    price_usd: 497,
    thumbnail_url: '/courses/instructor-cert.jpg',
    category: 'Professional Development',
    tags: ['Certification', 'Teaching', 'Professional'],
    students: 234,
    rating: 4.9,
    lessons: 48,
    is_published: true,
    features: [
      'Complete theoretical foundation',
      'Assessment administration training',
      'Workshop facilitation skills',
      'Ethics and boundaries',
      'All teaching materials included',
      'Ongoing instructor support',
      'Listed in instructor directory',
      'Official certification badge',
    ],
  },
  {
    id: '4',
    slug: 'burnout-recovery-roadmap',
    title: 'Burnout Recovery Roadmap',
    subtitle: 'Find your way back from exhaustion',
    description: 'A structured path to recover from burnout while rebuilding your energy management systems for long-term sustainability.',
    long_description: 'If you\'re currently experiencing burnout, this course provides a compassionate, step-by-step approach to recovery that honors your nervous system\'s needs.',
    instructor_name: 'Jannik Laursen',
    duration_hours: 5,
    difficulty_level: 'beginner',
    price_usd: 87,
    thumbnail_url: '/courses/burnout-recovery.jpg',
    category: 'Energy Management',
    tags: ['Burnout', 'Recovery', 'Self-Care'],
    students: 1089,
    rating: 4.9,
    lessons: 20,
    is_published: true,
    features: [
      'Assess your burnout stage',
      'Create recovery timeline',
      'Gentle regeneration practices',
      'Set sustainable boundaries',
      'Rebuild capacity gradually',
      'Prevent future burnout',
    ],
  },
  {
    id: '5',
    slug: 'workplace-energy-optimization',
    title: 'Workplace Energy Optimization',
    subtitle: 'Thrive in your work environment',
    description: 'Apply the NeuroElemental framework to your professional life for increased productivity without sacrificing your wellbeing.',
    long_description: 'This practical course helps you design your work life around your energy patterns, whether you\'re employed, freelance, or running a business.',
    instructor_name: 'Jannik Laursen',
    duration_hours: 7,
    difficulty_level: 'intermediate',
    price_usd: 97,
    thumbnail_url: '/courses/workplace.jpg',
    category: 'Professional Development',
    tags: ['Workplace', 'Productivity', 'Career'],
    students: 756,
    rating: 4.7,
    lessons: 28,
    is_published: true,
    features: [
      'Optimize your work schedule',
      'Design an energy-friendly workspace',
      'Navigate workplace demands',
      'Set professional boundaries',
      'Manage energy in meetings',
      'Career planning by Element',
    ],
  },
  {
    id: '6',
    slug: 'parenting-with-elements',
    title: 'Parenting with Elements',
    subtitle: 'Understanding your child\'s energy patterns',
    description: 'Learn to recognize and support your child\'s unique Element Mix for more harmonious family dynamics.',
    long_description: 'Every child has their own energetic blueprint. This course helps parents understand and honor their children\'s needs while managing their own energy.',
    instructor_name: 'Jannik Laursen',
    duration_hours: 5.5,
    difficulty_level: 'beginner',
    price_usd: 87,
    thumbnail_url: '/courses/parenting.jpg',
    category: 'Family & Relationships',
    tags: ['Parenting', 'Family', 'Children'],
    students: 623,
    rating: 4.8,
    lessons: 22,
    is_published: true,
    features: [
      'Identify child\'s Element Mix',
      'Support different energy types',
      'Handle tantrums and meltdowns',
      'Create family routines that work',
      'Navigate school challenges',
      'Parent-child energy dynamics',
    ],
  },
];

const _categories = ['All', 'Energy Management', 'Relationships', 'Professional Development', 'Family & Relationships'];
const _difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

// Sample course features data (this would be in course modules/lessons in production)
const courseFeatures: Record<string, string[]> = {
  'energy-management-fundamentals': [
    'Understand all 6 Elements in depth',
    'Identify your personal energy patterns',
    'Create a custom regeneration plan',
  ],
  'elemental-communication': [
    'Understand communication by Element',
    'Identify conversation energy drains',
    'Adapt your communication style',
  ],
  'instructor-certification-level-1': [
    'Complete theoretical foundation',
    'Assessment administration training',
    'Workshop facilitation skills',
  ],
  'burnout-recovery-roadmap': [
    'Assess your burnout stage',
    'Create recovery timeline',
    'Gentle regeneration practices',
  ],
  'workplace-energy-optimization': [
    'Optimize your work schedule',
    'Design an energy-friendly workspace',
    'Navigate workplace demands',
  ],
  'parenting-with-elements': [
    'Identify child\'s Element Mix',
    'Support different energy types',
    'Handle tantrums and meltdowns',
  ],
};

export default async function CoursesPage() {
  // Fetch courses from database
  const dbCourses = await courseRepository.getPublishedCourses();

  // Fetch enrollment counts for each course
  const coursesWithStats: DisplayCourse[] = await Promise.all(
    (dbCourses || []).map(async (course) => {
      const studentCount = await courseRepository.getCourseEnrollmentCount(course.id);
      return {
        ...course,
        students: studentCount,
        rating: 4.8, // In production, calculate from reviews
        lessons: 20, // In production, count from course_lessons
        features: courseFeatures[course.slug] || [],
      };
    })
  );

  // Use database courses if available, otherwise use fallback
  const displayCourses: DisplayCourse[] = coursesWithStats.length > 0 ? coursesWithStats : courses_fallback;
  const totalStudents = displayCourses.reduce((sum, c) => sum + (c.students || 0), 0);
  const avgRating = 4.8; // Calculate from reviews in production

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        badge="📚 Professional Development"
        title={
          <>
            Master Your <span className="gradient-text">Energy Patterns</span>
          </>
        }
        description="Comprehensive courses designed to help you understand and optimize your unique Element Mix"
      >
        <div className="flex flex-wrap justify-center gap-6 text-sm mt-8">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Self-paced learning</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Lifetime access</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span>Certificate of completion</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">{displayCourses.length}</div>
              <div className="text-sm text-muted-foreground">Active Courses</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">{totalStudents.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">{avgRating}</div>
              <div className="text-sm text-muted-foreground">Avg. Rating</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold gradient-text mb-1">92%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </CardContent>
          </Card>
        </div>
      </HeroSection>

      {/* Course Grid */}
      <section className="py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course) => (
              <Card key={course.id} className="glass-card hover:shadow-xl transition-all duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary">{course.category || 'Uncategorized'}</Badge>
                    <Badge variant="outline" className="capitalize">{course.difficulty_level || 'all levels'}</Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                  <CardDescription>{course.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{course.duration_hours || 0}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{course.lessons || 0} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{(course.students || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{course.rating || 0} ({course.students || 0})</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">What you'll learn:</p>
                    <ul className="space-y-1">
                      {(course.features || []).slice(0, 3).map((feature: string, idx: number) => (
                        <li key={idx} className="text-xs flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-2xl font-bold">${course.price_usd || 0}</div>
                    <div className="text-xs text-muted-foreground">one-time payment</div>
                  </div>
                  <Link href={`/courses/${course.slug}`}>
                    <Button>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="glass-card border-primary/50 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Not sure where to start?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take our free assessment to discover your unique Element Mix and get personalized course recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-[#764BA2]">
                  Take Free Assessment
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
