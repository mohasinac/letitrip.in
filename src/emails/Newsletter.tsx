/**
 * Newsletter Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

export interface NewsletterEmailProps {
  recipientName?: string;
  recipientEmail: string;
  subject: string;
  content: string;
  unsubscribeLink: string;
  previewText?: string;
}

export const NewsletterEmail: React.FC<NewsletterEmailProps> = ({
  recipientName,
  recipientEmail,
  subject,
  content,
  unsubscribeLink,
  previewText,
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{subject}</title>
        {previewText && (
          <style>{`
            .preview-text {
              display: none;
              max-height: 0;
              overflow: hidden;
            }
          `}</style>
        )}
      </head>
      <body
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#f3f4f6",
          margin: 0,
          padding: 0,
        }}
      >
        {/* Preview Text */}
        {previewText && <div className="preview-text">{previewText}</div>}

        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "20px",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px 8px 0 0",
              padding: "24px",
              textAlign: "center",
              borderBottom: "4px solid #3b82f6",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
              }}
            >
              JustForView.in
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "8px 0 0 0",
              }}
            >
              Newsletter
            </p>
          </div>

          {/* Main Content */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "32px 24px",
            }}
          >
            {/* Subject */}
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#1f2937",
                marginTop: 0,
                marginBottom: "24px",
                lineHeight: "1.3",
              }}
            >
              {subject}
            </h2>

            {/* Greeting */}
            {recipientName && (
              <p
                style={{
                  fontSize: "16px",
                  color: "#1f2937",
                  marginTop: 0,
                  marginBottom: "16px",
                }}
              >
                Hi {recipientName},
              </p>
            )}

            {/* Content - HTML allowed */}
            <div
              style={{
                fontSize: "14px",
                color: "#374151",
                lineHeight: "1.6",
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* CTA */}
            <div
              style={{
                textAlign: "center",
                marginTop: "32px",
                marginBottom: "24px",
              }}
            >
              <a
                href="https://justforview.in"
                style={{
                  display: "inline-block",
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  padding: "12px 32px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Visit Our Website
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "24px",
              textAlign: "center",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginTop: 0,
                marginBottom: "16px",
              }}
            >
              Follow us on social media
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <a
                href="https://facebook.com/justforview"
                style={{
                  display: "inline-block",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#3b82f6",
                  borderRadius: "50%",
                  textAlign: "center",
                  lineHeight: "36px",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "18px",
                }}
              >
                f
              </a>
              <a
                href="https://twitter.com/justforview"
                style={{
                  display: "inline-block",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#3b82f6",
                  borderRadius: "50%",
                  textAlign: "center",
                  lineHeight: "36px",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "18px",
                }}
              >
                𝕏
              </a>
              <a
                href="https://instagram.com/justforview"
                style={{
                  display: "inline-block",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#3b82f6",
                  borderRadius: "50%",
                  textAlign: "center",
                  lineHeight: "36px",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "18px",
                }}
              >
                📷
              </a>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "0 0 8px 8px",
              padding: "24px",
              textAlign: "center",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                margin: 0,
                marginBottom: "12px",
              }}
            >
              © 2025 JustForView.in. All rights reserved.
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                margin: 0,
                marginBottom: "12px",
              }}
            >
              This email was sent to {recipientEmail}
            </p>
            <a
              href={unsubscribeLink}
              style={{
                fontSize: "12px",
                color: "#3b82f6",
                textDecoration: "underline",
              }}
            >
              Unsubscribe from marketing emails
            </a>
          </div>
        </div>
      </body>
    </html>
  );
};

export default NewsletterEmail;
