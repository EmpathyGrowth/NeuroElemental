import { Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';

// Register fonts (using standard fonts for now, can add custom ones later)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    position: 'relative',
  },
  borderOuter: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    borderWidth: 3,
    borderColor: '#7c3aed', // Primary purple
  },
  borderInner: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    bottom: 40,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  header: {
    fontSize: 36,
    color: '#7c3aed',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 40,
  },
  recipientName: {
    fontSize: 28,
    color: '#111827',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 24,
    color: '#7c3aed',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  details: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  grade: {
    fontSize: 16,
    color: '#10b981', // Green
    marginTop: 10,
    marginBottom: 20,
  },
  skillsSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  skillsLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  skillsList: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    maxWidth: 400,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBlock: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    width: '100%',
    marginBottom: 5,
  },
  signatureTitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  signatureOrg: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  meta: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  certNumber: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 5,
  },
  verifyLink: {
    fontSize: 10,
    color: '#3b82f6',
    textDecoration: 'underline',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    fontSize: 80,
    color: '#7c3aed',
    opacity: 0.1,
  },
});

interface CertificatePDFProps {
  recipientName: string;
  courseTitle: string;
  durationHours?: number | null;
  grade?: number | null;
  skills?: string[] | null;
  issuedAt: string;
  certificateNumber: string;
  verificationUrl: string;
}

export const CertificatePDF: React.FC<CertificatePDFProps> = ({
  recipientName,
  courseTitle,
  durationHours,
  grade,
  skills,
  issuedAt,
  certificateNumber,
  verificationUrl,
}) => {
  const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Page size="LETTER" orientation="landscape" style={styles.page}>
      {/* Borders */}
      <View style={styles.borderOuter} />
      <View style={styles.borderInner} />

      {/* Watermark */}
      <Text style={styles.watermark}>N</Text>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.header}>Certificate of Completion</Text>
        <Text style={styles.subHeader}>NeuroElemental Learning Platform</Text>

        <Text style={styles.recipientName}>{recipientName}</Text>
        <Text style={styles.text}>has successfully completed the course</Text>

        <Text style={styles.courseTitle}>{courseTitle}</Text>

        {durationHours && (
          <Text style={styles.details}>Duration: {durationHours} hours</Text>
        )}

        {grade && (
          <Text style={styles.grade}>Final Grade: {grade}%</Text>
        )}

        {skills && skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.skillsLabel}>Skills Acquired:</Text>
            <Text style={styles.skillsList}>{skills.join(' • ')}</Text>
          </View>
        )}
      </View>

      {/* Meta Info */}
      <View style={styles.meta}>
        <Text style={styles.date}>Issued on {formattedDate}</Text>
        <Text style={styles.certNumber}>Certificate No: {certificateNumber}</Text>
        <Text style={styles.verifyLink}>Verify at: {verificationUrl}</Text>
      </View>

      {/* Signatures */}
      <View style={styles.footer}>
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureTitle}>Director of Education</Text>
          <Text style={styles.signatureOrg}>NeuroElemental</Text>
        </View>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureTitle}>Lead Instructor</Text>
          <Text style={styles.signatureOrg}>NeuroElemental</Text>
        </View>
      </View>
    </Page>
  );
};
