import AppLayout from "@/components/AppLayout";
import { ReactNode } from "react";

/**
 * Shell for every signed-in portal page. The `(portal)` route group keeps the
 * URLs unchanged while leaving /auth and /onboarding outside the shell.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
