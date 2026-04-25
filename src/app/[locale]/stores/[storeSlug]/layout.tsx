import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<unknown>;
};

export default async function Layout({ children, params }: Props) {
  await params;
  return children;
}
