import * as React from 'react';
import { BaseTemplate, Button } from './base-template';

export interface WelcomeEmailProps {
  name: string;
  email: string;
  role?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  name,
  email,
  role = 'student'
}) => {
  const roleContent = {
    student: {
      title: 'Start Your Learning Journey',
      items: [
        'Take the assessment to discover your energy profile',
        'Browse our course catalog',
        'Join live sessions with instructors',
        'Connect with fellow learners'
      ],
      buttonText: 'Take Assessment',
      buttonUrl: '/assessment'
    },
    instructor: {
      title: 'Welcome to Our Instructor Community',
      items: [
        'Complete your instructor profile',
        'Create your first course',
        'Set your availability for 1-on-1 sessions',
        'Review our instructor guidelines'
      ],
      buttonText: 'Complete Profile',
      buttonUrl: '/dashboard/instructor/profile'
    },
    business: {
      title: 'Transform Your Organization',
      items: [
        'Set up your company profile',
        'Invite team members',
        'Browse enterprise courses',
        'Schedule a consultation'
      ],
      buttonText: 'Set Up Organization',
      buttonUrl: '/dashboard/business/setup'
    }
  };

  const content = roleContent[role as keyof typeof roleContent] || roleContent.student;

  return (
    <BaseTemplate preheader={`Welcome to NeuroElemental, ${name}!`}>
      <h2 style={{
        margin: '0 0 16px 0',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#111827'
      }}>
        Welcome to NeuroElemental, {name}!
      </h2>

      <p style={{
        margin: '0 0 24px 0',
        fontSize: '16px',
        lineHeight: '24px',
        color: '#4b5563'
      }}>
        We're thrilled to have you join our community of diverse thinkers and learners.
        Your journey to understanding your unique energy profile starts here!
      </p>

      <div style={{
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        padding: '20px',
        margin: '24px 0'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827'
        }}>
          {content.title}
        </h3>
        <ul style={{
          margin: '0',
          paddingLeft: '20px',
          color: '#4b5563',
          lineHeight: '24px'
        }}>
          {content.items.map((item, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Button href={`${process.env.NEXT_PUBLIC_APP_URL}${content.buttonUrl}`}>
        {content.buttonText}
      </Button>

      <div style={{
        borderTop: '1px solid #e5e7eb',
        marginTop: '32px',
        paddingTop: '24px'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Your Account Details
        </h4>
        <p style={{
          margin: '0',
          fontSize: '14px',
          lineHeight: '20px',
          color: '#6b7280'
        }}>
          Email: {email}<br />
          Account Type: {role.charAt(0).toUpperCase() + role.slice(1)}
        </p>
      </div>

      <p style={{
        margin: '24px 0 0 0',
        fontSize: '14px',
        lineHeight: '20px',
        color: '#6b7280'
      }}>
        If you have any questions, our support team is here to help at{' '}
        <a href="mailto:support@neuroelemental.com" style={{ color: '#7c3aed' }}>
          support@neuroelemental.com
        </a>
      </p>
    </BaseTemplate>
  );
};