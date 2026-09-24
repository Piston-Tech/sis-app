"use client";

import Card from "@/components/Card";
import { ChevronRight, BookOpen, ExternalLink } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import CourseFormModal from "./CourseFormModal";
import { Course } from "@/types";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { useTableState } from "@/hooks/admin/useTableState";
import { useAdminGlobal } from "@/app/AdminProvider";
import PageHeader from "@/components/admin/PageHeader";
import TableToolbar from "@/components/admin/TableToolbar";
import TableStatusRow from "@/components/admin/TableStatusRow";
import Pagination from "@/components/admin/Pagination";
import { downloadCsv } from "@/components/admin/csv";

const th = "px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider";

const isHttpUrl = (value: string | undefined) =>
  !!value && /^https?:\/\//i.test(value);

const AdminCourses = () => {
  const { canWrite } = useAdminGlobal();
  const { page, setPage, search, setSearch } = useTableState();
  const { items, pagination, isLoading, isFetching, error, refetch, isSearch } =
    useResourceList<Course>("courses", {
      page,
      search,
      sort: "title",
      order: "asc",
    });

  const [editing, setEditing] = useState<Course | null | undefined>();

  const exportCsv = () =>
    downloadCsv(`courses-page-${page}`, items, [
      { header: "Code", value: (c) => c.code },
      { header: "Title", value: (c) => c.title },
      { header: "Category", value: (c) => c.category },
      { header: "Sub-category", value: (c) => c.subCategory },
      { header: "Level", value: (c) => c.level?.name },
      { header: "Duration (days)", value: (c) => c.duration },
      { header: "Link", value: (c) => c.link },
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Manage the course catalogue."
        addLabel={canWrite ? "Add Course" : undefined}
        onAdd={() => setEditing(null)}
      />

      <Card className="p-0">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search courses by title or code..."
          onDownload={exportCsv}
          downloadDisabled={items.length === 0}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th scope="col" className={th}>
                  Course
                </th>
                <th scope="col" className={th}>
                  Category
                </th>
                <th scope="col" className={th}>
                  Duration
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-zinc-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600"
                      >
                        <BookOpen size={20} />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <p className="text-sm font-semibold text-zinc-900">
                          {course.title}
                        </p>
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
                    <div className="flex items-center justify-end gap-2">
                      {isHttpUrl(course.link) && (
                        <a
                          href={course.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${course.title} page (new tab)`}
                          className="p-1 text-zinc-400 hover:text-black transition-colors"
                        >
                          <ExternalLink size={16} aria-hidden="true" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing(course)}
                        aria-label={`${canWrite ? "Edit" : "View"} ${course.title}`}
                        className="p-1 text-zinc-400 hover:text-black transition-colors"
                      >
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              <TableStatusRow
                colSpan={4}
                isLoading={isLoading}
                error={error}
                isEmpty={items.length === 0}
                emptyText={
                  search ? "No courses match your search." : "No courses found."
                }
                onRetry={() => refetch()}
              />
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pagination={pagination}
          onPageChange={setPage}
          isFetching={isFetching}
          itemCount={items.length}
          isSearch={isSearch}
        />
      </Card>

      <AnimatePresence>
        {editing !== undefined && (
          <CourseFormModal
            key={editing?.id ?? "new"}
            course={editing}
            onClose={() => setEditing(undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCourses;
