import { AdminProvider } from "@/app/AdminProvider";
import { ToastProvider } from "@/components/admin/Toast";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Piston & Fusion Business Academy",
  robots: { index: false, follow: false },
};

/**
 * Admin-wide providers (current admin + toasts). The portal shell lives in
 * (portal)/layout.tsx so the sign-in page at /auth renders without it.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <ToastProvider>{children}</ToastProvider>
    </AdminProvider>
  );
}
