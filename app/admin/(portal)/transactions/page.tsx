"use client";

import Card from "@/components/Card";
import { FileText, Upload } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import TransactionFormModal from "./TransactionFormModal";
import { BulkTransactionModal } from "./BulkTransactionModal";
import { CopyableId } from "@/components/common/CopyButton";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { useTableState } from "@/hooks/admin/useTableState";
import {
  TransactionSummary,
  invoiceTotal,
  payerCode,
  payerName,
} from "@/hooks/admin/types";
import { useAdminGlobal } from "@/app/AdminProvider";
import PageHeader from "@/components/admin/PageHeader";
import TableToolbar from "@/components/admin/TableToolbar";
import TableStatusRow from "@/components/admin/TableStatusRow";
import Pagination from "@/components/admin/Pagination";
import { downloadCsv } from "@/components/admin/csv";

const th = "px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider";

const naira = (v: number | string | undefined) =>
  formatMoney(v ?? 0, true, "Nigerian Naira");

const AdminTransactions = () => {
  const { canWrite } = useAdminGlobal();
  const { page, setPage, search, setSearch } = useTableState();
  const { items, pagination, isLoading, isFetching, error, refetch, isSearch } =
    useResourceList<TransactionSummary>("transactions", {
      page,
      search,
      sort: "createdAt",
      order: "desc",
    });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const exportCsv = () =>
    downloadCsv(`transactions-page-${page}`, items, [
      { header: "Transaction ID", value: (t) => t.transactionId },
      {
        header: "Date",
        value: (t) => new Date(t.createdAt).toISOString().slice(0, 10),
      },
      { header: "Payer Type", value: (t) => t.payerType },
      { header: "Payer", value: (t) => payerName(t.payerType, t.payer) },
      { header: "Payer ID", value: (t) => payerCode(t.payerType, t.payer) },
      { header: "Enrollments", value: (t) => t.noOfEnrollments ?? 0 },
      { header: "Invoice Total (NGN)", value: (t) => invoiceTotal(t) },
      { header: "Discount (NGN)", value: (t) => t.discount },
      { header: "Total Due (NGN)", value: (t) => t.totalDue },
      { header: "Paid (NGN)", value: (t) => t.totalPaid },
      { header: "Balance (NGN)", value: (t) => t.balance },
      { header: "Status", value: (t) => t.status },
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Invoices, enrollments and balances."
        addLabel={canWrite ? "Add Transaction" : undefined}
        onAdd={() => setShowAddModal(true)}
      >
        {canWrite && (
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="border border-zinc-200 bg-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-zinc-50 transition-colors"
          >
            <Upload size={18} aria-hidden="true" />
            Bulk upload
          </button>
        )}
      </PageHeader>

      <Card className="p-0">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search transactions by ID or payer..."
          onDownload={exportCsv}
          downloadDisabled={items.length === 0}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th scope="col" className={th}>
                  Transaction
                </th>
                <th scope="col" className={th}>
                  Payer
                </th>
                <th scope="col" className={`${th} text-center`}>
                  Students
                </th>
                <th scope="col" className={th}>
                  Invoice Total
                </th>
                <th scope="col" className={th}>
                  Paid
                </th>
                <th scope="col" className={th}>
                  Balance
                </th>
                <th scope="col" className={th}>
                  Status
                </th>
                <th scope="col" className={`${th} w-16 text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <CopyableId
                      value={t.transactionId}
                      label={`transaction ID ${t.transactionId}`}
                      className="text-xs font-mono font-semibold text-zinc-800"
                    />
                    <p className="text-xs text-zinc-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-zinc-900">
                      {payerName(t.payerType, t.payer)}
                    </p>
                    <CopyableId
                      value={payerCode(t.payerType, t.payer)}
                      label={`${t.payerType === "B2B" ? "company" : "student"} ID ${payerCode(t.payerType, t.payer)}`}
                      className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-lg">
                      {t.noOfEnrollments || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-zinc-900">
                      {naira(invoiceTotal(t))}
                    </p>
                    {Number(t.discount) > 0 && (
                      <p className="text-[10px] text-zinc-500">
                        - {naira(t.discount)} discount = {naira(t.totalDue)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-600 font-semibold">
                    {naira(t.totalPaid)}
                  </td>
                  <td className="px-6 py-4 text-sm text-rose-600 font-semibold">
                    {naira(t.balance)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                        t.status === "Paid" && t.totalDue > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : t.totalDue > 0
                            ? "bg-amber-50 text-amber-700"
                            : "bg-zinc-50 text-zinc-700",
                      )}
                    >
                      {t.totalDue > 0 ? t.status : "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-16 text-right">
                    <Link
                      href={`/transactions/${encodeURIComponent(t.transactionId)}`}
                      aria-label={`Open transaction ${t.transactionId}`}
                      className="inline-flex p-1 text-zinc-400 hover:text-black transition-colors"
                    >
                      <FileText size={18} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
              <TableStatusRow
                colSpan={8}
                isLoading={isLoading}
                error={error}
                isEmpty={items.length === 0}
                emptyText={
                  search
                    ? "No transactions match your search."
                    : "No transactions recorded."
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
        {showAddModal && (
          <TransactionFormModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkModal && (
          <BulkTransactionModal onClose={() => setShowBulkModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTransactions;
