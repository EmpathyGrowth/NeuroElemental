'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logging';
import {
    AlertCircle,
    ArrowRight,
    Award,
    Briefcase,
    CheckCircle,
    Clock,
    FileText,
    Globe,
    GraduationCap,
    Loader2,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CertificationApplication {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  experience_years: number;
  background: string;
  motivation: string;
  specializations: string[];
  website_url?: string;
  linkedin_url?: string;
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

const SPECIALIZATIONS = [
  { id: 'adhd', label: 'ADHD & Executive Function' },
  { id: 'autism', label: 'Autism Spectrum Support' },
  { id: 'anxiety', label: 'Anxiety & Stress Management' },
  { id: 'burnout', label: 'Burnout Prevention & Recovery' },
  { id: 'workplace', label: 'Workplace Neurodiversity' },
  { id: 'education', label: 'Educational Settings' },
  { id: 'coaching', label: 'Life & Career Coaching' },
  { id: 'therapy', label: 'Therapeutic Applications' },
];

export default function CertificationPage() {
  const { user, profile, refetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<CertificationApplication | null>(null);

  // Form state
  const [experienceYears, setExperienceYears] = useState('');
  const [background, setBackground] = useState('');
  const [motivation, setMotivation] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [user]);

  const fetchApplication = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/certifications/my-application');
      if (response.ok) {
        const data = await response.json();
        if (data.application) {
          setApplication(data.application);
        }
      }
    } catch (error) {
      logger.error('Failed to fetch application', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (specializations.length === 0) {
      toast.error('Please select at least one specialization');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/certifications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certification_level: 'instructor',
          experience_years: parseInt(experienceYears),
          professional_background: background,
          motivation,
          specializations,
          website_url: websiteUrl || undefined,
          linkedin_url: linkedinUrl || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
        toast.success('Application submitted successfully!');
        refetchProfile();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit application');
      }
    } catch (error) {
      logger.error('Failed to submit application', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSpecialization = (id: string) => {
    setSpecializations((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: CertificationApplication['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Not Approved
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Already certified
  if (profile?.instructor_status === 'approved') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="glass-card border-green-500/20">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're Certified!</h2>
            <p className="text-muted-foreground mb-6">
              Congratulations! You're a certified NeuroElemental instructor.
            </p>
            <Button asChild>
              <a href="/dashboard/instructor">
                Go to Instructor Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has pending or rejected application
  if (application) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Certification Application</h1>
          <p className="text-muted-foreground">
            Track the status of your instructor certification application
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Status
              </CardTitle>
              {getStatusBadge(application.status)}
            </div>
            <CardDescription>
              Submitted on {new Date(application.submitted_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {application.status === 'pending' && (
              <div className="flex items-start gap-4 p-4 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-500">Under Review</p>
                  <p className="text-sm text-muted-foreground">
                    Our team is reviewing your application. This typically takes 3-5 business days.
                    We'll notify you via email once a decision has been made.
                  </p>
                </div>
              </div>
            )}

            {application.status === 'rejected' && (
              <div className="flex items-start gap-4 p-4 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-500">Application Not Approved</p>
                  {application.rejection_reason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reason: {application.rejection_reason}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    You may submit a new application after 30 days with additional qualifications.
                  </p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Years of Experience</Label>
                <p className="font-medium">{application.experience_years} years</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Specializations</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.specializations.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {SPECIALIZATIONS.find((s) => s.id === spec)?.label || spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Background</Label>
              <p className="mt-1 text-sm">{application.background}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Motivation</Label>
              <p className="mt-1 text-sm">{application.motivation}</p>
            </div>

            {(application.website_url || application.linkedin_url) && (
              <div className="flex gap-4">
                {application.website_url && (
                  <a
                    href={application.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {application.linkedin_url && (
                  <a
                    href={application.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Briefcase className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show application form
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Become a Certified Instructor</h1>
        <p className="text-muted-foreground">
          Join our community of certified NeuroElemental instructors
        </p>
      </div>

      {/* Benefits Section */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Why Get Certified?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Exclusive Training</h4>
                <p className="text-sm text-muted-foreground">
                  Access to advanced instructor resources and training materials
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold">Create Courses</h4>
                <p className="text-sm text-muted-foreground">
                  Build and sell your own courses on the NeuroElemental platform
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold">Community Access</h4>
                <p className="text-sm text-muted-foreground">
                  Join our network of instructors and collaborate with peers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>
            Tell us about your experience and why you want to become an instructor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Relevant Experience *</Label>
                <Select value={experienceYears} onValueChange={setExperienceYears}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1-2 years</SelectItem>
                    <SelectItem value="3">3-5 years</SelectItem>
                    <SelectItem value="6">6-10 years</SelectItem>
                    <SelectItem value="10">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile (optional)</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website/Portfolio (optional)</Label>
              <Input
                id="website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">
                Professional Background *
                <span className="text-muted-foreground font-normal ml-1">(min. 100 characters)</span>
              </Label>
              <Textarea
                id="background"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Describe your professional background, qualifications, and experience working with neurodivergent individuals..."
                rows={4}
                minLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {background.length}/100 characters minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">
                Why do you want to become an instructor? *
                <span className="text-muted-foreground font-normal ml-1">(min. 100 characters)</span>
              </Label>
              <Textarea
                id="motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Tell us what motivates you to teach the NeuroElemental framework and how you plan to use your certification..."
                rows={4}
                minLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                {motivation.length}/100 characters minimum
              </p>
            </div>

            <div className="space-y-3">
              <Label>Areas of Specialization * (select at least one)</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {SPECIALIZATIONS.map((spec) => (
                  <div
                    key={spec.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      specializations.includes(spec.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleSpecialization(spec.id)}
                  >
                    <Checkbox
                      checked={specializations.includes(spec.id)}
                      onCheckedChange={() => toggleSpecialization(spec.id)}
                    />
                    <span className="text-sm">{spec.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <div>
                <Label htmlFor="terms" className="cursor-pointer">
                  I agree to the terms and conditions *
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  By submitting this application, I confirm that all information provided is accurate
                  and I agree to abide by the NeuroElemental instructor code of conduct.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
