import * as React from 'react';
import { BaseTemplate, Button } from './base-template';
import { formatDate, formatTime, DATE_FORMATS } from '@/lib/utils';

export interface SessionReminderProps {
  studentName: string;
  instructorName: string;
  sessionType: string;
  scheduledAt: Date;
  duration: number;
  meetingLink?: string;
  sessionId: string;
  isInstructor?: boolean;
}

export const SessionReminderEmail: React.FC<SessionReminderProps> = ({
  studentName,
  instructorName,
  sessionType,
  scheduledAt,
  duration,
  meetingLink,
  sessionId,
  isInstructor = false
}) => {
  const formattedDate = formatDate(scheduledAt, DATE_FORMATS.LONG);

  const formattedTime = formatTime(scheduledAt);

  const recipientName = isInstructor ? instructorName : studentName;
  const otherPartyName = isInstructor ? studentName : instructorName;
  const _otherPartyRole = isInstructor ? 'student' : 'instructor';

  return (
    <BaseTemplate preheader={`Reminder: Your session is tomorrow at ${formattedTime}`}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '64px',
          height: '64px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          lineHeight: '64px',
          marginBottom: '16px'
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '28px'
          }}>📅</span>
        </div>
        <h2 style={{
          margin: '0',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827'
        }}>
          Session Reminder
        </h2>
      </div>

      <p style={{
        margin: '0 0 24px 0',
        fontSize: '16px',
        lineHeight: '24px',
        color: '#4b5563'
      }}>
        Hi {recipientName},<br />
        This is a reminder about your upcoming {sessionType} session.
      </p>

      <div style={{
        backgroundColor: '#eff6ff',
        borderLeft: '4px solid #3b82f6',
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
          Session Details
        </h3>

        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px',
                verticalAlign: 'top'
              }}>
                {isInstructor ? 'Student:' : 'Instructor:'}
              </td>
              <td style={{
                padding: '8px 0 8px 16px',
                color: '#111827',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {otherPartyName}
              </td>
            </tr>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px',
                verticalAlign: 'top'
              }}>
                Date:
              </td>
              <td style={{
                padding: '8px 0 8px 16px',
                color: '#111827',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {formattedDate}
              </td>
            </tr>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px',
                verticalAlign: 'top'
              }}>
                Time:
              </td>
              <td style={{
                padding: '8px 0 8px 16px',
                color: '#111827',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {formattedTime}
              </td>
            </tr>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px',
                verticalAlign: 'top'
              }}>
                Duration:
              </td>
              <td style={{
                padding: '8px 0 8px 16px',
                color: '#111827',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {duration} minutes
              </td>
            </tr>
            <tr>
              <td style={{
                padding: '8px 0',
                color: '#6b7280',
                fontSize: '14px',
                verticalAlign: 'top'
              }}>
                Type:
              </td>
              <td style={{
                padding: '8px 0 8px 16px',
                color: '#111827',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {sessionType}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {meetingLink ? (
        <Button href={meetingLink} variant="primary">
          Join Session
        </Button>
      ) : (
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
            <strong>Note:</strong> The meeting link will be available 15 minutes before the session starts.
            Check your dashboard for the link.
          </p>
        </div>
      )}

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
          Preparation Tips
        </h4>
        <ul style={{
          margin: '0',
          paddingLeft: '20px',
          color: '#4b5563',
          fontSize: '14px',
          lineHeight: '20px'
        }}>
          <li style={{ marginBottom: '8px' }}>Test your camera and microphone beforehand</li>
          <li style={{ marginBottom: '8px' }}>Find a quiet space with good lighting</li>
          <li style={{ marginBottom: '8px' }}>Have any questions or materials ready</li>
          <li style={{ marginBottom: '8px' }}>Join the session 5 minutes early</li>
        </ul>
      </div>

      <div style={{
        textAlign: 'center',
        margin: '24px 0'
      }}>
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/sessions/${sessionId}`}
          style={{
            color: '#7c3aed',
            fontSize: '14px',
            textDecoration: 'underline',
            marginRight: '24px'
          }}>
          View Session Details
        </a>
        <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/sessions/${sessionId}/reschedule`}
          style={{
            color: '#ef4444',
            fontSize: '14px',
            textDecoration: 'underline'
          }}>
          Reschedule Session
        </a>
      </div>

      <p style={{
        margin: '24px 0 0 0',
        fontSize: '12px',
        lineHeight: '20px',
        color: '#6b7280',
        fontStyle: 'italic'
      }}>
        Please note: Cancellations must be made at least 24 hours in advance to receive a full refund.
      </p>
    </BaseTemplate>
  );
};