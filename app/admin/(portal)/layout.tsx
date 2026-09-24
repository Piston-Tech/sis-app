"use client";

import { useAdminGlobal } from "@/app/AdminProvider";
import AdminLayout from "@/components/AdminLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Authenticated admin shell, rendered once for every portal page. */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAdminGlobal();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) router.replace("/auth");
  }, [loading, currentUser, router]);

  if (loading || !currentUser) {
    return (
      <div
        role="status"
        className="min-h-screen flex items-center justify-center text-zinc-500"
      >
        {loading ? "Loading..." : "Redirecting to sign in..."}
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
