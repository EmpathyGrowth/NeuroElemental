import * as React from 'react';

export interface BaseTemplateProps {
  children: React.ReactNode;
  preheader?: string;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  children,
  preheader = ''
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NeuroElemental</title>
        {preheader && (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
            {preheader}
          </div>
        )}
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f3f4f6',
        color: '#111827'
      }}>
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: '#f3f4f6', padding: '20px 0' }}
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <tr>
                  <td style={{
                    padding: '24px',
                    backgroundColor: '#7c3aed',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f667ea 100%)',
                    textAlign: 'center'
                  }}>
                    <h1 style={{
                      margin: 0,
                      color: '#ffffff',
                      fontSize: '28px',
                      fontWeight: 'bold',
                      letterSpacing: '-0.5px'
                    }}>
                      NeuroElemental
                    </h1>
                    <p style={{
                      margin: '8px 0 0 0',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '14px'
                    }}>
                      Discover Your Energy Profile
                    </p>
                  </td>
                </tr>

                {/* Content */}
                <tr>
                  <td style={{ padding: '32px 24px' }}>
                    {children}
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{
                    padding: '24px',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center" style={{ paddingBottom: '16px' }}>
                          <a href={process.env.NEXT_PUBLIC_APP_URL} style={{
                            color: '#7c3aed',
                            textDecoration: 'none',
                            fontSize: '14px',
                            margin: '0 12px'
                          }}>
                            Website
                          </a>
                          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={{
                            color: '#7c3aed',
                            textDecoration: 'none',
                            fontSize: '14px',
                            margin: '0 12px'
                          }}>
                            Dashboard
                          </a>
                          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/support`} style={{
                            color: '#7c3aed',
                            textDecoration: 'none',
                            fontSize: '14px',
                            margin: '0 12px'
                          }}>
                            Support
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style={{
                          color: '#6b7280',
                          fontSize: '12px',
                          lineHeight: '20px'
                        }}>
                          © {new Date().getFullYear()} NeuroElemental. All rights reserved.<br />
                          You received this email because you're registered with NeuroElemental.<br />
                          <a href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`} style={{
                            color: '#6b7280',
                            textDecoration: 'underline'
                          }}>
                            Unsubscribe
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};

export const Button: React.FC<{
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}> = ({ href, children, variant = 'primary' }) => {
  const styles = {
    primary: {
      backgroundColor: '#7c3aed',
      color: '#ffffff'
    },
    secondary: {
      backgroundColor: '#ffffff',
      color: '#7c3aed',
      border: '2px solid #7c3aed'
    }
  };

  return (
    <table cellPadding="0" cellSpacing="0" style={{ margin: '24px 0' }}>
      <tr>
        <td align="center">
          <a
            href={href}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              textDecoration: 'none',
              borderRadius: '6px',
              ...styles[variant]
            }}
          >
            {children}
          </a>
        </td>
      </tr>
    </table>
  );
};