import { StoresListView, type StoreListItem } from "@mohasinac/appkit";
import { EmptyState } from "@mohasinac/appkit/ui";

export default function Page() {
  return (
    <StoresListView
      stores={[] as StoreListItem[]}
      slots={{
        renderEmptyState: () => (
          <EmptyState
            title="No stores yet"
            description="Stores will appear here once sellers join the marketplace."
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
          />
        ),
      }}
    />
  );
}