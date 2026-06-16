"use client";

import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const CoursePageLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/courses") {
    router.replace("/courses/recommendations");
  }

  const menuItems = [
    { title: "Recommendations", href: "recommendations" },
    { title: "Enrollments", href: "enrollments" },
    { title: "Register", href: "register" },
    { title: "Career Advisor", href: "career-advisor" },
    { title: "How To", href: "how-to" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Sub-tabs for Payments */}
        {menuItems
          .map((menu) => menu.href)
          .includes(pathname.replace("/courses/", "")) && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto scrollbar-hide flex gap-8 px-8">
            {menuItems.map((tab) => (
              <Link href={`/courses/${tab.href}`} key={tab.href}>
                <button
                  key={tab.href}
                  className={`whitespace-nowrap pb-6 pt-6 px-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                    pathname === `/courses/${tab.href}`
                      ? "text-blue-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.title}
                  {pathname === `/courses/${tab.href}` && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
                  )}
                </button>
              </Link>
            ))}
          </div>
        )}
        {children}
      </div>
    </AppLayout>
  );
};

export default CoursePageLayout;
