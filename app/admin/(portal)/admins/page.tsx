"use client";

import Card from "@/components/Card";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import AdminFormModal from "./AdminFormModal";
import { AccessBadge, StatusBadge } from "./AdminBadges";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { useTableState } from "@/hooks/admin/useTableState";
import { adminDisplayName, useAdminGlobal } from "@/app/AdminProvider";
import PageHeader from "@/components/admin/PageHeader";
import TableToolbar from "@/components/admin/TableToolbar";
import TableStatusRow from "@/components/admin/TableStatusRow";
import Pagination from "@/components/admin/Pagination";
import { downloadCsv } from "@/components/admin/csv";
import { formatDateTime } from "@/components/admin/adminFormat";
import type { ManagedAdmin } from "@/types/AdminDetails";
import { ACCESS_LEVEL_LABELS, normaliseAccessLevel } from "@/utils/adminAccess";
import cn from "@/utils/cn";

const th = "px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider";

const STATUS_FILTERS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Deactivated" },
  { value: "", label: "All" },
] as const;

const AdminAccounts = () => {
  const { canManageAdmins, currentUser } = useAdminGlobal();
  const { page, setPage, search, setSearch } = useTableState();
  const [status, setStatus] = useState<string>("true");
  const { items, pagination, isLoading, isFetching, error, refetch, isSearch } =
    useResourceList<ManagedAdmin>("admins", {
      page,
      search,
      sort: "firstName",
      order: "asc",
      filters: { isActive: status },
      enabled: canManageAdmins,
    });

  // undefined: closed, null: creating, number: editing that admin
  const [editing, setEditing] = useState<number | null | undefined>();

  if (!canManageAdmins) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admins" description="Admin accounts." />
        <Card>
          <p className="text-sm text-zinc-600">
            Only super admins can manage admin accounts. To change your own
            password, go to My Account.
          </p>
        </Card>
      </div>
    );
  }

  const exportCsv = () =>
    downloadCsv(`admins-page-${page}`, items, [
      { header: "First Name", value: (a) => a.firstName },
      { header: "Last Name", value: (a) => a.lastName },
      { header: "Email", value: (a) => a.email },
      { header: "Department", value: (a) => a.role },
      { header: "Access", value: (a) => ACCESS_LEVEL_LABELS[normaliseAccessLevel(a.accessLevel)] },
      { header: "Active", value: (a) => (a.isActive === false ? "No" : "Yes") },
      { header: "Last Sign-in", value: (a) => formatDateTime(a.lastLoginAt, "") },
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        description="Invite admins, set what they can do, and help them with passwords."
        addLabel="Add Admin"
        onAdd={() => setEditing(null)}
      />

      <Card className="p-0">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search admins by name, email or department..."
          onDownload={exportCsv}
          downloadDisabled={items.length === 0}
        />
        {!isSearch && (
          <div role="group" aria-label="Filter by status" className="flex gap-2 px-6 pb-4">
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={status === option.value}
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold border transition-colors",
                  status === option.value
                    ? "bg-black text-white border-black"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th scope="col" className={th}>Admin</th>
                <th scope="col" className={th}>Department</th>
                <th scope="col" className={th}>Access</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Last Sign-in</th>
                <th scope="col" className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((admin) => {
                const name = adminDisplayName(admin);
                const isYou = admin.id === currentUser?.id;
                return (
                  <tr key={admin.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600"
                        >
                          <ShieldCheck size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900">
                            {name}
                            {isYou && <span className="ml-2 text-xs font-normal text-zinc-500">(you)</span>}
                          </p>
                          <p className="text-xs text-zinc-500 break-all">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{admin.role?.trim() || "-"}</td>
                    <td className="px-6 py-4"><AccessBadge level={admin.accessLevel} /></td>
                    <td className="px-6 py-4"><StatusBadge admin={admin} /></td>
                    <td className="px-6 py-4 text-sm text-zinc-600 whitespace-nowrap">
                      {formatDateTime(admin.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(admin.id)}
                        aria-label={`Manage ${name}`}
                        className="p-1 text-zinc-400 hover:text-black transition-colors"
                      >
                        <ChevronRight size={18} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <TableStatusRow
                colSpan={6}
                isLoading={isLoading}
                error={error}
                isEmpty={items.length === 0}
                emptyText={search ? "No admins match your search." : "No admins found."}
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
          <AdminFormModal
            key={editing ?? "new"}
            adminId={editing}
            onClose={() => setEditing(undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAccounts;
