'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BookOpen, Building2, CheckCircle2, GraduationCap, Loader2, School } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refetchProfile } = useAuth();
  const [role, setRole] = useState<string>('student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('profiles')
        .update({ role: role })
        .eq('id', user.id);

      if (error) throw error;

      await refetchProfile();

      toast.success('Profile updated successfully!');

      // Redirect based on role
      switch (role) {
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'instructor':
          router.push('/dashboard/instructor');
          break;
        case 'business':
          router.push('/dashboard/business');
          break;
        case 'school':
          router.push('/dashboard/school');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error updating profile:', err as Error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'student',
      icon: GraduationCap,
      title: 'Student / Individual',
      description: 'I want to understand my energy and improve my life.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 'instructor',
      icon: BookOpen,
      title: 'Instructor / Coach',
      description: 'I want to use the framework with my clients.',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      id: 'business',
      icon: Building2,
      title: 'Business',
      description: 'I want to improve team dynamics and productivity.',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      id: 'school',
      icon: School,
      title: 'School / Institution',
      description: 'I want to support neurodivergent students.',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Card className="glass-premium border-primary/10 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              Welcome to NeuroElemental
            </CardTitle>
            <CardDescription className="text-lg mt-3 text-muted-foreground/80">
              Let's personalize your experience. How will you use the platform?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((r) => (
                  <Label
                    key={r.id}
                    htmlFor={r.id}
                    className={cn(
                      "relative flex flex-col items-center justify-between rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 group overflow-hidden",
                      role === r.id
                        ? `border-primary bg-primary/5 shadow-lg scale-[1.02]`
                        : "border-muted/50 hover:border-primary/30 hover:bg-accent/50"
                    )}
                  >
                    <RadioGroupItem value={r.id} id={r.id} className="sr-only" />

                    {role === r.id && (
                      <motion.div
                        layoutId="selected-check"
                        className="absolute top-3 right-3 text-primary"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    )}

                    <div className={cn("p-4 rounded-full mb-4 transition-colors", r.bg, role === r.id ? "bg-primary/20" : "")}>
                      <r.icon className={cn("h-8 w-8", r.color)} />
                    </div>

                    <div className="text-center relative z-10">
                      <h3 className="font-bold text-lg mb-1">{r.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {r.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>

              <Button
                type="submit"
                className="w-full text-lg py-6 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up your profile...
                  </>
                ) : (
                  'Continue to Dashboard'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

