import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Certificate styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    position: 'relative',
  },
  border: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: '3px solid #7c3aed',
    borderRadius: 10,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    textAlign: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  recipient: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 60,
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
  },
  signature: {
    alignItems: 'center',
    width: '40%',
  },
  signatureLine: {
    width: '100%',
    borderBottom: '1px solid #999',
    marginBottom: 10,
  },
  signatureText: {
    fontSize: 12,
    color: '#666',
  },
  certNumber: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    fontSize: 10,
    color: '#999',
  },
  date: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 20,
  },
});

interface CertificateData {
  recipientName: string;
  _certificateTitle: string;
  description: string;
  issueDate: string;
  certificateNumber: string;
  instructorName?: string;
}

export const CertificateDocument = ({
  recipientName,
  _certificateTitle,
  description,
  issueDate,
  certificateNumber,
  instructorName = 'Jannik Laursen',
}: CertificateData) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border} />

      <View style={styles.header}>
        <Text style={styles.title}>Certificate of Completion</Text>
        <Text style={styles.subtitle}>NeuroElemental™</Text>
      </View>

      <Text style={styles.recipient}>{recipientName}</Text>

      <Text style={styles.description}>
        {description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>{instructorName}</Text>
          <Text style={styles.signatureText}>Founder & Lead Instructor</Text>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Date: {issueDate}</Text>
        </View>
      </View>

      <Text style={styles.certNumber}>Certificate No: {certificateNumber}</Text>
    </Page>
  </Document>
);

// Helper function to generate certificate number
export function generateCertificateNumber(): string {
  const prefix = 'NE';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

// Helper component for download link
export function CertificateDownloadLink({ certificateData, children }: {
  certificateData: CertificateData;
  children: React.ReactNode;
}) {
  return (
    <PDFDownloadLink
      document={<CertificateDocument {...certificateData} />}
      fileName={`certificate-${certificateData.certificateNumber}.pdf`}
    >
      {({ loading }) =>
        loading ? 'Generating certificate...' : children
      }
    </PDFDownloadLink>
  );
}