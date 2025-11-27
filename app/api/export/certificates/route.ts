import { errorResponse, forbiddenError, getQueryParam, notFoundError, successResponse, createAuthenticatedRoute } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

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
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificate.certificate_number}`
      }
    });
  } else {
    // Generate PDF certificate
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Certificate design
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const centerX = pageWidth / 2;

    // Border
    doc.lineWidth(3);
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke('#7c3aed');
    doc.lineWidth(1);
    doc.rect(40, 40, pageWidth - 80, pageHeight - 80).stroke('#7c3aed');

    // Header
    doc.fontSize(36)
      .font('Helvetica-Bold')
      .fillColor('#7c3aed')
      .text('Certificate of Completion', 0, 100, { align: 'center' });

    // Subheader
    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('NeuroElemental Learning Platform', 0, 150, { align: 'center' });

    // Recipient name
    doc.fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(certUser.full_name || 'Unknown', 0, 220, { align: 'center' });

    // Achievement text
    doc.fontSize(16)
      .font('Helvetica')
      .fillColor('#4b5563')
      .text('has successfully completed the course', 0, 270, { align: 'center' });

    // Course name
    doc.fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#7c3aed')
      .text(certCourse.title, 0, 310, { align: 'center' });

    // Course details
    if (certCourse.duration_hours) {
      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(`Duration: ${certCourse.duration_hours} hours`, 0, 350, { align: 'center' });
    }

    // Grade if available
    if (certificate.grade) {
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#10b981')
        .text(`Final Grade: ${certificate.grade}%`, 0, 380, { align: 'center' });
    }

    // Skills acquired
    if (certificate.skills_acquired && certificate.skills_acquired.length > 0) {
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Skills Acquired:', 0, 420, { align: 'center' });

      const skillsText = certificate.skills_acquired.join(' • ');
      doc.fontSize(11)
        .text(skillsText, 100, 440, {
          width: pageWidth - 200,
          align: 'center'
        });
    }

    // Issue date
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.fontSize(12)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text(`Issued on ${issuedDate}`, 0, 490, { align: 'center' });

    // Certificate number
    doc.fontSize(10)
      .fillColor('#9ca3af')
      .text(`Certificate No: ${certificate.certificate_number}`, 0, 510, { align: 'center' });

    // Verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${certificate.certificate_number}`;
    doc.fontSize(10)
      .fillColor('#7c3aed')
      .text('Verify at: ', centerX - 150, 530)
      .fillColor('#3b82f6')
      .text(verificationUrl, centerX - 80, 530, {
        link: verificationUrl,
        underline: true
      });

    // Signatures area
    const signatureY = pageHeight - 120;

    // Left signature (CEO/Director)
    doc.fontSize(12)
      .fillColor('#111827')
      .text('_____________________', 150, signatureY, { align: 'center', width: 200 });
    doc.fontSize(10)
      .fillColor('#6b7280')
      .text('Director of Education', 150, signatureY + 20, { align: 'center', width: 200 });
    doc.fontSize(9)
      .text('NeuroElemental', 150, signatureY + 35, { align: 'center', width: 200 });

    // Right signature (Instructor)
    doc.fontSize(12)
      .fillColor('#111827')
      .text('_____________________', pageWidth - 350, signatureY, { align: 'center', width: 200 });
    doc.fontSize(10)
      .fillColor('#6b7280')
      .text('Lead Instructor', pageWidth - 350, signatureY + 20, { align: 'center', width: 200 });
    doc.fontSize(9)
      .text('NeuroElemental', pageWidth - 350, signatureY + 35, { align: 'center', width: 200 });

    // Add watermark/logo (simplified version)
    doc.fontSize(80)
      .fillColor('#7c3aed')
      .opacity(0.1)
      .text('N', centerX - 40, pageHeight / 2 - 40);

    // Restore opacity
    doc.opacity(1);

    // Finalize PDF
    doc.end();

    // Wait for the PDF to be generated
    await new Promise(resolve => doc.on('end', resolve));
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificate.certificate_number}.pdf"`
      }
    });
  }
});

