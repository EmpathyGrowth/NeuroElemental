'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Award,
  Download,
  Share2,
  ExternalLink,
  Loader2,
  Calendar,
  Clock,
  User,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';
import { formatDate } from '@/lib/utils';

// Dynamically import PDF components to avoid SSR issues
const CertificateDownloadLink = dynamic(
  () => import('@/lib/certificate/generator').then(mod => mod.CertificateDownloadLink),
  { ssr: false, loading: () => <span>Loading...</span> }
);

interface Certificate {
  id: string;
  recipientName: string;
  recipientEmail: string;
  courseTitle: string;
  courseCategory: string | null;
  courseDuration: number | null;
  instructorName: string;
  issuedAt: string;
  verificationCode: string;
  certificateUrl: string | null;
}

export default function CertificateViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, [params.id]);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Certificate not found');
        } else if (res.status === 403) {
          toast.error('You do not have access to this certificate');
        }
        router.push('/dashboard/student/certificates');
        return;
      }

      const data = await res.json();
      setCertificate(data.certificate);
    } catch (error) {
      logger.error('Error fetching certificate:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to load certificate');
      router.push('/dashboard/student/certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const verifyUrl = `${window.location.origin}/verify/${certificate?.verificationCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate?.courseTitle}`,
          text: `I earned a certificate for completing ${certificate?.courseTitle} on NeuroElemental!`,
          url: verifyUrl,
        });
      } catch {
        // User cancelled or share failed
        copyToClipboard(verifyUrl);
      }
    } else {
      copyToClipboard(verifyUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Verification link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  const certificateData = {
    recipientName: certificate.recipientName,
    _certificateTitle: certificate.courseTitle,
    description: `Has successfully completed the course "${certificate.courseTitle}" on NeuroElemental. This certificate recognizes their dedication to personal growth and neurodivergent-friendly learning.`,
    issueDate: certificate.issuedAt ? formatDate(certificate.issuedAt) : 'Unknown',
    certificateNumber: certificate.verificationCode,
    instructorName: certificate.instructorName,
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/student/certificates">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Link>
        </Button>
      </div>

      {/* Certificate Preview Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Certificate of Completion</h1>
            <p className="text-muted-foreground">NeuroElemental</p>
          </div>

          <div className="text-center mb-8">
            <p className="text-muted-foreground mb-2">This certifies that</p>
            <h2 className="text-2xl font-bold text-primary mb-4">{certificate.recipientName}</h2>
            <p className="text-muted-foreground mb-2">has successfully completed</p>
            <h3 className="text-xl font-semibold mb-4">{certificate.courseTitle}</h3>
            {certificate.courseCategory && (
              <Badge variant="secondary" className="mb-4">
                {certificate.courseCategory}
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center border-t pt-6">
            <div>
              <Calendar className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Issued On</p>
              <p className="font-medium">
                {certificate.issuedAt ? formatDate(certificate.issuedAt) : 'Unknown'}
              </p>
            </div>
            {certificate.courseDuration && (
              <div>
                <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{certificate.courseDuration} hours</p>
              </div>
            )}
            <div>
              <User className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Instructor</p>
              <p className="font-medium">{certificate.instructorName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Verification Code</p>
              <p className="font-mono text-lg font-semibold">{certificate.verificationCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recipient Email</p>
              <p>{certificate.recipientEmail}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
            <CardDescription>Share or download your certificate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CertificateDownloadLink certificateData={certificateData}>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CertificateDownloadLink>

            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Certificate
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href={`/verify/${certificate.verificationCode}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Verification Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            This certificate can be verified by anyone using the verification code or by visiting{' '}
            <Link href={`/verify/${certificate.verificationCode}`} className="text-primary hover:underline">
              the verification page
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
