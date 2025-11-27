import * as React from 'react';
import { BaseTemplate, Button } from './base-template';

export interface PasswordResetProps {
  name?: string;
  resetToken: string;
  expiresIn?: number; // in hours
}

export const PasswordResetEmail: React.FC<PasswordResetProps> = ({
  name,
  resetToken,
  expiresIn = 1
}) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

  return (
    <BaseTemplate preheader="Reset your NeuroElemental password">
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '64px',
          height: '64px',
          backgroundColor: '#f59e0b',
          borderRadius: '50%',
          lineHeight: '64px',
          marginBottom: '16px'
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '28px'
          }}>🔐</span>
        </div>
        <h2 style={{
          margin: '0',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827'
        }}>
          Password Reset Request
        </h2>
      </div>

      <p style={{
        margin: '0 0 24px 0',
        fontSize: '16px',
        lineHeight: '24px',
        color: '#4b5563'
      }}>
        {name ? `Hi ${name},` : 'Hello,'}
        <br />
        We received a request to reset your password for your NeuroElemental account.
        If you didn't make this request, you can safely ignore this email.
      </p>

      <div style={{
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        padding: '16px',
        margin: '24px 0'
      }}>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#92400e',
          textAlign: 'center'
        }}>
          <strong>⚠️ This link expires in {expiresIn} hour{expiresIn !== 1 ? 's' : ''}</strong>
        </p>
      </div>

      <Button href={resetUrl} variant="primary">
        Reset Password
      </Button>

      <div style={{
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Security Tips
        </h4>
        <ul style={{
          margin: '0',
          paddingLeft: '20px',
          color: '#4b5563',
          fontSize: '14px',
          lineHeight: '20px'
        }}>
          <li style={{ marginBottom: '8px' }}>
            Never share your password with anyone
          </li>
          <li style={{ marginBottom: '8px' }}>
            Use a strong password with letters, numbers, and symbols
          </li>
          <li style={{ marginBottom: '8px' }}>
            Consider using a password manager
          </li>
          <li style={{ marginBottom: '8px' }}>
            Enable two-factor authentication when available
          </li>
        </ul>
      </div>

      <div style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        padding: '16px',
        margin: '24px 0'
      }}>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <strong>Can't click the button?</strong> Copy and paste this link into your browser:
        </p>
        <p style={{
          margin: '0',
          fontSize: '12px',
          color: '#7c3aed',
          wordBreak: 'break-all'
        }}>
          {resetUrl}
        </p>
      </div>

      <p style={{
        margin: '24px 0 0 0',
        fontSize: '14px',
        lineHeight: '20px',
        color: '#6b7280'
      }}>
        If you didn't request this password reset, please contact our security team immediately at{' '}
        <a href="mailto:security@neuroelemental.com" style={{ color: '#7c3aed' }}>
          security@neuroelemental.com
        </a>
      </p>
    </BaseTemplate>
  );
};