"use client";

import { useAdminGlobal } from "@/app/AdminProvider";
import AdminLayout from "@/components/AdminLayout";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const ACCOUNT_PATH = "/account";

/** Authenticated admin shell, rendered once for every portal page. */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useAdminGlobal();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  // A temporary password from a super admin must be replaced before
  // anything else (My account is the only page available until then)
  const mustChangePassword =
    !!currentUser?.mustChangePassword && pathname !== ACCOUNT_PATH;

  useEffect(() => {
    if (!loading && !currentUser) router.replace("/auth");
    else if (mustChangePassword) router.replace(ACCOUNT_PATH);
  }, [loading, currentUser, mustChangePassword, router]);

  if (loading || !currentUser || mustChangePassword) {
    return (
      <div
        role="status"
        className="min-h-screen flex items-center justify-center text-zinc-500"
      >
        {loading
          ? "Loading..."
          : mustChangePassword
            ? "Redirecting to My account..."
            : "Redirecting to sign in..."}
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
