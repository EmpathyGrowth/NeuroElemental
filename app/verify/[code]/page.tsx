'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Award,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Calendar,
  Clock,
  User,
  BookOpen,
  Shield,
} from 'lucide-react';
import { formatDate, DATE_FORMATS } from '@/lib/utils';
import { logger } from '@/lib/logging';

interface VerifiedCertificate {
  recipientName: string;
  courseTitle: string;
  courseCategory: string | null;
  courseDuration: number | null;
  issuedAt: string | null;
  verificationCode: string;
}

export default function VerifyCertificatePage({ params }: { params: { code: string } }) {
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState('');

  useEffect(() => {
    if (params.code && params.code !== 'search') {
      verifyCertificate(params.code);
    } else {
      setLoading(false);
    }
  }, [params.code]);

  const verifyCertificate = async (code: string) => {
    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const response = await fetch(`/api/certificates/verify?code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setCertificate(data.certificate);
      } else {
        setError(data.error || 'Certificate not found. Please check the verification code.');
      }
    } catch (err) {
      logger.error('Error verifying certificate:', err instanceof Error ? err : new Error(String(err)));
      setError('Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      verifyCertificate(searchCode.trim());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Verifying certificate...</p>
        </div>
      </div>
    );
  }

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
              Enter the verification code from the certificate
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

        {/* Results */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="py-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-semibold mb-2">Certificate Not Found</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact support.
              </p>
            </CardContent>
          </Card>
        )}

        {certificate && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="py-8">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-green-500/20 text-green-600 text-lg px-4 py-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Verified Certificate
                </Badge>
                <p className="text-muted-foreground">
                  This certificate is authentic and was issued by NeuroElemental
                </p>
              </div>

              <div className="bg-background rounded-xl p-8 border shadow-sm">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-10 h-10 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{certificate.courseTitle}</h2>
                    {certificate.courseCategory && (
                      <Badge variant="outline">{certificate.courseCategory}</Badge>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recipient</p>
                        <p className="font-semibold">{certificate.recipientName}</p>
                      </div>
                    </div>

                    {certificate.issuedAt && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Issued On</p>
                          <p className="font-semibold">
                            {formatDate(certificate.issuedAt, DATE_FORMATS.LONG)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {certificate.courseDuration && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Course Duration</p>
                          <p className="font-semibold">{certificate.courseDuration} hours</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verification Code</p>
                        <p className="font-mono font-semibold">{certificate.verificationCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Certificate Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              NeuroElemental certificates are issued upon successful completion of our courses.
              Each certificate contains a unique verification code that can be used to confirm
              its authenticity.
            </p>
            <p>
              The verification code is located at the bottom of the certificate and follows the
              format: <span className="font-mono">NE-YYYY-XXXXXX</span>
            </p>
            <div className="pt-4">
              <Button variant="outline" asChild>
                <Link href="/courses">Browse Our Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
