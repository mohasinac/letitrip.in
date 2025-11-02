/**
 * Contact Validator
 * Zod schemas for contact form validation
 */

import { z } from 'zod';

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Invalid email address'),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .optional(),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  category: z.enum(['general', 'support', 'sales', 'partnership', 'feedback'])
    .optional()
    .default('general'),
});

/**
 * Contact preferences schema
 */
export const contactPreferencesSchema = z.object({
  allowMarketing: z.boolean().default(false),
  preferredContact: z.enum(['email', 'phone']).default('email'),
});

// Type exports
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContactPreferencesInput = z.infer<typeof contactPreferencesSchema>;
