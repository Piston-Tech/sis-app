"use client";

import Card from "@/components/Card";
import {
  Plus,
  Search,
  ChevronRight,
  Building2,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import useCourse from "@/hooks/useCourse";
import CourseFormModal from "./CourseFormModal";
import { Course } from "@/types";
import Link from "next/link";

const AdminCourses = () => {
  const { courses, refreshCourses } = useCourse();

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  if (error)
    return <div className="p-10 text-center text-rose-600">Error: {error}</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Courses
            </h1>
            <p className="text-zinc-500 mt-1">
              Manage corporate clients and partnerships.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
          >
            <Plus size={18} />
            Add Course
          </button>
        </header>

        <Card className="p-0">
          <div className="p-4 border-b border-zinc-100 flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search courses by name or industry..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {courses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600">
                          <Building2 size={20} />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <Link href={course.link ?? "#"}>
                            <p className="text-sm font-semibold text-zinc-900">
                              {course.title}
                            </p>
                          </Link>
                          <span className="text-xs text-zinc-600">
                            {course.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">{course.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">
                        {course.duration} Days
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowAddModal(true);
                        }}
                        className="text-zinc-400 hover:text-black transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-zinc-500"
                    >
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <AnimatePresence>
          {showAddModal && (
            <CourseFormModal
              course={selectedCourse}
              onClose={() => {
                setShowAddModal(false);
                // fetchCourses();
                refreshCourses();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminCourses;
