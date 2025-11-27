import * as React from 'react';
import { BaseTemplate, Button } from './base-template';
import { formatDate, DATE_FORMATS } from '@/lib/utils';

export interface PaymentConfirmationProps {
  name: string;
  amount: number;
  currency?: string;
  itemType: 'course' | 'session' | 'subscription' | 'resource';
  itemName: string;
  paymentId: string;
  invoiceNumber?: string;
  nextBillingDate?: Date;
}

export const PaymentConfirmationEmail: React.FC<PaymentConfirmationProps> = ({
  name,
  amount,
  currency = 'USD',
  itemType,
  itemName,
  paymentId,
  invoiceNumber,
  nextBillingDate
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const getItemTypeText = () => {
    switch (itemType) {
      case 'course':
        return 'Course Enrollment';
      case 'session':
        return '1-on-1 Session';
      case 'subscription':
        return 'Subscription';
      case 'resource':
        return 'Resource Purchase';
      default:
        return 'Purchase';
    }
  };

  return (
    <BaseTemplate preheader={`Payment confirmation for ${itemName}`}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '64px',
          height: '64px',
          backgroundColor: '#10b981',
          borderRadius: '50%',
          lineHeight: '64px',
          marginBottom: '16px'
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>✓</span>
        </div>
        <h2 style={{
          margin: '0',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827'
        }}>
          Payment Successful!
        </h2>
      </div>

      <p style={{
        margin: '0 0 24px 0',
        fontSize: '16px',
        lineHeight: '24px',
        color: '#4b5563'
      }}>
        Hi {name},<br />
        Thank you for your payment. Your transaction has been processed successfully.
      </p>

      <div style={{
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        padding: '20px',
        margin: '24px 0'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Transaction Details
        </h3>

        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Type:
              </td>
              <td style={{
                padding: '8px 0',
                color: '#111827',
                fontSize: '14px',
                textAlign: 'right',
                fontWeight: '600'
              }}>
                {getItemTypeText()}
              </td>
            </tr>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Item:
              </td>
              <td style={{
                padding: '8px 0',
                color: '#111827',
                fontSize: '14px',
                textAlign: 'right',
                fontWeight: '600'
              }}>
                {itemName}
              </td>
            </tr>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px',
                borderTop: '1px solid #e5e7eb'
              }}>
                Total Amount:
              </td>
              <td style={{
                padding: '8px 0',
                color: '#111827',
                fontSize: '18px',
                textAlign: 'right',
                fontWeight: 'bold',
                borderTop: '1px solid #e5e7eb'
              }}>
                {formatCurrency(amount)}
              </td>
            </tr>
          </tbody>
        </table>

        {invoiceNumber && (
          <p style={{
            margin: '16px 0 0 0',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Invoice Number: {invoiceNumber}<br />
            Payment ID: {paymentId}
          </p>
        )}
      </div>

      {itemType === 'subscription' && nextBillingDate && (
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          padding: '16px',
          margin: '24px 0'
        }}>
          <p style={{
            margin: '0',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <strong>Next Billing Date:</strong>{' '}
            {formatDate(nextBillingDate, DATE_FORMATS.LONG)}
          </p>
        </div>
      )}

      <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments`}>
        View Payment History
      </Button>

      {invoiceNumber && (
        <div style={{
          textAlign: 'center',
          margin: '16px 0'
        }}>
          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/api/payments/invoices/${paymentId}`}
             style={{
               color: '#7c3aed',
               fontSize: '14px',
               textDecoration: 'underline'
             }}>
            Download Invoice (PDF)
          </a>
        </div>
      )}

      <p style={{
        margin: '24px 0 0 0',
        fontSize: '14px',
        lineHeight: '20px',
        color: '#6b7280'
      }}>
        If you have any questions about this payment, please contact our support team at{' '}
        <a href="mailto:billing@neuroelemental.com" style={{ color: '#7c3aed' }}>
          billing@neuroelemental.com
        </a>
      </p>
    </BaseTemplate>
  );
};