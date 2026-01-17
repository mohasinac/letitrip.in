/**
 * Test Form Sanitization
 *
 * This demonstrates the auto-sanitization feature in form components.
 * Run in a Next.js page to see it work.
 */

"use client";

import { FormField } from "@letitrip/react-library";
import { FormInput } from "@letitrip/react-library";
import { FormTextarea } from "@letitrip/react-library";
import { useState } from "react";

export default function FormSanitizationTest() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [comment, setComment] = useState("");

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Form Sanitization Test</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Try entering malicious content like{" "}
        <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code> and tab out of
        the field. The input will be automatically sanitized on blur.
      </p>

      {/* Test 1: String sanitization */}
      <FormInput
        label="Name (String Sanitization)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sanitize
        sanitizeType="string"
        onSanitize={(sanitized) => {
          setName(sanitized);
          console.log("Name sanitized:", sanitized);
        }}
        helperText="Try entering: <script>alert('XSS')</script>John Doe"
        placeholder="Enter your name"
      />

      {/* Test 2: Email sanitization */}
      <FormInput
        label="Email (Email Sanitization)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sanitize
        sanitizeType="email"
        onSanitize={(sanitized) => {
          setEmail(sanitized);
          console.log("Email sanitized:", sanitized);
        }}
        helperText="Try entering:   TEST@EXAMPLE.COM  <script>"
        placeholder="Enter your email"
      />

      {/* Test 3: Phone sanitization */}
      <FormInput
        label="Phone (Phone Sanitization)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        sanitize
        sanitizeType="phone"
        onSanitize={(sanitized) => {
          setPhone(sanitized);
          console.log("Phone sanitized:", sanitized);
        }}
        helperText="Try entering: +1 (555) 123-4567 <script>"
        placeholder="Enter your phone"
      />

      {/* Test 4: URL sanitization */}
      <FormInput
        label="Website (URL Sanitization)"
        type="url"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        sanitize
        sanitizeType="url"
        onSanitize={(sanitized) => {
          setWebsite(sanitized);
          console.log("Website sanitized:", sanitized);
        }}
        helperText="Try entering: javascript:alert('XSS') (should be blocked)"
        placeholder="Enter website URL"
      />

      {/* Test 5: Textarea with string sanitization */}
      <FormTextarea
        label="Comment (String Sanitization)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sanitize
        sanitizeType="string"
        onSanitize={(sanitized) => {
          setComment(sanitized);
          console.log("Comment sanitized:", sanitized);
        }}
        helperText="Try entering HTML/scripts - they'll be stripped on blur"
        placeholder="Enter your comment"
        rows={3}
      />

      {/* Test 6: Textarea with HTML sanitization */}
      <FormTextarea
        label="Bio (HTML Sanitization - Basic Formatting)"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        sanitize
        sanitizeType="html"
        sanitizeHtmlOptions={{ allowBasicFormatting: true }}
        onSanitize={(sanitized) => {
          setBio(sanitized);
          console.log("Bio sanitized:", sanitized);
        }}
        helperText="Try: <p>Hello <strong>World</strong> <script>alert('XSS')</script></p>"
        placeholder="Enter your bio with HTML"
        rows={4}
      />

      {/* Test 7: FormField with sanitization */}
      <FormField
        label="Username (via FormField)"
        sanitize
        sanitizeType="string"
        helperText="Sanitization works through FormField wrapper too"
      >
        <FormInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          onSanitize={(sanitized) => {
            setName(sanitized);
            console.log("Username sanitized via FormField:", sanitized);
          }}
          placeholder="Enter username"
        />
      </FormField>

      {/* Display current values */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Values:</h2>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(
            {
              name,
              email,
              phone,
              website,
              comment,
              bio,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>
            Type malicious content like{" "}
            <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
          </li>
          <li>Press Tab or click outside the field (triggers blur event)</li>
          <li>Watch the value get sanitized automatically</li>
          <li>Check the console for sanitization logs</li>
          <li>Notice the JSON output below updates with clean values</li>
        </ol>
      </div>
    </div>
  );
}
