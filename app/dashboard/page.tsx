import { UserOverview } from '@/components/dashboard/user-overview';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (!profile || !('role' in profile)) {
    // If no profile exists, something is wrong or they haven't completed setup
    // Redirect to onboarding or a setup page
    redirect('/onboarding');
  }

  // Redirect to role-specific dashboards
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
      // Registered users without a specific role stay on the default dashboard
      break;
    default:
      // Unknown role, show default dashboard
      break;
  }

  // If we haven't redirected, render the default dashboard view
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to NeuroElemental</h1>

        <div className="grid gap-6 mb-6">
          <UserOverview userId={user.id} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          <div className="glass-card p-6 border border-border/50 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Tools & Resources</h2>
            <p className="text-muted-foreground mb-4">
              Practical tools for managing your energy
            </p>
            <a
              href="/tools"
              className="text-primary hover:underline"
            >
              Explore Tools →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
