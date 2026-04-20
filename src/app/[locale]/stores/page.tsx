import { StoresListView, type StoreListItem } from "@mohasinac/appkit";

export default function Page() {
  return (
    <StoresListView stores={[] as StoreListItem[]} labels={{ empty: "No stores available yet." }} />
  );
}