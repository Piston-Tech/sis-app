"use client";

import Card from "@/components/Card";
import { Calendar, Users, Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import ClassFormModal from "./ClassFormModal";
import getClassDateRange from "@/utils/getClassDateRange";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";
import { useTableState } from "@/hooks/admin/useTableState";
import { ClassWithRelations } from "@/hooks/admin/useClassForm";
import { useAdminGlobal } from "@/app/AdminProvider";
import PageHeader from "@/components/admin/PageHeader";
import TableToolbar from "@/components/admin/TableToolbar";
import { StatusContent } from "@/components/admin/TableStatusRow";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { downloadCsv } from "@/components/admin/csv";
import { CopyableId } from "@/components/common/CopyButton";

const PAGE_SIZE = 24;

const classLabel = (cls: ClassWithRelations) =>
  `${cls.classId} - ${cls.customClass?.title || cls.course?.title || cls.course?.code || ""}`;

const ClassesList = () => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const { page, setPage, search, setSearch } = useTableState();
  const { items, pagination, isLoading, isFetching, error, refetch, isSearch } =
    useResourceList<ClassWithRelations>("classes", {
      page,
      limit: PAGE_SIZE,
      search,
      sort: "plannedStartDate",
      order: "desc",
    });
  const { remove } = useResourceMutation("classes");

  const [editing, setEditing] = useState<
    ClassWithRelations | null | undefined
  >();
  const [toDelete, setToDelete] = useState<ClassWithRelations | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      toast.success(`Class ${toDelete.classId} deleted.`);
      setToDelete(null);
    } catch {
      // Error is shown inside the dialog (e.g. 409: has enrollments).
    }
  };

  const exportCsv = () =>
    downloadCsv(`classes-page-${page}`, items, [
      { header: "Class ID", value: (c) => c.classId },
      { header: "Course Code", value: (c) => c.course?.code },
      { header: "Course Title", value: (c) => c.course?.title },
      { header: "Custom Title", value: (c) => c.customClass?.title },
      {
        header: "Planned Start",
        value: (c) =>
          c.plannedStartDate
            ? new Date(c.plannedStartDate).toISOString().slice(0, 10)
            : "",
      },
      { header: "Schedule", value: (c) => c.schedule },
      { header: "Sessions", value: (c) => c.sessions?.length ?? 0 },
      { header: "Enrolled", value: (c) => c.noOfEnrollments ?? 0 },
    ]);

  const showStatus =
    isLoading || (!!error && items.length === 0) || items.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Schedule and manage training cohorts."
        addLabel={canWrite ? "New Class" : undefined}
        onAdd={() => setEditing(null)}
      />

      <Card className="p-0">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search classes by course code or title..."
          onDownload={exportCsv}
          downloadDisabled={items.length === 0}
        />
        {error && items.length > 0 && (
          <p role="alert" className="px-6 py-3 text-sm text-rose-600">
            {error.message}
          </p>
        )}
      </Card>

      {showStatus ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-zinc-200 text-sm">
          <StatusContent
            isLoading={isLoading}
            error={error}
            emptyText={
              search
                ? "No classes match your search."
                : "No classes scheduled yet."
            }
            onRetry={() => refetch()}
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((cls) => {
            const { min, max } = getClassDateRange(cls.sessions ?? []);
            return (
              <li key={cls.id}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start justify-between mb-4">
                    <CopyableId
                      value={cls.course?.code}
                      label={`course code ${cls.course?.code ?? ""}`}
                      className="px-2 py-1 rounded bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-wider"
                    />
                    {cls.isCustom && (
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
                        Custom
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2">
                    {classLabel(cls)}
                  </h3>
                  <CopyableId
                    value={cls.classId}
                    label={`class ID ${cls.classId}`}
                    className="mb-2 text-[10px] font-mono text-zinc-500"
                  />
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Calendar size={14} aria-hidden="true" />
                      <span>
                        {min && max
                          ? `${min.toLocaleDateString()} - ${max.toLocaleDateString()}`
                          : "No sessions scheduled"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Users size={14} aria-hidden="true" />
                      <span>{cls.noOfEnrollments || 0} Enrolled</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(cls)}
                      aria-label={`View details for ${classLabel(cls)}`}
                      className="flex-1 bg-zinc-100 text-zinc-900 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition-colors"
                    >
                      View Details
                    </button>
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() => {
                          remove.reset();
                          setToDelete(cls);
                        }}
                        aria-label={`Delete ${classLabel(cls)}`}
                        className="p-2 border border-zinc-100 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-zinc-400 transition-colors"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {!showStatus && (
        <Card className="p-0">
          <Pagination
            page={page}
            pagination={pagination}
            onPageChange={setPage}
            isFetching={isFetching}
            itemCount={items.length}
            isSearch={isSearch}
          />
        </Card>
      )}

      <AnimatePresence>
        {editing !== undefined && (
          <ClassFormModal
            key={editing?.id ?? "new"}
            data={editing}
            onClose={() => setEditing(undefined)}
          />
        )}
      </AnimatePresence>

      {toDelete && (
        <ConfirmDialog
          title="Delete class?"
          message={
            <>
              This permanently deletes <strong>{classLabel(toDelete)}</strong>{" "}
              and its sessions. Classes with enrollments cannot be deleted.
            </>
          }
          confirmLabel="Delete class"
          destructive
          loading={remove.isPending}
          error={remove.error?.message}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};

export default ClassesList;
