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
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Link,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import SidebarItem from "@/components/SidebarItem";
import cn from "@/utils/cn";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAdminAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/courses", icon: BookOpen, label: "Courses" },
    { to: "/classes", icon: Calendar, label: "Classes" },
    { to: "/students", icon: Users, label: "Students" },
    { to: "/companies", icon: Building2, label: "Companies" },
    { to: "/transactions", icon: CreditCard, label: "Transactions" },
    { to: "/attendance", icon: CheckSquare, label: "Attendance" },
    { to: "/reports", icon: BarChart3, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-zinc-100 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 leading-tight">P&F Admin</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Management Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => (
            <SidebarItem
              key={item.to}
              {...item}
              active={pathname === item.to}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <img
                src="https://picsum.photos/seed/admin/100/100"
                alt="Admin"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 truncate">
                Alex Rivera
              </p>
              <p className="text-xs text-zinc-500 truncate">Super Admin</p>
            </div>
            <button
              className="text-zinc-400 hover:text-rose-600 transition-colors"
              onClick={() => logout()}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="font-bold text-zinc-900">P&F Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-zinc-600"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-white z-60 p-6 lg:hidden"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="font-bold text-zinc-900">P&F Admin</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-zinc-600"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium",
                    location.pathname === item.to
                      ? "bg-black text-white"
                      : "text-zinc-600",
                  )}
                >
                  <item.icon size={24} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 max-w-7xl mx-auto w-full">
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
