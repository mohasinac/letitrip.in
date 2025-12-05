/**
 * @fileoverview React Component
 * @module src/emails/Newsletter
 * @description This file contains the Newsletter component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Newsletter Email Template
 *
 * @status IMPLEMENTED
 * @task 1.5.2
 */

import * as React from "react";

/**
 * NewsletterEmailProps interface
 * 
 * @interface
 * @description Defines the structure and contract for NewsletterEmailProps
 */
export interface NewsletterEmailProps {
  /** Recipient Name */
  recipientName?: string;
  /** Recipient Email */
  recipientEmail: string;
  /** Subject */
  subject: string;
  /** Content */
  content: string;
  /** Unsubscribe Link */
  unsubscribeLink: string;
  /** Preview Text */
  previewText?: string;
}

/**
 * Performs newsletter email operation
 *
 * @returns {any} The newsletteremail result
 *
 * @example
 * NewsletterEmail();
 */

/**
 * N
 * @constant
 */
/**
 * Performs newsletter email operation
 *
 * @returns {any} The newsletteremail result
 *
 * @example
 * NewsletterEmail();
 */

/**
 * N
 * @constant
 */
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
              /** Display */
              display: none;
              max-height: 0;
              /** Overflow */
              overflow: hidden;
            }
          `}</style>
        )}
      </head>
      <body
        style={{
          /** Font Family */
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          /** Background Color */
          backgroundColor: "#f3f4f6",
          /** Margin */
          margin: 0,
          /** Padding */
          padding: 0,
        }}
      >
        {/* Preview Text */}
        {previewText && <div className="preview-text">{previewText}</div>}

        <div
          style={{
            /** Max Width */
            maxWidth: "600px",
            /** Margin */
            margin: "0 auto",
            /** Padding */
            padding: "20px",
          }}
        >
          {/* Header */}
          <div
            style={{
              /** Background Color */
              backgroundColor: "#ffffff",
              /** Border Radius */
              borderRadius: "8px 8px 0 0",
              /** Padding */
              padding: "24px",
              /** Text Align */
              textAlign: "center",
              /** Border Bottom */
              borderBottom: "4px solid #3b82f6",
            }}
          >
            <h1
              style={{
                /** Font Size */
                fontSize: "24px",
                /** Font Weight */
                fontWeight: "bold",
                /** Color */
                color: "#1f2937",
                /** Margin */
                margin: 0,
              }}
            >
              JustForView.in
            </h1>
            <p
              style={{
                /** Font Size */
                fontSize: "14px",
                /** Color */
                color: "#6b7280",
                /** Margin */
                margin: "8px 0 0 0",
              }}
            >
              Newsletter
            </p>
          </div>

          {/* Main Content */}
          <div
            style={{
              /** Background Color */
              backgroundColor: "#ffffff",
              /** Padding */
              padding: "32px 24px",
            }}
          >
            {/* Subject */}
            <h2
              style={{
                /** Font Size */
                fontSize: "22px",
                /** Font Weight */
                fontWeight: "bold",
                /** Color */
                color: "#1f2937",
                /** Margin Top */
                marginTop: 0,
                /** Margin Bottom */
                marginBottom: "24px",
                /** Line Height */
                lineHeight: "1.3",
              }}
            >
              {subject}
            </h2>

            {/* Greeting */}
            {recipientName && (
              <p
                style={{
                  /** Font Size */
                  fontSize: "16px",
                  /** Color */
                  color: "#1f2937",
                  /** Margin Top */
                  marginTop: 0,
                  /** Margin Bottom */
                  marginBottom: "16px",
                }}
              >
                Hi {recipientName},
              </p>
            )}

            {/* Content - HTML allowed */}
            <div
              style={{
                /** Font Size */
                fontSize: "14px",
                /** Color */
                color: "#374151",
                /** Line Height */
                lineHeight: "1.6",
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* CTA */}
            <div
              style={{
                /** Text Align */
                textAlign: "center",
                /** Margin Top */
                marginTop: "32px",
                /** Margin Bottom */
                marginBottom: "24px",
              }}
            >
              <a
                href="https://justforview.in"
                style={{
                  /** Display */
                  display: "inline-block",
                  /** Background Color */
                  backgroundColor: "#3b82f6",
                  /** Color */
                  color: "#ffffff",
                  /** Font Size */
                  fontSize: "16px",
                  /** Font Weight */
                  fontWeight: "600",
                  /** Padding */
                  padding: "12px 32px",
                  /** Border Radius */
                  borderRadius: "6px",
                  /** Text Decoration */
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
              /** Background Color */
              backgroundColor: "#f9fafb",
              /** Padding */
              padding: "24px",
              /** Text Align */
              textAlign: "center",
              /** Border Top */
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                /** Font Size */
                fontSize: "14px",
                /** Color */
                color: "#6b7280",
                /** Margin Top */
                marginTop: 0,
                /** Margin Bottom */
                marginBottom: "16px",
              }}
            >
              Follow us on social media
            </p>
            <div
              style={{
                /** Display */
                display: "flex",
                /** Justify Content */
                justifyContent: "center",
                /** Gap */
                gap: "16px",
              }}
            >
              <a
                href="https://facebook.com/justforview"
                style={{
                  /** Display */
                  display: "inline-block",
                  /** Width */
                  width: "36px",
                  /** Height */
                  height: "36px",
                  /** Background Color */
                  backgroundColor: "#3b82f6",
                  /** Border Radius */
                  borderRadius: "50%",
                  /** Text Align */
                  textAlign: "center",
                  /** Line Height */
                  lineHeight: "36px",
                  /** Color */
                  color: "#ffffff",
                  /** Text Decoration */
                  textDecoration: "none",
                  /** Font Size */
                  fontSize: "18px",
                }}
              >
                f
              </a>
              <a
                href="https://twitter.com/justforview"
                style={{
                  /** Display */
                  display: "inline-block",
                  /** Width */
                  width: "36px",
                  /** Height */
                  height: "36px",
                  /** Background Color */
                  backgroundColor: "#3b82f6",
                  /** Border Radius */
                  borderRadius: "50%",
                  /** Text Align */
                  textAlign: "center",
                  /** Line Height */
                  lineHeight: "36px",
                  /** Color */
                  color: "#ffffff",
                  /** Text Decoration */
                  textDecoration: "none",
                  /** Font Size */
                  fontSize: "18px",
                }}
              >
                𝕏
              </a>
              <a
                href="https://instagram.com/justforview"
                style={{
                  /** Display */
                  display: "inline-block",
                  /** Width */
                  width: "36px",
                  /** Height */
                  height: "36px",
                  /** Background Color */
                  backgroundColor: "#3b82f6",
                  /** Border Radius */
                  borderRadius: "50%",
                  /** Text Align */
                  textAlign: "center",
                  /** Line Height */
                  lineHeight: "36px",
                  /** Color */
                  color: "#ffffff",
                  /** Text Decoration */
                  textDecoration: "none",
                  /** Font Size */
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
              /** Background Color */
              backgroundColor: "#f9fafb",
              /** Border Radius */
              borderRadius: "0 0 8px 8px",
              /** Padding */
              padding: "24px",
              /** Text Align */
              textAlign: "center",
              /** Border Top */
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p
              style={{
                /** Font Size */
                fontSize: "12px",
                /** Color */
                color: "#6b7280",
                /** Margin */
                margin: 0,
                /** Margin Bottom */
                marginBottom: "12px",
              }}
            >
              © 2025 JustForView.in. All rights reserved.
            </p>
            <p
              style={{
                /** Font Size */
                fontSize: "12px",
                /** Color */
                color: "#9ca3af",
                /** Margin */
                margin: 0,
                /** Margin Bottom */
                marginBottom: "12px",
              }}
            >
              This email was sent to {recipientEmail}
            </p>
            <a
              href={unsubscribeLink}
              style={{
                /** Font Size */
                fontSize: "12px",
                /** Color */
                color: "#3b82f6",
                /** Text Decoration */
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
