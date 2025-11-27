import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !('role' in profile)) {
    // If no profile exists, something is wrong or they haven't completed setup
    // Redirect to onboarding or a setup page
    redirect('/onboarding');
  }

  switch (profile.role) {
    case 'admin':
      redirect('/dashboard/admin');
    case 'instructor':
      redirect('/dashboard/instructor');
    case 'student':
      redirect('/dashboard/student');
    case 'business':
    case 'school':
      redirect('/dashboard/business');
    case 'registered':
      redirect('/onboarding');
    default:
      // Fallback if role is unknown or just 'user'
      // We stay here or redirect to a default view
      // But since this page is just a router, we should probably show something or redirect to a generic dashboard
      // For now, let's redirect to student as a safe default or show a basic view
      // But the original code redirected to '/dashboard' for default, which would loop.
      // If we are AT /dashboard, we can't redirect to /dashboard.
      // So we should render the "Welcome" content here if no specific role dashboard exists.
      break;
  }

  // If we haven't redirected, render the default dashboard view
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to NeuroElemental</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="glass-card p-6 border border-border/50 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Your Element Mix</h2>
            <p className="text-muted-foreground mb-4">
              View your assessment results and element profile
            </p>
            <a
              href="/results"
              className="text-primary hover:underline"
            >
              View Results →
            </a>
          </div>

          <div className="glass-card p-6 border border-border/50 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Explore Courses</h2>
            <p className="text-muted-foreground mb-4">
              Discover courses to deepen your understanding
            </p>
            <a
              href="/courses"
              className="text-primary hover:underline"
            >
              Browse Courses →
            </a>
          </div>

          <div className="glass-card p-6 border border-border/50 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground mb-4">
              Join workshops and community events
            </p>
            <a
              href="/events"
              className="text-primary hover:underline"
            >
              View Events →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

