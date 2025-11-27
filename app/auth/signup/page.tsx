import { SignupForm } from '@/components/auth/signup-form';

export const metadata = {
  title: 'Create Account | NeuroElemental',
  description: 'Create your free NeuroElemental account',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            NeuroElemental
          </h1>
          <p className="text-muted-foreground">
            Energy management for your neurodivergent brain
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
