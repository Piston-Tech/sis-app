"use client";

import NotificationPanel from "@/components/NotificationPanel";
import Sidebar from "@/components/Sidebar";
import { ReactNode, useEffect, useRef, useState } from "react";
import { AppNotification } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Loading from "@/app/app/loading";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { currentUser: user, handleLogout } = useAuth();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "n1",
      title: "New Course Dropped",
      message: "Project Management Strategy 2024 is now live in your hub.",
      type: "course",
      timestamp: "2h ago",
      isRead: false,
      link: "Learning Hub",
    },
    {
      id: "n2",
      title: "Tunde Replied",
      message: "Check out the new comment on your community post.",
      type: "community",
      timestamp: "5h ago",
      isRead: false,
      link: "Community",
    },
    {
      id: "n3",
      title: "7 Day Streak!",
      message:
        'Amazing consistency! You just unlocked the "Disciplined Scholar" badge.',
      type: "achievement",
      timestamp: "1d ago",
      isRead: true,
    },
    {
      id: "n4",
      title: "System Maintenance",
      message: "The Academy will be undergoing maintenance this Sunday at 2AM.",
      type: "system",
      timestamp: "2d ago",
      isRead: true,
    },
  ]);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    if (!user.persona) return router.replace("/onboarding");

    setIsLoading(false);
  }, [user]);

  //   const handleOnboardingComplete = (data: Partial<User>) => {
  //     setUser(prev => prev ? ({ ...prev, ...data, onboarded: true }) : null);
  //   };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  if (!user || isLoading) return <Loading />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto px-4 lg:px-12 pb-20">
        <header className="flex justify-between items-center mb-10 sticky top-0 bg-slate-50/90 backdrop-blur-xl z-40 py-6 border-b border-slate-200">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-blue-600 bg-white rounded-xl border border-slate-200 shadow-sm"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Desktop Search */}
            <div className="hidden md:block relative md:w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search courses, resources..."
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-2xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
              />
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-blue-600 bg-white rounded-xl border border-slate-200 shadow-sm"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Absolute Mobile Search Bar */}
          {isSearchOpen && (
            <div className="absolute inset-0 z-50 bg-slate-50 flex items-center px-4 md:hidden">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search courses, resources..."
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div
            className="flex items-center gap-6 relative"
            ref={notificationRef}
          >
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative text-slate-400 hover:text-blue-600 transition-all p-2 bg-white rounded-xl border border-slate-200 shadow-sm ${showNotifications ? "text-blue-600 border-blue-200 ring-4 ring-blue-500/10" : ""}`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onClearAll={clearAllNotifications}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  setShowNotifications(false);
                }}
                onClose={() => setShowNotifications(false)}
              />
            )}

            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                  {/* {user.role.replace("_", " ")} */}
                  {user.persona.replace("_", " ")}
                </p>
              </div>
              <div className="relative group">
                <img
                  src={`https://picsum.photos/seed/${user.id}/80/80`}
                  className="h-11 w-11 rounded-2xl border-2 border-white shadow-lg cursor-pointer group-hover:scale-105 transition-transform"
                  alt="Avatar"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default AppLayout;
