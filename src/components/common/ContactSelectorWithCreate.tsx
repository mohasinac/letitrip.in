/**
 * @fileoverview React Component - Contact Selector with Inline Creation
 * @module src/components/common/ContactSelectorWithCreate
 * @description Contact selector using SelectorWithCreate pattern
 * 
 * @pattern SelectorWithCreate - Generic dropdown with inline creation capability
 * @created 2025-12-05
 * @refactored 2026-01-08 - Migrated to SelectorWithCreate pattern
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { Phone } from "lucide-react";
import { z } from "zod";
import { SelectorWithCreate } from "@/components/patterns/SelectorWithCreate";
import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { MobileInput } from "@/components/common/MobileInput";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  isValidPhone,
} from "@/constants/validation-messages";
import { Controller, UseFormReturn } from "react-hook-form";

/**
 * Contact entity interface
 */
export interface Contact {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  email?: string;
  relationship?: string;
  isPrimary: boolean;
  createdAt: Date;
}

/**
 * Contact form validation schema
 */
export const ContactSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT),
  phone: z
    .string()
    .length(10, "Phone must be 10 digits")
    .refine((val) => isValidPhone(`+91${val}`), "Invalid phone number"),
  countryCode: z.string(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  relationship: z.string().optional(),
  isPrimary: z.boolean(),
});

export type ContactFormData = z.infer<typeof ContactSchema>;

/**
 * Props for ContactSelectorWithCreate component
 */
export interface ContactSelectorWithCreateProps {
  value?: string | null;
  onChange: (contactId: string, contact: Contact) => void;
  required?: boolean;
  error?: string;
  label?: string;
  autoSelectPrimary?: boolean;
  className?: string;
}

/**
 * Contact form fields component for inline creation
 */
const ContactFormFields = ({ form }: { form: UseFormReturn<ContactFormData> }) => {
  const { register, control, watch, setValue, formState: { errors } } = form;

  return (
    <>
      <FormField label="Name" required error={errors.name?.message}>
        <FormInput {...register("name")} placeholder="Full Name" />
      </FormField>

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <MobileInput
            value={field.value || ""}
            onChange={field.onChange}
            countryCode={watch("countryCode")}
            onCountryCodeChange={(code) => setValue("countryCode", code)}
            required
            error={errors.phone?.message}
            label="Phone Number"
          />
        )}
      />

      <FormField label="Email (Optional)" error={errors.email?.message}>
        <FormInput
          {...register("email")}
          type="email"
          placeholder="email@example.com"
        />
      </FormField>

      <FormField label="Relationship (Optional)">
        <FormInput
          {...register("relationship")}
          placeholder="e.g., Spouse, Parent"
        />
      </FormField>

      <div className="flex items-center gap-3 py-2">
        <input
          {...register("isPrimary")}
          type="checkbox"
          id="isPrimary"
          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label
          htmlFor="isPrimary"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Set as primary contact
        </label>
      </div>
    </>
  );
};

/**
 * Renders contact item display
 */
const renderContactItem = (contact: Contact) => (
  <div className="flex items-start gap-3 w-full">
    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-gray-900 dark:text-white">
          {contact.name}
        </span>
        {contact.isPrimary && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Primary
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {contact.countryCode} {contact.phone}
      </p>
      {contact.email && (
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {contact.email}
        </p>
      )}
    </div>
  </div>
);

/**
 * ContactSelectorWithCreate - Contact selector with inline creation
 * Refactored to use SelectorWithCreate pattern
 */
export function ContactSelectorWithCreate({
  value,
  onChange,
  required = false,
  error,
  label = "Select Contact",
  autoSelectPrimary = true,
  className = "",
}: ContactSelectorWithCreateProps) {
  return (
    <SelectorWithCreate<Contact, ContactFormData>
      value={value}
      onChange={(id, contact) => onChange(id, contact)}
      required={required}
      error={error}
      label={label}
      className={className}
      icon={Phone}
      emptyStateConfig={{
        icon: Phone,
        message: "No saved contacts",
        buttonText: "Add Contact",
      }}
      fetchItems={async () => {
        // TODO: Implement actual API call
        // return await contactsService.list();
        return [];
      }}
      createItem={async (data) => {
        // TODO: Implement actual API call
        // return await contactsService.create(data);
        const newContact: Contact = {
          id: `contact_${Date.now()}`,
          name: data.name,
          phone: data.phone,
          countryCode: data.countryCode,
          email: data.email,
          relationship: data.relationship,
          isPrimary: data.isPrimary,
          createdAt: new Date(),
        };
        return newContact;
      }}
      formSchema={ContactSchema}
      formDefaultValues={{
        countryCode: "+91",
        isPrimary: false,
      }}
      renderFormFields={(form) => <ContactFormFields form={form} />}
      renderItem={renderContactItem}
      getItemLabel={(contact) => contact.name}
      modalTitle="Add Contact"
      autoSelectPrimary={autoSelectPrimary}
    />
  );
}

export default ContactSelectorWithCreate;
