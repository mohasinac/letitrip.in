import { FormLabel } from "@/components/forms";
import RichTextEditor from "@/components/common/RichTextEditor";
import type { BlogFormData, OnBlogChange } from "./types";

interface ContentStepProps {
  formData: BlogFormData;
  onChange: OnBlogChange;
  error?: string;
}

export function ContentStep({ formData, onChange, error }: ContentStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Post Content
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Write the main content of your blog post
        </p>
      </div>

      <div>
        <FormLabel required>Content</FormLabel>
        <RichTextEditor
          value={formData.content}
          onChange={(value) => onChange("content", value)}
          placeholder="Write your blog post content here..."
          minHeight={400}
          error={error}
        />
      </div>
    </div>
  );
}
