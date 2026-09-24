"use client";

import Card from "@/components/Card";
import { AlertTriangle, ChevronRight, Building2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import CompanyFormModal from "./CompanyFormModal";
import { Company } from "@/types";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { useTableState } from "@/hooks/admin/useTableState";
import { useAdminGlobal } from "@/app/AdminProvider";
import PageHeader from "@/components/admin/PageHeader";
import TableToolbar from "@/components/admin/TableToolbar";
import TableStatusRow from "@/components/admin/TableStatusRow";
import Pagination from "@/components/admin/Pagination";
import { downloadCsv } from "@/components/admin/csv";
import { CopyableId } from "@/components/common/CopyButton";

const th = "px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider";

const AdminCompanies = () => {
  const { canWrite } = useAdminGlobal();
  const { page, setPage, search, setSearch } = useTableState();
  const { items, pagination, isLoading, isFetching, error, refetch, isSearch } =
    useResourceList<Company>("companies", {
      page,
      search,
      sort: "name",
      order: "asc",
    });

  const [editing, setEditing] = useState<Company | null | undefined>();

  const exportCsv = () =>
    downloadCsv(`companies-page-${page}`, items, [
      { header: "Company ID", value: (c) => c.companyId },
      { header: "Name", value: (c) => c.name },
      { header: "Industry", value: (c) => c.industry },
      { header: "Billing Contact", value: (c) => c.billingContact?.name },
      { header: "Billing Email", value: (c) => c.billingContact?.email },
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage corporate clients and partnerships."
        addLabel={canWrite ? "Add Company" : undefined}
        onAdd={() => setEditing(null)}
      />

      <Card className="p-0">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search companies by name or ID..."
          onDownload={exportCsv}
          downloadDisabled={items.length === 0}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th scope="col" className={th}>
                  Company Name
                </th>
                <th scope="col" className={th}>
                  Industry
                </th>
                <th scope="col" className={th}>
                  Company ID
                </th>
                <th scope="col" className={th}>
                  Billing Contact
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-zinc-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600"
                      >
                        <Building2 size={20} />
                      </div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {company.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-600">{company.industry}</p>
                  </td>
                  <td className="px-6 py-4">
                    <CopyableId
                      value={company.companyId}
                      label={`company ID ${company.companyId}`}
                      className="text-xs text-zinc-500 font-mono uppercase"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {company.billingContact ? (
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-900">
                          {company.billingContact.name}
                        </p>
                        <p className="text-xs text-zinc-500 break-all">
                          {company.billingContact.email}
                        </p>
                      </div>
                    ) : company.billingContact === null ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"
                        title="Add a billing contact so receipts can be emailed"
                      >
                        <AlertTriangle size={14} aria-hidden="true" />
                        No billing contact
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(company)}
                      aria-label={`${canWrite ? "Edit" : "View"} ${company.name}`}
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
                    ? "No companies match your search."
                    : "No companies found."
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
          <CompanyFormModal
            key={editing?.id ?? "new"}
            company={editing}
            onClose={() => setEditing(undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCompanies;
