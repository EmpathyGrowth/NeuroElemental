'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Shield, Award, CheckCircle } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [searchCode, setSearchCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      router.push(`/verify/${encodeURIComponent(searchCode.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Certificate Verification</h1>
          <p className="text-muted-foreground text-lg">
            Verify the authenticity of a NeuroElemental certificate
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Verify a Certificate</CardTitle>
            <CardDescription>
              Enter the verification code from the certificate to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="e.g., NE-2024-ABC123"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!searchCode.trim()}>
                <Search className="w-4 h-4 mr-2" />
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What is a verification code?</h3>
                  <p className="text-sm text-muted-foreground">
                    Each NeuroElemental certificate has a unique code that can be used to verify
                    its authenticity. The code is located at the bottom of the certificate.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Why verify?</h3>
                  <p className="text-sm text-muted-foreground">
                    Employers and organizations can verify certificates to confirm
                    that a candidate has successfully completed our courses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About NeuroElemental Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              NeuroElemental certificates are awarded to students who successfully complete
              our neurodivergent-focused education courses. Each certificate represents
              mastery of course material and passing all required assessments.
            </p>
            <p>
              Our certificates feature:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Unique verification codes for authenticity</li>
              <li>Course completion details and duration</li>
              <li>Issue date and recipient information</li>
              <li>Shareable links for professional profiles</li>
            </ul>
            <div className="pt-4 flex gap-4">
              <Button variant="outline" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
