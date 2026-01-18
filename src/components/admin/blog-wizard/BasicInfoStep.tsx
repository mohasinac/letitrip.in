import {
  FormInput,
  FormTextarea,
  BasicInfoStep as LibraryBasicInfoStep,
  type BasicInfoStepData,
} from "@letitrip/react-library";

// Map the local types to library types
type BlogFormData = BasicInfoStepData & { [key: string]: any };
type OnBlogChange = (field: keyof BasicInfoStepData, value: string) => void;

interface BasicInfoStepProps {
  formData: BlogFormData;
  onChange: OnBlogChange;
  errors?: Record<string, string>;
}

/**
 * Next.js wrapper for BasicInfoStep component
 */
export function BasicInfoStep({
  formData,
  onChange,
  errors,
}: BasicInfoStepProps) {
  return (
    <LibraryBasicInfoStep
      formData={formData}
      onChange={onChange}
      errors={errors}
      FormInputComponent={FormInput}
      FormTextareaComponent={FormTextarea}
      urlPrefix="/blog/"
    />
  );
}
