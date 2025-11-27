import * as React from 'react';
import { BaseTemplate, Button } from './base-template';
import { formatDate, DATE_FORMATS } from '@/lib/utils';

export interface CourseCompletionProps {
  name: string;
  courseName: string;
  completionDate: Date;
  certificateId?: string;
  grade?: number;
  nextCourses?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export const CourseCompletionEmail: React.FC<CourseCompletionProps> = ({
  name,
  courseName,
  completionDate,
  certificateId,
  grade,
  nextCourses = []
}) => {
  const formattedDate = formatDate(completionDate, DATE_FORMATS.LONG);

  const getGradeText = () => {
    if (!grade) return null;
    if (grade >= 90) return 'Outstanding Achievement';
    if (grade >= 80) return 'Excellent Performance';
    if (grade >= 70) return 'Good Work';
    return 'Course Completed';
  };

  return (
    <BaseTemplate preheader={`Congratulations on completing ${courseName}!`}>
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '80px',
          height: '80px',
          backgroundColor: '#fbbf24',
          borderRadius: '50%',
          lineHeight: '80px',
          marginBottom: '16px'
        }}>
          <span style={{
            color: '#ffffff',
            fontSize: '40px'
          }}>🏆</span>
        </div>
        <h2 style={{
          margin: '0',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#111827'
        }}>
          Congratulations, {name}!
        </h2>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '18px',
          color: '#7c3aed',
          fontWeight: '600'
        }}>
          You've completed {courseName}
        </p>
      </div>

      <div style={{
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f667ea 100%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f667ea 100%)',
        borderRadius: '8px',
        padding: '24px',
        margin: '24px 0',
        textAlign: 'center',
        color: '#ffffff'
      }}>
        {grade && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{
              margin: '0',
              fontSize: '14px',
              opacity: 0.9
            }}>
              Final Score
            </p>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '36px',
              fontWeight: 'bold'
            }}>
              {grade}%
            </p>
            {getGradeText() && (
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '16px',
                fontStyle: 'italic'
              }}>
                {getGradeText()}
              </p>
            )}
          </div>
        )}
        <p style={{
          margin: '0',
          fontSize: '14px',
          opacity: 0.9
        }}>
          Completed on {formattedDate}
        </p>
      </div>

      {certificateId && (
        <>
          <p style={{
            margin: '24px 0',
            fontSize: '16px',
            lineHeight: '24px',
            color: '#4b5563',
            textAlign: 'center'
          }}>
            Your certificate of completion is ready! This certificate verifies your achievement
            and can be shared with employers or on professional networks.
          </p>

          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/certificates/${certificateId}`}>
            View Certificate
          </Button>

          <div style={{
            textAlign: 'center',
            margin: '16px 0'
          }}>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/certificates/${certificateId}/download`}
               style={{
                 color: '#7c3aed',
                 fontSize: '14px',
                 textDecoration: 'underline',
                 marginRight: '24px'
               }}>
              Download PDF
            </a>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/certificates/${certificateId}/share`}
               style={{
                 color: '#7c3aed',
                 fontSize: '14px',
                 textDecoration: 'underline'
               }}>
              Share on LinkedIn
            </a>
          </div>
        </>
      )}

      {nextCourses.length > 0 && (
        <div style={{
          marginTop: '40px',
          paddingTop: '32px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            textAlign: 'center'
          }}>
            Continue Your Learning Journey
          </h3>

          {nextCourses.map((course, _index) => (
            <div key={course.id} style={{
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              padding: '16px',
              margin: '12px 0'
            }}>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827'
              }}>
                {course.title}
              </h4>
              <p style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '20px'
              }}>
                {course.description}
              </p>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}`}
                 style={{
                   color: '#7c3aed',
                   fontSize: '14px',
                   fontWeight: '600',
                   textDecoration: 'none'
                 }}>
                Learn More →
              </a>
            </div>
          ))}
        </div>
      )}

      <div style={{
        backgroundColor: '#eff6ff',
        borderRadius: '6px',
        padding: '20px',
        margin: '32px 0',
        textAlign: 'center'
      }}>
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Share Your Achievement
        </p>
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Let your network know about your accomplishment!
        </p>
        <div>
          <a href={`https://twitter.com/intent/tweet?text=I just completed ${courseName} on @NeuroElemental! 🎉`}
             style={{
               display: 'inline-block',
               margin: '0 8px',
               padding: '8px 16px',
               backgroundColor: '#1da1f2',
               color: '#ffffff',
               textDecoration: 'none',
               borderRadius: '4px',
               fontSize: '14px'
             }}>
            Twitter
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${process.env.NEXT_PUBLIC_APP_URL}/certificates/${certificateId}`}
             style={{
               display: 'inline-block',
               margin: '0 8px',
               padding: '8px 16px',
               backgroundColor: '#0077b5',
               color: '#ffffff',
               textDecoration: 'none',
               borderRadius: '4px',
               fontSize: '14px'
             }}>
            LinkedIn
          </a>
        </div>
      </div>

      <p style={{
        margin: '24px 0 0 0',
        fontSize: '14px',
        lineHeight: '20px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Thank you for learning with NeuroElemental. We're proud of your achievement!
      </p>
    </BaseTemplate>
  );
};