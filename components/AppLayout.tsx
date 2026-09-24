"use client";

import NotificationPanel from "@/components/NotificationPanel";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/student/Toast";
import { useGlobal } from "@/app/GlobalProvider";
import { useLogout } from "@/hooks/useAuth";
import { getPersonaLabel } from "@/constants/profile";
import Loading from "@/app/app/loading";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, User } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Authenticated shell of the student portal (sidebar + header). Rendered once
 * by app/app/(portal)/layout.tsx so it doesn't remount on navigation.
 */
const AppLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { currentUser: user, loading } = useGlobal();
  const logout = useLogout();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (!user.persona) router.replace("/onboarding");
  }, [loading, user, router]);

  // Close the notification panel on outside click / Escape.
  useEffect(() => {
    if (!showNotifications) return;
    const onPointer = (event: MouseEvent) => {
      if (!notificationRef.current?.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowNotifications(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [showNotifications]);

  if (!user || !user.persona) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-12">
        <Loading />
      </div>
    );
  }

  const personaLabel = getPersonaLabel(user.persona);

  return (
    <ToastProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={logout}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur-xl lg:px-12 lg:py-6">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-controls="student-sidebar"
              aria-expanded={isSidebarOpen}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:text-blue-700 lg:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
            <span className="hidden lg:block" />

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications((open) => !open)}
                  aria-label="Notifications"
                  aria-expanded={showNotifications}
                  aria-haspopup="dialog"
                  className={`rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-all hover:text-blue-700 ${
                    showNotifications ? "border-blue-200 text-blue-700 ring-4 ring-blue-500/10" : ""
                  }`}
                >
                  <Bell className="h-5 w-5" aria-hidden />
                </button>

                {showNotifications && (
                  <NotificationPanel
                    notifications={[]}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-2xl border-l border-slate-200 pl-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="hidden text-right sm:block">
                  <span className="block text-sm font-black leading-tight text-slate-900">
                    {user.firstName} {user.lastName}
                  </span>
                  {personaLabel && (
                    <span className="block text-xs font-semibold text-slate-600">
                      {personaLabel}
                    </span>
                  )}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white bg-blue-50 shadow-lg">
                  <User className="h-6 w-6 text-blue-700" aria-hidden />
                  <span className="sr-only">Your profile</span>
                </span>
              </Link>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-4 pb-20 pt-8 lg:px-12">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default AppLayout;
