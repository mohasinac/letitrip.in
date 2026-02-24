export const EVENT_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-startsAt", label: "Start Date (Desc)" },
  { value: "startsAt", label: "Start Date (Asc)" },
  { value: "-endsAt", label: "End Date (Desc)" },
  { value: "endsAt", label: "End Date (Asc)" },
  { value: "title", label: "Title A–Z" },
  { value: "-title", label: "Title Z–A" },
] as const;
