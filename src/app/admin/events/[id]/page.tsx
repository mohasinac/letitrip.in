"use client";

import { FormField, FormInput, FormTextarea } from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminEventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const isNew = eventId === "create";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "workshop",
    status: "draft",
    startDate: "",
    endDate: "",
    location: "",
    isOnline: false,
    maxParticipants: "",
    registrationDeadline: "",
    isPollEvent: false,
    allowMultipleVotes: false,
    imageUrl: "",
  });

  const { isLoading: loading, execute } = useLoadingState({
    onLoadError: (error) => {
      logError(error, {
        component: "AdminEventDetail",
        action: isNew ? "create" : "update",
      });
      toast.error(`Failed to ${isNew ? "create" : "update"} event`);
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isNew) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    await execute(async () => {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to load event");
      const data = await response.json();
      if (data.success && data.event) {
        const event = data.event;
        setFormData({
          title: event.title || "",
          description: event.description || "",
          type: event.type || "workshop",
          status: event.status || "draft",
          startDate: event.startDate || "",
          endDate: event.endDate || "",
          location: event.location || "",
          isOnline: event.isOnline || false,
          maxParticipants: event.maxParticipants?.toString() || "",
          registrationDeadline: event.registrationDeadline || "",
          isPollEvent: event.isPollEvent || false,
          allowMultipleVotes: event.allowMultipleVotes || false,
          imageUrl: event.imageUrl || "",
        });
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await execute(async () => {
      const payload = {
        ...formData,
        maxParticipants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : undefined,
      };

      const url = isNew ? "/api/admin/events" : `/api/admin/events/${eventId}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save event");
      }

      toast.success(`Event ${isNew ? "created" : "updated"} successfully`);
      router.push("/admin/events");
    });

    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setDeleting(true);

    await execute(async () => {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      toast.success("Event deleted successfully");
      router.push("/admin/events");
    });

    setDeleting(false);
  };

  if (loading && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isNew ? "Create Event" : "Edit Event"}
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6"
        >
          <FormField label="Title" required>
            <FormInput
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Event title"
            />
          </FormField>

          <FormField label="Description" required>
            <FormTextarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Event description"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Type" required>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="competition">Competition</option>
                <option value="poll">Poll</option>
                <option value="announcement">Announcement</option>
              </select>
            </FormField>

            <FormField label="Status" required>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Start Date" required>
              <FormInput
                type="datetime-local"
                value={
                  formData.startDate ? formData.startDate.slice(0, 16) : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
              />
            </FormField>

            <FormField label="End Date" required>
              <FormInput
                type="datetime-local"
                value={formData.endDate ? formData.endDate.slice(0, 16) : ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
              />
            </FormField>
          </div>

          <FormField label="Location">
            <FormInput
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Event location"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Max Participants">
              <FormInput
                type="number"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({ ...formData, maxParticipants: e.target.value })
                }
                placeholder="Leave empty for unlimited"
              />
            </FormField>

            <FormField label="Registration Deadline">
              <FormInput
                type="datetime-local"
                value={
                  formData.registrationDeadline
                    ? formData.registrationDeadline.slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registrationDeadline: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
              />
            </FormField>
          </div>

          <FormField label="Image URL">
            <FormInput
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </FormField>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOnline}
                onChange={(e) =>
                  setFormData({ ...formData, isOnline: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Online event
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPollEvent}
                onChange={(e) =>
                  setFormData({ ...formData, isPollEvent: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Poll event
              </span>
            </label>

            {formData.isPollEvent && (
              <label className="flex items-center gap-2 ml-6">
                <input
                  type="checkbox"
                  checked={formData.allowMultipleVotes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowMultipleVotes: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Allow multiple votes
                </span>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {!isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Deleting..." : "Delete Event"}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/events"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {submitting
                  ? "Saving..."
                  : isNew
                  ? "Create Event"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
