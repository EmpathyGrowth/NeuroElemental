import { CertificatePDF } from '@/components/certificates/certificate-pdf';
import { createAuthenticatedRoute, errorResponse, forbiddenError, getQueryParam, notFoundError, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { Document, renderToStream } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import React from 'react';

/** Certificate with user and course details */
interface CertificateWithDetails {
  id: string;
  user_id: string;
  certificate_number: string;
  issued_at: string;
  expires_at: string | null;
  grade: number | null;
  skills_acquired: string[] | null;
  user: {
    full_name: string | null;
    email: string | null;
  } | null;
  course: {
    title: string;
    description: string | null;
    category: string | null;
    duration_hours: number | null;
  } | null;
}

/** Supabase error type */
interface SupabaseError {
  message: string;
  code?: string;
}

export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();

  const certificateId = getQueryParam(request, 'id');
  if (!certificateId) {
    throw notFoundError('Certificate ID is required');
  }
  const format = getQueryParam(request, 'format') || 'pdf';

  // Get certificate details
  const { data: certificate, error } = (await supabase
    .from('certificates')
    .select(`
        *,
        user:profiles(
          full_name,
          email
        ),
        course:courses(
          title,
          description,
          category,
          duration_hours
        )
      `)
    .eq('id', certificateId)
    .single()) as { data: CertificateWithDetails | null; error: SupabaseError | null };

  if (error || !certificate) {
    throw notFoundError('Certificate not found');
  }

  // Verify user and course data are present
  if (!certificate.user || !certificate.course) {
    throw notFoundError('Certificate data incomplete');
  }

  // Verify user owns this certificate or is admin
  if (certificate.user_id !== user.id) {
    const role = await getUserRole();
    if (role !== 'admin') {
      return errorResponse(forbiddenError('Access denied'));
    }
  }

  // Extract user and course for type narrowing
  const certUser = certificate.user;
  const certCourse = certificate.course;
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificate.certificate_number}`;

  if (format === 'json') {
    // Return certificate data as JSON
    return successResponse({
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificate_number,
        recipientName: certUser.full_name,
        courseName: certCourse.title,
        courseCategory: certCourse.category,
        courseDuration: certCourse.duration_hours,
        issuedDate: certificate.issued_at,
        expiresDate: certificate.expires_at,
        grade: certificate.grade,
        skills: certificate.skills_acquired,
        verificationUrl
      }
    });
  } else {
    // Generate PDF certificate using @react-pdf/renderer
    const stream = await renderToStream(
      React.createElement(Document, {},
        React.createElement(CertificatePDF, {
          recipientName: certUser.full_name || 'Unknown',
          courseTitle: certCourse.title,
          durationHours: certCourse.duration_hours,
          grade: certificate.grade,
          skills: certificate.skills_acquired,
          issuedAt: certificate.issued_at,
          certificateNumber: certificate.certificate_number,
          verificationUrl: verificationUrl
        })
      )
    );

    return new NextResponse(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificate.certificate_number}.pdf"`
      }
    });
  }
});

