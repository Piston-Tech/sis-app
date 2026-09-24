"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  Banknote,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import SidebarItem from "@/components/SidebarItem";
import cn from "@/utils/cn";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminDisplayName, useAdminGlobal } from "@/app/AdminProvider";
import { ACCESS_LEVEL_LABELS } from "@/utils/adminAccess";
import Link from "next/link";

// Only routes that exist under app/admin/(portal).
const navigation = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/foundation", icon: Sparkles, label: "Foundations" },
  { to: "/classes", icon: Calendar, label: "Classes" },
  { to: "/students", icon: Users, label: "Students" },
  { to: "/companies", icon: Building2, label: "Companies" },
  { to: "/transactions", icon: CreditCard, label: "Transactions" },
  { to: "/payments", icon: Banknote, label: "Payments" },
];

const initials = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAdminAuth();
  const { currentUser, accessLevel } = useAdminGlobal();
  const pathname = usePathname() ?? "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = adminDisplayName(currentUser);
  // Department (free text from the backend) and what the admin may do
  const department = currentUser?.role?.trim();
  const profileLabel = [department, ACCESS_LEVEL_LABELS[accessLevel]]
    .filter(Boolean)
    .join(" · ");

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-zinc-100 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div
            aria-hidden="true"
            className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl"
          >
            P
          </div>
          <div>
            <p className="font-bold text-zinc-900 leading-tight">P&F Admin</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Management Portal
            </p>
          </div>
        </div>

        <nav aria-label="Admin" className="flex-1 space-y-1">
          {navigation.map((item) => (
            <SidebarItem key={item.to} {...item} active={isActive(item.to)} />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600"
            >
              {initials(displayName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">
                {displayName}
              </p>
              {currentUser?.email && currentUser.email !== displayName && (
                <p className="text-xs text-zinc-500 truncate">
                  {currentUser.email}
                </p>
              )}
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
                {profileLabel}
              </p>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              disabled={loggingOut}
              className="text-zinc-400 hover:text-rose-600 transition-colors disabled:opacity-50"
              onClick={handleLogout}
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold"
          >
            P
          </div>
          <span className="font-bold text-zinc-900">P&F Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="admin-mobile-menu"
          className="p-2 text-zinc-600"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="admin-mobile-menu"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-white z-60 p-6 lg:hidden overflow-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <div
                  aria-hidden="true"
                  className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold"
                >
                  P
                </div>
                <span className="font-bold text-zinc-900">P&F Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-zinc-600"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Admin" className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive(item.to) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium",
                    isActive(item.to) ? "bg-black text-white" : "text-zinc-600",
                  )}
                >
                  <item.icon size={24} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {profileLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 text-sm font-semibold text-rose-600 disabled:opacity-50"
              >
                <LogOut size={18} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 max-w-7xl mx-auto w-full min-w-0"
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminLayout;
