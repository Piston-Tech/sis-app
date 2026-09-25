"use client";

import Card from "@/components/Card";
import { Check, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useId, useState } from "react";
import Link from "next/link";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import { useResourceList } from "@/hooks/admin/useResourceList";
import { useAdminMutation } from "@/hooks/admin/useResourceMutation";
import { useTableState } from "@/hooks/admin/useTableState";
import {
  PaymentRow,
  PaymentStatus,
  payerCode,
  payerName,
} from "@/hooks/admin/types";
import { useAdminGlobal } from "@/app/AdminProvider";
import PageHeader from "@/components/admin/PageHeader";
import TableToolbar from "@/components/admin/TableToolbar";
import TableStatusRow from "@/components/admin/TableStatusRow";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import PaymentFormModal from "@/components/admin/PaymentFormModal";
import { useToast } from "@/components/admin/Toast";
import { downloadCsv } from "@/components/admin/csv";
import CopyButton, { CopyableId } from "@/components/common/CopyButton";
import {
  ReceiptActions,
  ReceiptStatus,
  SendReceiptModal,
} from "@/components/admin/Receipts";
import { CompanyContactsModal } from "@/components/admin/CompanyContacts";

const th = "px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider";

const STATUS_FILTERS: Array<{ value: "" | PaymentStatus; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "RECEIVED", label: "Received" },
  { value: "DECLINED", label: "Declined" },
];

const statusClass = (status: string) =>
  status === "RECEIVED"
    ? "bg-emerald-50 text-emerald-700"
    : status === "DECLINED"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

const AdminPayments = () => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const filterId = useId();
  const { page, setPage, search, setSearch } = useTableState();
  const [status, setStatus] = useState<"" | PaymentStatus>("");
  const { items, pagination, isLoading, isFetching, error, refetch, isSearch } =
    useResourceList<PaymentRow>("payments", {
      page,
      search,
      sort: "createdAt",
      order: "desc",
      filters: { status },
    });

  const setStatusFn = useAdminMutation<{ id: number; status: PaymentStatus }>(
    ({ id, status }) => ({
      method: "patch",
      url: `/admin/payments/${id}/status`,
      body: { status },
    }),
    { invalidate: ["payments", "transactions"] },
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [toDecline, setToDecline] = useState<PaymentRow | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [receiptFor, setReceiptFor] = useState<PaymentRow | null>(null);
  // Receipt flow -> company contacts -> back to the receipt dialog.
  const [contactsFor, setContactsFor] = useState<PaymentRow | null>(null);

  const changeStatus = async (payment: PaymentRow, next: PaymentStatus) => {
    setPendingId(payment.id);
    try {
      await setStatusFn.mutateAsync({ id: payment.id, status: next });
      toast.success(
        `Payment ${payment.paymentId} ${next === "RECEIVED" ? "approved" : "declined"}.`,
      );
      setToDecline(null);
    } catch (err) {
      // Decline errors show in the dialog; approve errors as a toast.
      if (next === "RECEIVED")
        toast.error(
          err instanceof Error ? err.message : "Could not update payment.",
        );
    } finally {
      setPendingId(null);
    }
  };

  const exportCsv = () =>
    downloadCsv(`payments-page-${page}`, items, [
      { header: "Payment ID", value: (p) => p.paymentId },
      {
        header: "Date",
        value: (p) => new Date(p.createdAt).toISOString().slice(0, 10),
      },
      { header: "Transaction ID", value: (p) => p.transaction?.transactionId },
      {
        header: "Payer",
        value: (p) => payerName(p.transaction?.payerType, p.transaction?.payer),
      },
      { header: "Category", value: (p) => p.category },
      { header: "Amount (NGN)", value: (p) => p.amountPaid },
      { header: "Method", value: (p) => p.method },
      { header: "Status", value: (p) => p.status },
      { header: "Receipt No", value: (p) => p.receiptNo },
      { header: "Receipt Sent", value: (p) => (p.receiptSent ? "Yes" : "No") },
      { header: "Receipt Sent To", value: (p) => p.receiptSentTo },
      {
        header: "Receipt Sent At",
        value: (p) =>
          p.receiptSentAt ? new Date(p.receiptSentAt).toISOString() : "",
      },
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Review, approve and record payments."
        addLabel={canWrite ? "Add Payment" : undefined}
        onAdd={() => setShowAddModal(true)}
      />

      <Card className="p-0">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search payments by ID or payer..."
          onDownload={exportCsv}
          downloadDisabled={items.length === 0}
        >
          <label htmlFor={filterId} className="sr-only">
            Filter by status
          </label>
          <select
            id={filterId}
            value={status}
            disabled={isSearch}
            title={
              isSearch ? "Clear the search to filter by status" : undefined
            }
            onChange={(e) => {
              setStatus(e.target.value as "" | PaymentStatus);
              setPage(1);
            }}
            className="px-3 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm disabled:opacity-50"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </TableToolbar>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th scope="col" className={th}>
                  Date
                </th>
                <th scope="col" className={th}>
                  Payer
                </th>
                <th scope="col" className={`${th} text-center`}>
                  Transaction
                </th>
                <th scope="col" className={th}>
                  Amount Paid
                </th>
                <th scope="col" className={th}>
                  Status
                </th>
                <th scope="col" className={th}>
                  Receipt
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((p) => {
                const busy = pendingId === p.id;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {new Date(
                        p.paymentDate ?? p.createdAt,
                      ).toLocaleDateString()}
                      <CopyableId
                        value={p.paymentId}
                        label={`payment ID ${p.paymentId}`}
                        className="block text-[10px] text-zinc-400 font-mono"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-zinc-900">
                        {payerName(
                          p.transaction?.payerType,
                          p.transaction?.payer,
                        )}
                      </p>
                      <CopyableId
                        value={payerCode(
                          p.transaction?.payerType,
                          p.transaction?.payer,
                        )}
                        label={`${p.transaction?.payerType === "B2B" ? "company" : "student"} ID`}
                        className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.transaction ? (
                        <span className="inline-flex items-center gap-0.5">
                          <Link
                            href={`/transactions/${encodeURIComponent(p.transaction.transactionId)}`}
                            className="text-sm font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded-lg hover:underline"
                          >
                            {p.transaction.transactionId}
                          </Link>
                          <CopyButton
                            value={p.transaction.transactionId}
                            label={`transaction ID ${p.transaction.transactionId}`}
                            size={12}
                          />
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-zinc-900">
                      {formatMoney(p.amountPaid, true, "Nigerian Naira")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                          statusClass(p.status),
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-44">
                      {p.status === "RECEIVED" ? (
                        <div className="space-y-2">
                          <ReceiptStatus payment={p} compact />
                          <ReceiptActions
                            payment={p}
                            onSend={() => setReceiptFor(p)}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canWrite && p.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            aria-busy={busy || undefined}
                            onClick={() => changeStatus(p, "RECEIVED")}
                            aria-label={`Approve payment ${p.paymentId}`}
                            className="flex gap-1 py-2 px-3 bg-black rounded-lg text-white cursor-pointer disabled:opacity-50"
                          >
                            <Check
                              strokeWidth={3}
                              size={14}
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold">
                              Approve
                            </span>
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setStatusFn.reset();
                              setToDecline(p);
                            }}
                            aria-label={`Decline payment ${p.paymentId}`}
                            className="flex gap-1 py-2 px-3 bg-gray-200 rounded-lg text-black/70 cursor-pointer disabled:opacity-50"
                          >
                            <X strokeWidth={3} size={14} aria-hidden="true" />
                            <span className="text-xs font-semibold">
                              Decline
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <TableStatusRow
                colSpan={7}
                isLoading={isLoading}
                error={error}
                isEmpty={items.length === 0}
                emptyText={
                  search || status
                    ? "No payments match."
                    : "No payments recorded."
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
          <PaymentFormModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receiptFor && (
          <SendReceiptModal
            payment={receiptFor}
            onManageContacts={
              receiptFor.transaction?.payerType === "B2B"
                ? () => {
                    setContactsFor(receiptFor);
                    setReceiptFor(null);
                  }
                : undefined
            }
            onClose={() => setReceiptFor(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contactsFor?.transaction && (
          <CompanyContactsModal
            companyId={contactsFor.transaction.payerId}
            companyName={contactsFor.transaction.payer?.name}
            onClose={() => {
              const resume =
                items.find((row) => row.id === contactsFor.id) ?? contactsFor;
              setContactsFor(null);
              setReceiptFor(resume);
            }}
          />
        )}
      </AnimatePresence>

      {toDecline && (
        <ConfirmDialog
          title="Decline payment?"
          message={
            <>
              Decline payment <strong>{toDecline.paymentId}</strong> of{" "}
              {formatMoney(toDecline.amountPaid, true, "Nigerian Naira")}? It
              will not count towards the transaction balance.
            </>
          }
          confirmLabel="Decline payment"
          destructive
          loading={setStatusFn.isPending}
          error={setStatusFn.error?.message}
          onConfirm={() => changeStatus(toDecline, "DECLINED")}
          onCancel={() => setToDecline(null)}
        />
      )}
    </div>
  );
};

export default AdminPayments;
