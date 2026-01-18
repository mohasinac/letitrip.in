
/**
 * ContactSelectorWithCreate Component
 *
 * Framework-agnostic contact selector with create new contact functionality.
 * Displays saved contacts with ability to add new ones via injectable form.
 *
 * @example
 * ```tsx
 * <ContactSelectorWithCreate
 *   value={selectedContactId}
 *   onChange={(id, contact) => handleSelect(id, contact)}
 *   contacts={contacts}
 *   FormModal={MyFormModal}
 *   ContactForm={MyContactForm}
 * />
 * ```
 */

import React, { useEffect, useState } from "react";

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

export interface ContactSelectorWithCreateProps {
  /** Currently selected contact ID */
  value?: string | null;
  /** Callback when contact changes */
  onChange: (contactId: string, contact: Contact) => void;
  /** Available contacts */
  contacts: Contact[];
  /** Loading state */
  loading?: boolean;
  /** Required field */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Auto-select primary contact */
  autoSelectPrimary?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom form modal component */
  FormModal?: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    children: React.ReactNode;
  }>;
  /** Custom contact form component */
  ContactForm?: React.ComponentType<{
    onSuccess: (contact: Contact) => void;
  }>;
  /** Custom phone icon */
  PhoneIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom check icon */
  CheckIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom plus icon */
  PlusIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Custom loader icon */
  LoaderIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default Phone Icon
const DefaultPhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// Default Check Icon
const DefaultCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

// Default Plus Icon
const DefaultPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

// Default Loader Icon
const DefaultLoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export function ContactSelectorWithCreate({
  value,
  onChange,
  contacts,
  loading = false,
  required = false,
  error,
  label = "Select Contact",
  autoSelectPrimary = true,
  className = "",
  FormModal,
  ContactForm,
  PhoneIcon = DefaultPhoneIcon,
  CheckIcon = DefaultCheckIcon,
  PlusIcon = DefaultPlusIcon,
  LoaderIcon = DefaultLoaderIcon,
}: ContactSelectorWithCreateProps) {
  const [selectedId, setSelectedId] = useState<string | null>(value || null);
  const [showForm, setShowForm] = useState(false);

  // Auto-select primary
  useEffect(() => {
    if (autoSelectPrimary && contacts.length > 0 && !selectedId) {
      const primary = contacts.find((c) => c.isPrimary);
      if (primary) {
        setSelectedId(primary.id);
        onChange(primary.id, primary);
      }
    }
  }, [contacts, autoSelectPrimary, selectedId, onChange]);

  const handleSelect = (contact: Contact) => {
    setSelectedId(contact.id);
    onChange(contact.id, contact);
  };

  const handleNewContact = (contact: Contact) => {
    setSelectedId(contact.id);
    onChange(contact.id, contact);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <LoaderIcon className="w-6 h-6 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <PhoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No saved contacts
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon />
              Add Contact
            </button>
          </div>
        ) : (
          <>
            {contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleSelect(contact)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  selectedId === contact.id
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === contact.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckIcon className="text-white" />
                      </div>
                    ) : (
                      <PhoneIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

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
                    {contact.relationship && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {contact.relationship}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">Add New Contact</span>
              </div>
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Form Modal (if provided) */}
      {showForm && FormModal && ContactForm && (
        <FormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={async () => {}}
        >
          <ContactForm onSuccess={handleNewContact} />
        </FormModal>
      )}
    </div>
  );
}

export default ContactSelectorWithCreate;
