"use client";

import Card from "@/components/Card";
import { ChevronRight, Upload } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import StudentFormModal from "./StudentFormModal";
import BulkStudentsModal from "./BulkStudentsModal";
import { CopyableId } from "@/components/common/CopyButton";
import { Student } from "@/types";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { useTableState } from "@/hooks/admin/useTableState";
import { useAdminGlobal } from "@/app/AdminProvider";
import PageHeader from "@/components/admin/PageHeader";
import TableToolbar from "@/components/admin/TableToolbar";
import TableStatusRow from "@/components/admin/TableStatusRow";
import Pagination from "@/components/admin/Pagination";
import { downloadCsv } from "@/components/admin/csv";

type StudentRow = Student & {
  company?: { id: number; name: string; companyId: string } | null;
};

const th = "px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider";

const AdminStudents = () => {
  const { canWrite } = useAdminGlobal();
  const { page, setPage, search, setSearch } = useTableState();
  const { items, pagination, isLoading, isFetching, error, refetch, isSearch } =
    useResourceList<StudentRow>("students", {
      page,
      search,
      sort: "createdAt",
      order: "desc",
    });

  // undefined = closed, null = add, Student = edit/view
  const [editing, setEditing] = useState<StudentRow | null | undefined>();
  const [showBulk, setShowBulk] = useState(false);

  const fullName = (s: StudentRow) =>
    [s.firstName, s.lastName].filter(Boolean).join(" ");

  const exportCsv = () =>
    downloadCsv(`students-page-${page}`, items, [
      { header: "Student ID", value: (s) => s.studentId },
      { header: "Prefix", value: (s) => s.prefix },
      { header: "First Name", value: (s) => s.firstName },
      { header: "Middle Name", value: (s) => s.middleName },
      { header: "Last Name", value: (s) => s.lastName },
      { header: "Email", value: (s) => s.email },
      { header: "Phone", value: (s) => s.phone },
      { header: "Company", value: (s) => s.company?.name ?? s.companyId ?? "" },
      { header: "Membership Tier", value: (s) => s.membershipTier },
      { header: "Persona", value: (s) => s.persona },
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage your student directory and profiles."
        addLabel={canWrite ? "Add Student" : undefined}
        onAdd={() => setEditing(null)}
      >
        {canWrite && (
          <button
            type="button"
            onClick={() => setShowBulk(true)}
            className="border border-zinc-200 bg-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-50 transition-colors"
          >
            <Upload size={18} aria-hidden="true" />
            Bulk upload
          </button>
        )}
      </PageHeader>

      <Card className="p-0">
        <div>
          <TableToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search students by name, email, or ID..."
            onDownload={exportCsv}
            downloadDisabled={items.length === 0}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th scope="col" className={th}>
                    Student
                  </th>
                  <th scope="col" className={th}>
                    Contact
                  </th>
                  <th scope="col" className={th}>
                    Company
                  </th>
                  <th scope="col" className={th}>
                    Tier
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs"
                        >
                          {student.firstName?.[0]}
                          {student.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">
                            {fullName(student)}
                          </p>
                          <CopyableId
                            value={student.studentId}
                            label={`student ID ${student.studentId}`}
                            className="text-[10px] text-zinc-400 font-mono uppercase"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">{student.email}</p>
                      <p className="text-xs text-zinc-400">{student.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-600">
                        {student.company?.name ??
                          (student.companyId
                            ? `#${student.companyId}`
                            : "Individual")}
                      </p>
                      <CopyableId
                        value={student.company?.companyId}
                        label={`company ID ${student.company?.companyId ?? ""}`}
                        className="text-[10px] text-zinc-400 font-mono uppercase"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase">
                        {student.membershipTier || "None"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(student)}
                        aria-label={`${canWrite ? "Edit" : "View"} ${fullName(student)}`}
                        className="p-1 text-zinc-400 hover:text-black transition-colors"
                      >
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
                <TableStatusRow
                  colSpan={5}
                  isLoading={isLoading}
                  error={error}
                  isEmpty={items.length === 0}
                  emptyText={
                    search
                      ? "No students match your search."
                      : "No students yet."
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
        </div>
      </Card>

      <AnimatePresence>
        {editing !== undefined && (
          <StudentFormModal
            key={editing?.id ?? "new"}
            student={editing}
            onClose={() => setEditing(undefined)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulk && <BulkStudentsModal onClose={() => setShowBulk(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default AdminStudents;
