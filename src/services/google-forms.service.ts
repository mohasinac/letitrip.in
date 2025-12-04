/**
 * Google Forms Integration Service
 *
 * Fetches Google Form responses and syncs event registrations
 * Requires Google Forms API credentials
 */

import { logError } from "@/lib/firebase-error-logger";

interface GoogleFormResponse {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  respondentEmail?: string;
  answers: Record<string, GoogleFormAnswer>;
}

interface GoogleFormAnswer {
  questionId: string;
  textAnswers?: {
    answers: Array<{ value: string }>;
  };
  fileUploadAnswers?: {
    answers: Array<{ fileId: string; fileName: string; mimeType: string }>;
  };
}

interface EventRegistration {
  eventId: string;
  userId?: string;
  email: string;
  name: string;
  phone?: string;
  additionalData?: Record<string, any>;
  source: "google_forms";
  responseId: string;
  createdAt: Date;
}

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
        method: "GET",
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
    eventId: string,
    response: GoogleFormResponse,
    questionMapping: {
      nameQuestionId: string;
      emailQuestionId: string;
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
              fileId: a.fileId,
              fileName: a.fileName,
              mimeType: a.mimeType,
            }),
          );
        }
      }
    }

    return {
      eventId,
      email: emailAnswer,
      name: nameAnswer,
      phone: phoneAnswer,
      additionalData:
        Object.keys(additionalData).length > 0 ? additionalData : undefined,
      source: "google_forms",
      responseId: response.responseId,
      createdAt: new Date(response.lastSubmittedTime),
    };
  }

  /**
   * Sync Google Form responses to event registrations
   */
  async syncEventRegistrations(
    eventId: string,
    formId: string,
    questionMapping: {
      nameQuestionId: string;
      emailQuestionId: string;
      phoneQuestionId?: string;
    },
  ): Promise<{
    synced: number;
    skipped: number;
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
            component: "GoogleFormsService.syncEventRegistrations",
            responseId: response.responseId,
          });
          stats.errors++;
        }
      }

      return stats;
    } catch (error) {
      logError(error as Error, {
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

      const data = await response.json();
      return new Set(data.registrations?.map((r: any) => r.responseId) || []);
    } catch (error) {
      logError(error as Error, {
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
    registration: EventRegistration,
  ): Promise<void> {
    const response = await fetch(
      `/api/events/${registration.eventId}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    title: string;
    description: string;
    questions: Array<{
      questionId: string;
      title: string;
      type: string;
      required: boolean;
    }>;
  }> {
    if (!this.enabled) {
      throw new Error("Google Forms API key not configured");
    }

    try {
      const url = `https://forms.googleapis.com/v1/forms/${formId}?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || "Failed to fetch form metadata",
        );
      }

      const data = await response.json();

      return {
        title: data.info?.title || "",
        description: data.info?.description || "",
        questions: (data.items || []).map((item: any) => ({
          questionId: item.questionItem?.question?.questionId || "",
          title: item.title || "",
          type: Object.keys(item.questionItem?.question || {})[0] || "unknown",
          required: item.questionItem?.question?.required || false,
        })),
      };
    } catch (error) {
      logError(error as Error, {
        component: "GoogleFormsService.getFormMetadata",
        formId,
      });
      throw error;
    }
  }
}

export const googleFormsService = new GoogleFormsService();
export default googleFormsService;
