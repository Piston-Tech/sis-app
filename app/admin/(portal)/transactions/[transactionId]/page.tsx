"use client";

import Card from "@/components/Card";
import { Button, Input } from "@/components/Form";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import { ArrowLeft, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { AnimatePresence } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import AddEnrollmentModal from "./AddEnrollmentModal";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useResource } from "@/hooks/admin/useResource";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";
import { useFormState } from "@/hooks/admin/useFormState";
import {
  TransactionDetail,
  TransactionEnrollment,
  invoiceTotal,
  payerCode,
  payerName,
} from "@/hooks/admin/types";
import { transactionUpdateSchema } from "@/components/admin/schemas";
import { StatusContent } from "@/components/admin/TableStatusRow";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import FormError from "@/components/admin/FormError";
import PaymentFormModal from "@/components/admin/PaymentFormModal";
import { useToast } from "@/components/admin/Toast";
import { Payment } from "@/types";
import { CopyableId } from "@/components/common/CopyButton";
import {
  InvoiceTotalModal,
  PricingNotice,
} from "@/components/admin/InvoicePricing";
import {
  ReceiptActions,
  ReceiptStatus,
  SendReceiptModal,
} from "@/components/admin/Receipts";
import { CompanyContactsModal } from "@/components/admin/CompanyContacts";
import { BulkEnrollmentsModal } from "../BulkTransactionModal";

const naira = (v: number | string | undefined) =>
  formatMoney(v ?? 0, true, "Nigerian Naira");

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? null : d;
};

/** Discount + next payment date: PUT /admin/transactions/:id. */
const TransactionDetailsForm = ({
  transaction,
  onEditTotal,
}: {
  transaction: TransactionDetail;
  onEditTotal: () => void;
}) => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const { update } = useResourceMutation<unknown>("transactions");
  const form = useFormState<{
    discount: number | null;
    nextPaymentDate: Date | null;
  }>({
    discount: Number(transaction.discount ?? 0),
    nextPaymentDate: toDate(transaction.nextPaymentDate),
  });
  const { values, setValues, errors, formError } = form;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || update.isPending) return;
    const parsed = form.validate(transactionUpdateSchema, {
      discount: values.discount ?? 0,
      nextPaymentDate: values.nextPaymentDate,
    });
    if (!parsed) return;
    if (parsed.discount > invoiceTotal(transaction)) {
      form.setErrors({ discount: "Discount cannot exceed the invoice total" });
      return;
    }
    try {
      const res = await update.mutateAsync({
        id: transaction.id,
        body: {
          discount: parsed.discount,
          nextPaymentDate: parsed.nextPaymentDate ?? null,
        },
      });
      toast.success(res.message || "Transaction updated.");
    } catch (err) {
      form.applyServerError(err);
    }
  };

  const dirty =
    (values.discount ?? 0) !== Number(transaction.discount ?? 0) ||
    (values.nextPaymentDate?.getTime() ?? null) !==
      (toDate(transaction.nextPaymentDate)?.getTime() ?? null);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FormError message={formError} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          disabled
          label="Transaction Date"
          value={new Date(transaction.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        />
        <div className="flex flex-col space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Status
          </p>
          <div className="flex-1 flex items-center">
            <span
              className={cn(
                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                transaction.status === "Paid" && transaction.totalDue > 0
                  ? "bg-emerald-50 text-emerald-700"
                  : transaction.totalDue > 0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-zinc-50 text-zinc-700",
              )}
            >
              {transaction.totalDue > 0 ? transaction.status : "N/A"}
            </span>
          </div>
        </div>
        <div>
          <Input
            disabled
            label="Invoice Total"
            value={naira(invoiceTotal(transaction))}
          />
          {canWrite && (
            <button
              type="button"
              onClick={onEditTotal}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 hover:text-black hover:underline"
            >
              <Pencil size={12} aria-hidden="true" />
              Edit invoice total
            </button>
          )}
        </div>
        <Input
          label="Discount (₦)"
          type="number"
          name="discount"
          min={0}
          step="0.01"
          disabled={!canWrite}
          data={values}
          setData={setValues}
          error={errors.discount}
        />
        <div>
          <Input
            disabled
            label="Number of Enrollments"
            value={
              transaction.noOfEnrollments ?? transaction.enrollments.length
            }
          />
          <p className="text-[10px] text-zinc-400 mt-1">
            Managed via Linked Enrollments
          </p>
        </div>
        <Input disabled label="Total Due" value={naira(transaction.totalDue)} />
        <Input
          label="Next Payment Date"
          type="date"
          name="nextPaymentDate"
          disabled={!canWrite}
          data={values}
          setData={setValues}
          error={errors.nextPaymentDate}
        />
      </div>
      {canWrite && (
        <div className="flex justify-end">
          <Button
            loading={update.isPending}
            disabled={!dirty}
            className="w-auto mt-0 flex items-center gap-2 px-6 py-2 text-sm"
          >
            <Save size={18} aria-hidden="true" />
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
};

type PendingDelete =
  | { kind: "enrollment"; item: TransactionEnrollment }
  | { kind: "payment"; item: Payment };

const SingleTransactionPage = () => {
  const params = useParams<{ transactionId: string }>();
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const {
    data: transaction,
    isLoading,
    error,
    refetch,
  } = useResource<TransactionDetail>("transactions", params.transactionId);

  const enrollmentMutations = useResourceMutation("enrollments", {
    alsoInvalidate: ["transactions", "classes"],
  });
  const paymentMutations = useResourceMutation("payments", {
    alsoInvalidate: ["transactions"],
  });

  const [showAddEnrollment, setShowAddEnrollment] = useState(false);
  const [showBulkEnrollments, setShowBulkEnrollments] = useState(false);
  const [editingTotal, setEditingTotal] = useState(false);
  const [receiptFor, setReceiptFor] = useState<Payment | null>(null);
  // Receipt flow -> company contacts -> back to the receipt dialog.
  const [contactsOpen, setContactsOpen] = useState(false);
  const [resumeReceipt, setResumeReceipt] = useState<Payment | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );

  const deleteMutation =
    pendingDelete?.kind === "payment"
      ? paymentMutations.remove
      : enrollmentMutations.remove;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.item.id);
      toast.success(
        pendingDelete.kind === "payment"
          ? "Payment deleted."
          : "Enrollment removed.",
      );
      setPendingDelete(null);
    } catch {
      // Shown inside the dialog (e.g. 409 dependent records).
    }
  };

  if (!transaction) {
    return (
      <div className="max-w-5xl mx-auto h-[70vh] flex items-center justify-center text-center">
        <StatusContent
          isLoading={isLoading}
          error={error}
          emptyText="Transaction not found."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/transactions"
            aria-label="Back to transactions"
            className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              {canWrite ? "Edit Transaction" : "Transaction"}
            </h1>
            <p className="text-zinc-500 mt-1 flex flex-wrap items-center gap-x-1">
              Transaction #
              <CopyableId
                value={transaction.transactionId}
                label="transaction ID"
                className="font-mono"
              />
              <span aria-hidden="true">•</span>
              {payerName(transaction.payerType, transaction.payer)}
              <CopyableId
                value={payerCode(transaction.payerType, transaction.payer)}
                label={
                  transaction.payerType === "B2B" ? "company ID" : "student ID"
                }
                className="font-mono text-xs text-zinc-400"
              />
            </p>
          </div>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
            transaction.status === "Paid"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700",
          )}
        >
          {transaction.status}
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <PricingNotice
            transaction={transaction}
            enrollmentCount={transaction.enrollments.length}
          />

          <Card title="Transaction Details">
            <TransactionDetailsForm
              key={`${transaction.id}-${transaction.discount}-${transaction.nextPaymentDate ?? ""}`}
              transaction={transaction}
              onEditTotal={() => setEditingTotal(true)}
            />
          </Card>

          <Card
            title="Linked Enrollments"
            action={
              canWrite ? (
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkEnrollments(true)}
                    className="flex items-center gap-2 text-xs font-bold text-black hover:underline"
                  >
                    <Upload size={14} aria-hidden="true" /> Add enrollments in
                    bulk
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEnrollment(true)}
                    className="flex items-center gap-2 text-xs font-bold text-black hover:underline"
                  >
                    <Plus size={14} aria-hidden="true" /> Add Enrollment
                  </button>
                </div>
              ) : undefined
            }
          >
            <ul className="space-y-4">
              {transaction.enrollments.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      aria-hidden="true"
                      className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs"
                    >
                      {e.student?.firstName?.[0]}
                      {e.student?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">
                        {e.student?.firstName} {e.student?.lastName}
                      </p>
                      <p className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-1">
                        <CopyableId
                          value={e.class?.course?.code}
                          label={`course code ${e.class?.course?.code ?? ""}`}
                        />
                        <span aria-hidden="true">•</span>
                        {e.tier?.name ?? "Standard"}
                        <span aria-hidden="true">•</span>
                        {e.class?.schedule}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono flex flex-wrap items-center gap-x-2">
                        <CopyableId
                          value={e.enrollmentId}
                          label={`enrollment ID ${e.enrollmentId}`}
                        />
                        <CopyableId
                          value={e.student?.studentId}
                          label={`student ID ${e.student?.studentId ?? ""}`}
                        />
                        <CopyableId
                          value={e.class?.classId}
                          label={`class ID ${e.class?.classId ?? ""}`}
                        />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-zinc-100 text-zinc-500">
                      {e.status}
                    </span>
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() => {
                          enrollmentMutations.remove.reset();
                          setPendingDelete({ kind: "enrollment", item: e });
                        }}
                        aria-label={`Remove enrollment for ${e.student?.firstName ?? ""} ${e.student?.lastName ?? ""}`}
                        className="p-2 text-zinc-400 hover:text-rose-600 focus-visible:text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {transaction.enrollments.length === 0 && (
              <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                <p className="text-sm text-zinc-400">
                  No enrollments linked to this transaction.
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Financial Summary">
            <dl className="space-y-4">
              <div className="flex justify-between items-center">
                <dt className="text-sm text-zinc-500">Invoice Total</dt>
                <dd className="text-sm font-bold text-zinc-900">
                  {naira(invoiceTotal(transaction))}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-zinc-500">Discount</dt>
                <dd className="text-sm font-bold text-zinc-900">
                  {Number(transaction.discount) > 0
                    ? `- ${naira(transaction.discount)}`
                    : naira(0)}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-zinc-500">Total Due</dt>
                <dd className="text-sm font-bold text-zinc-900">
                  {naira(transaction.totalDue)}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-zinc-500">Total Paid</dt>
                <dd className="text-sm font-bold text-emerald-600">
                  {naira(transaction.totalPaid)}
                </dd>
              </div>
              <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                <dt className="text-sm font-bold text-zinc-900">Balance</dt>
                {/* Red only when money is still owed */}
                <dd
                  className={`text-lg font-black ${
                    Number(transaction.balance) > 0
                      ? "text-rose-600"
                      : "text-emerald-600"
                  }`}
                >
                  {naira(transaction.balance)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Payment History">
            <div className="space-y-4">
              <ul className="space-y-3">
                {transaction.payments.map((p) => (
                  <li
                    key={p.id}
                    className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">
                          {naira(p.amountPaid)}
                        </p>
                        <CopyableId
                          value={p.paymentId}
                          label={`payment ID ${p.paymentId}`}
                          className="text-[10px] text-zinc-400 font-mono"
                        />
                      </div>
                      {canWrite && (
                        <button
                          type="button"
                          onClick={() => {
                            paymentMutations.remove.reset();
                            setPendingDelete({ kind: "payment", item: p });
                          }}
                          aria-label={`Delete payment ${p.paymentId}`}
                          className="text-zinc-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-zinc-500">
                        {new Date(p.createdAt).toLocaleDateString()} •{" "}
                        {p.category}
                      </p>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                          p.status === "RECEIVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "DECLINED"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {p.status}
                      </span>
                    </div>
                    {p.status === "RECEIVED" && (
                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                        <ReceiptStatus payment={p} compact />
                        <ReceiptActions
                          payment={p}
                          onSend={() => setReceiptFor(p)}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {transaction.payments.length === 0 && (
                <p className="text-xs text-zinc-400 text-center py-4">
                  No payments recorded.
                </p>
              )}

              {canWrite && (
                <div className="pt-4 border-t border-zinc-100">
                  <Button
                    type="button"
                    onClick={() => setShowAddPayment(true)}
                    className="mt-0 py-2 text-xs"
                  >
                    Record Payment
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showAddEnrollment && (
          <AddEnrollmentModal
            transactionId={transaction.id}
            studentId={
              transaction.payerType === "B2C" ? transaction.payerId : undefined
            }
            close={() => setShowAddEnrollment(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkEnrollments && (
          <BulkEnrollmentsModal
            transaction={{
              id: transaction.id,
              transactionId: transaction.transactionId,
              total: invoiceTotal(transaction),
            }}
            onClose={() => setShowBulkEnrollments(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingTotal && (
          <InvoiceTotalModal
            transaction={transaction}
            onClose={() => setEditingTotal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receiptFor && (
          <SendReceiptModal
            payment={receiptFor}
            onManageContacts={
              transaction.payerType === "B2B"
                ? () => {
                    setResumeReceipt(receiptFor);
                    setReceiptFor(null);
                    setContactsOpen(true);
                  }
                : undefined
            }
            onClose={() => setReceiptFor(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {contactsOpen && transaction.payerType === "B2B" && (
          <CompanyContactsModal
            companyId={transaction.payerId}
            companyName={transaction.payer?.name}
            onClose={() => {
              setContactsOpen(false);
              if (resumeReceipt) {
                setReceiptFor(
                  transaction.payments.find((p) => p.id === resumeReceipt.id) ??
                    resumeReceipt,
                );
                setResumeReceipt(null);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPayment && (
          <PaymentFormModal
            transaction={{
              id: transaction.id,
              transactionId: transaction.transactionId,
              payerType: transaction.payerType,
            }}
            onClose={() => setShowAddPayment(false)}
          />
        )}
      </AnimatePresence>

      {pendingDelete && (
        <ConfirmDialog
          title={
            pendingDelete.kind === "payment"
              ? "Delete payment?"
              : "Remove enrollment?"
          }
          message={
            pendingDelete.kind === "payment" ? (
              <>
                Permanently delete payment{" "}
                <strong>{pendingDelete.item.paymentId}</strong> of{" "}
                {naira(pendingDelete.item.amountPaid)}?
              </>
            ) : (
              <>
                Remove the enrollment of{" "}
                <strong>
                  {pendingDelete.item.student?.firstName}{" "}
                  {pendingDelete.item.student?.lastName}
                </strong>{" "}
                in {pendingDelete.item.class?.course?.code}? The transaction
                total will be recalculated.
              </>
            )
          }
          confirmLabel="Delete"
          destructive
          loading={deleteMutation.isPending}
          error={deleteMutation.error?.message}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
};

export default SingleTransactionPage;
