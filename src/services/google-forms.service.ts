/**
 * @fileoverview Service Module
 * @module src/services/google-forms.service
 * @description This file contains service functions for google-forms operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Google Forms Integration Service
 *
 * Fetches Google Form responses and syncs event registrations
 * Requires Google Forms API credentials
 */

import { logError } from "@/lib/firebase-error-logger";

/**
 * GoogleFormResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for GoogleFormResponse
 */
interface GoogleFormResponse {
  /** Response Id */
  responseId: string;
  /** Create Time */
  createTime: string;
  /** Last Submitted Time */
  lastSubmittedTime: string;
  /** Respondent Email */
  respondentEmail?: string;
  /** Answers */
  answers: Record<string, GoogleFormAnswer>;
}

/**
 * GoogleFormAnswer interface
 * 
 * @interface
 * @description Defines the structure and contract for GoogleFormAnswer
 */
interface GoogleFormAnswer {
  /** Question Id */
  questionId: string;
  /** Text Answers */
  textAnswers?: {
    /** Answers */
    answers: Array<{ value: string }>;
  };
  /** File Upload Answers */
  fileUploadAnswers?: {
    /** Answers */
    answers: Array<{ fileId: string; fileName: string; mimeType: string }>;
  };
}

/**
 * EventRegistration interface
 * 
 * @interface
 * @description Defines the structure and contract for EventRegistration
 */
interface EventRegistration {
  /** Event Id */
  eventId: string;
  /** User Id */
  userId?: string;
  /** Email */
  email: string;
  /** Name */
  name: string;
  /** Phone */
  phone?: string;
  /** Additional Data */
  additionalData?: Record<string, any>;
  /** Source */
  source: "google_forms";
  /** Response Id */
  responseId: string;
  /** Created At */
  createdAt: Date;
}

/**
 * GoogleFormsService class
 * 
 * @class
 * @description Description of GoogleFormsService class functionality
 */
class GoogleFormsService {
  private apiKey: string;
  private enabled: boolean;

  constructor() {
    this.apiKey = process.env.GOOGLE_FORMS_API_KEY || "";
    this.enabled = !!this.apiKey;
  }

  /**
   * Check if Google Forms integration is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Fetch responses from a Google Form
   */
  async fetchFormResponses(formId: string): Promise<GoogleFormResponse[]> {
    if (!this.enabled) {
      throw new Error("Google Forms API key not configured");
    }

    try {
      const url = `https://forms.googleapis.com/v1/forms/${formId}/responses?key=${this.apiKey}`;

      const response = await fetch(url, {
        /** Method */
        method: "GET",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || "Failed to fetch form responses",
        );
      }

      const data = await response.json();
      return data.responses || [];
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GoogleFormsService.fetchFormResponses",
        formId,
      });
      throw error;
    }
  }

  /**
   * Parse form response into event registration data
   */
  parseEventRegistration(
    /** Event Id */
    eventId: string,
    /** Response */
    response: GoogleFormResponse,
    /** Question Mapping */
    questionMapping: {
      /** Name Question Id */
      nameQuestionId: string;
      /** Email Question Id */
      emailQuestionId: string;
      /** Phone Question Id */
      phoneQuestionId?: string;
    },
  ): EventRegistration {
    const { nameQuestionId, emailQuestionId, phoneQuestionId } =
      questionMapping;

    const nameAnswer =
      response.answers[nameQuestionId]?.textAnswers?.answers[0]?.value;
    const emailAnswer =
      response.answers[emailQuestionId]?.textAnswers?.answers[0]?.value;
    const phoneAnswer = phoneQuestionId
      ? response.answers[phoneQuestionId]?.textAnswers?.answers[0]?.value
      : undefined;

    if (!nameAnswer || !emailAnswer) {
      throw new Error(
        "Missing required fields (name or email) in form response",
      );
    }

    // Collect additional data from other questions
    const additionalData: Record<string, any> = {};
    for (const [questionId, answer] of Object.entries(response.answers)) {
      if (
        questionId !== nameQuestionId &&
        questionId !== emailQuestionId &&
        questionId !== phoneQuestionId
      ) {
        if (answer.textAnswers) {
          additionalData[questionId] = answer.textAnswers.answers.map(
            (a) => a.value,
          );
        } else if (answer.fileUploadAnswers) {
          additionalData[questionId] = answer.fileUploadAnswers.answers.map(
            (a) => ({
              /** File Id */
              fileId: a.fileId,
              /** File Name */
              fileName: a.fileName,
              /** Mime Type */
              mimeType: a.mimeType,
            }),
          );
        }
      }
    }

    return {
      eventId,
      /** Email */
      email: emailAnswer,
      /** Name */
      name: nameAnswer,
      /** Phone */
      phone: phoneAnswer,
      /** Additional Data */
      additionalData:
        Object.keys(additionalData).length > 0 ? additionalData : undefined,
      /** Source */
      source: "google_forms",
      /** Response Id */
      responseId: response.responseId,
      /** Created At */
      createdAt: new Date(response.lastSubmittedTime),
    };
  }

  /**
   * Sync Google Form responses to event registrations
   */
  async syncEventRegistrations(
    /** Event Id */
    eventId: string,
    /** Form Id */
    formId: string,
    /** Question Mapping */
    questionMapping: {
      /** Name Question Id */
      nameQuestionId: string;
      /** Email Question Id */
      emailQuestionId: string;
      /** Phone Question Id */
      phoneQuestionId?: string;
    },
  ): Promise<{
    /** Synced */
    synced: number;
    /** Skipped */
    skipped: number;
    /** Errors */
    errors: number;
  }> {
    const stats = { synced: 0, skipped: 0, errors: 0 };

    try {
      // Fetch all form responses
      const responses = await this.fetchFormResponses(formId);

      // Get existing registrations to avoid duplicates
      const existingResponseIds = await this.getExistingResponseIds(eventId);

      // Process each response
      for (const response of responses) {
        try {
          // Skip if already synced
          if (existingResponseIds.has(response.responseId)) {
            stats.skipped++;
            continue;
          }

          // Parse registration data
          const registration = this.parseEventRegistration(
            eventId,
            response,
            questionMapping,
          );

          // Save to database via API
          await this.saveRegistration(registration);
          stats.synced++;
        } catch (error) {
          logError(error as Error, {
            /** Component */
            component: "GoogleFormsService.syncEventRegistrations",
            /** Response Id */
            responseId: response.responseId,
          });
          stats.errors++;
        }
      }

      return stats;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GoogleFormsService.syncEventRegistrations",
        eventId,
        formId,
      });
      throw error;
    }
  }

  /**
   * Get existing response IDs for an event (to avoid duplicates)
   */
  private async getExistingResponseIds(eventId: string): Promise<Set<string>> {
    try {
      const response = await fetch(
        `/api/events/${eventId}/registrations?source=google_forms&fields=responseId`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch existing registrations");
      }

      /**
 * Performs data operation
 *
 * @returns {any} The data result
 *
 */
const data = await response.json();
      return new Set(data.registrations?.map((r: any) => r.responseId) || []);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GoogleFormsService.getExistingResponseIds",
        eventId,
      });
      return new Set();
    }
  }

  /**
   * Save registration via API
   */
  private async saveRegistration(
    /** Registration */
    registration: EventRegistration,
  ): Promise<void> {
    const response = await fetch(
      `/api/events/${registration.eventId}/register`,
      {
        /** Method */
        method: "POST",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
        },
        /** Body */
        body: JSON.stringify(registration),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save registration");
    }
  }

  /**
   * Get form metadata
   */
  async getFormMetadata(formId: string): Promise<{
    /** Title */
    title: string;
    /** Description */
    description: string;
    /** Questions */
    questions: Array<{
      /** Question Id */
      questionId: string;
      /** Title */
      title: string;
      /** Type */
      type: string;
      /** Required */
      required: boolean;
    }>;
  }> {
    if (!this.enabled) {
      throw new Error("Google Forms API key not configured");
    }

    try {
      const url = `https://forms.googleapis.com/v1/forms/${formId}?key=${this.apiKey}`;

      const response = await fetch(url, {
        /** Method */
        method: "GET",
        /** Headers */
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?/**
 * Performs data operation
 *
 * @returns {any} The data result
 *
 */
.message || "Failed to fetch form metadata",
        );
      }

      const data = await response.json();

      return {
        /** Title */
        title: data.info?.title || "",
        /** Description */
        description: data.info?.description || "",
        /** Questions */
        questions: (data.items || []).map((item: any) => ({
          /** Question Id */
          questionId: item.questionItem?.question?.questionId || "",
          /** Title */
          title: item.title || "",
          /** Type */
          type: Object.keys(item.questionItem?.question || {})[0] || "unknown",
          /** Required */
          required: item.questionItem?.question?.required || false,
        })),
      };
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "GoogleFormsService.getFormMetadata",
        formId,
      });
      throw error;
    }
  }
}

export const googleFormsService = new GoogleFormsService();
export default googleFormsService;
