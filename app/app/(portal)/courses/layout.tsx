"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const TABS = [
  { title: "Recommendations", href: "/courses/recommendations" },
  { title: "Enrollments", href: "/courses/enrollments" },
  { title: "Course catalogue", href: "/courses/register" },
];

const CoursePageLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname() ?? "";
  const showTabs = TABS.some((tab) => tab.href === pathname);

  return (
    <div className="space-y-8">
      {showTabs && (
        <nav
          aria-label="Courses"
          className="flex gap-2 overflow-x-auto rounded-[2rem] border border-slate-100 bg-white px-4 shadow-sm sm:gap-8 sm:px-8"
        >
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap px-4 pb-5 pt-5 text-sm font-bold uppercase tracking-wider transition-all ${
                  active ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.title}
                {active && (
                  <span aria-hidden className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
      {children}
    </div>
  );
};

export default CoursePageLayout;
