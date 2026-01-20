"use client";

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  currentSort: string;
  options: SortOption[];
  defaultValue?: string;
  paramName?: string;
}

/**
 * Client-side sort dropdown that updates URL with sort parameter
 */
export function SortDropdown({
  currentSort,
  options,
  defaultValue = options[0]?.value,
  paramName = "sort",
}: SortDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    if (e.target.value !== defaultValue) {
      url.searchParams.set(paramName, e.target.value);
    } else {
      url.searchParams.delete(paramName);
    }
    window.location.href = url.toString();
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
