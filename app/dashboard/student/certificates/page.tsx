'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { formatDate, DATE_FORMATS } from '@/lib/utils';

// Sample certificates - in production, from database
const certificates = [
  {
    id: 'cert-001',
    courseTitle: 'Burnout Recovery Roadmap',
    issuedAt: '2024-09-15',
    verificationCode: 'NE-CERT-A1B2C3D4',
    certificateUrl: '/certificates/cert-001.pdf',
  },
];

export default function StudentCertificatesPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
        <p className="text-muted-foreground">
          Your earned achievements and accomplishments
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">Course completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5</div>
            <p className="text-xs text-muted-foreground">Total time invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Of started courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Certificates */}
      {certificates.length > 0 ? (
        <div className="space-y-6">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="glass-card hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-12 h-12 text-yellow-500" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-3 bg-green-500/10 text-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                        <h3 className="text-2xl font-bold mb-2">{cert.courseTitle}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Issued on {formatDate(cert.issuedAt, DATE_FORMATS.LONG)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Verification Code: <span className="font-mono font-semibold text-foreground">{cert.verificationCode}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share to LinkedIn
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Verify Online
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete your first course to earn a certificate!
            </p>
            <Button asChild>
              <Link href="/dashboard/student/courses">View My Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* How Certificates Work */}
      <Card className="glass-card mt-8">
        <CardHeader>
          <CardTitle>About Your Certificates</CardTitle>
          <CardDescription>How NeuroElemental certification works</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">✅ What You Get:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Official NeuroElemental completion certificate</li>
                <li>• Unique verification code</li>
                <li>• Downloadable PDF (print quality)</li>
                <li>• Shareable on LinkedIn and social media</li>
                <li>• Permanent verification link</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎓 How to Earn:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Complete all course lessons</li>
                <li>• Pass all quizzes (70% or higher)</li>
                <li>• Finish within 12 months of enrollment</li>
                <li>• Certificate auto-generates on completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
