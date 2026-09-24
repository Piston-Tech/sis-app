"use client";

import { Button, Input } from "@/components/Form";
import Modal from "@/components/Modal";
import formatMoney from "@/utils/formatMoney";
import { Info } from "lucide-react";
import { useState } from "react";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";
import { TransactionSummary, invoiceTotal } from "@/hooks/admin/types";
import ConfirmDialog from "./ConfirmDialog";
import FormError from "./FormError";
import { invoiceTotalSchema } from "./schemas";
import { useToast } from "./Toast";

const naira = (v: number | string | undefined | null) =>
  formatMoney(v ?? 0, true, "Nigerian Naira");

type PricedTransaction = Pick<
  TransactionSummary,
  | "id"
  | "transactionId"
  | "total"
  | "subTotal"
  | "discount"
  | "computedTotal"
  | "priceDifference"
  | "noOfEnrollments"
>;

/** PUT /admin/transactions/:id { total } (invalidates transactions). */
const useUpdateInvoiceTotal = () =>
  useResourceMutation<{ total: number }>("transactions").update;

/**
 * Info notice when the price list total of the current enrollments differs
 * from the stored invoice total. The invoice total stays the amount owed
 * unless an admin explicitly updates it here.
 */
export const PricingNotice = ({
  transaction,
  enrollmentCount,
}: {
  transaction: PricedTransaction;
  enrollmentCount?: number;
}) => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const update = useUpdateInvoiceTotal();
  const [confirming, setConfirming] = useState(false);

  const difference = Number(transaction.priceDifference ?? 0);
  const computed = transaction.computedTotal;
  if (computed === undefined || computed === null || !difference) return null;

  const count = enrollmentCount ?? transaction.noOfEnrollments ?? 0;
  const current = invoiceTotal(transaction);

  const apply = async () => {
    try {
      await update.mutateAsync({
        id: transaction.id,
        body: { total: Number(computed) },
      });
      toast.success(`Invoice total updated to ${naira(computed)}.`);
      setConfirming(false);
    } catch {
      // Shown in the dialog.
    }
  };

  return (
    <div
      role="note"
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-sky-100 bg-sky-50 text-sky-900"
    >
      <Info size={18} className="shrink-0" aria-hidden="true" />
      <p className="text-sm flex-1">
        Price list total for the current {count} enrollment
        {count === 1 ? "" : "s"} is <strong>{naira(computed)}</strong> (
        {naira(Math.abs(difference))} {difference > 0 ? "more" : "less"} than
        the invoice). The invoice total of {naira(current)} is what is owed.
      </p>
      {canWrite && (
        <button
          type="button"
          onClick={() => {
            update.reset();
            setConfirming(true);
          }}
          className="shrink-0 px-3 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-zinc-800"
        >
          Update invoice total to {naira(computed)}
        </button>
      )}
      {confirming && (
        <ConfirmDialog
          title="Update invoice total?"
          message={
            <>
              Change the invoice total of{" "}
              <strong>{transaction.transactionId}</strong> from{" "}
              <strong>{naira(current)}</strong> to{" "}
              <strong>{naira(computed)}</strong>? The amount due and balance
              are recalculated from the new total
              {Number(transaction.discount) > 0
                ? ` minus the ${naira(transaction.discount)} discount`
                : ""}
              .
            </>
          }
          confirmLabel="Update total"
          loading={update.isPending}
          error={update.error?.message}
          onConfirm={apply}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
};

/** Explicit "Edit invoice total" dialog: PUT /admin/transactions/:id { total }. */
export const InvoiceTotalModal = ({
  transaction,
  onClose,
}: {
  transaction: PricedTransaction;
  onClose: () => void;
}) => {
  const toast = useToast();
  const update = useUpdateInvoiceTotal();
  const form = useFormState<{ total: number | null }>({
    total: invoiceTotal(transaction),
  });
  const { values, setValues, errors, formError } = form;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (update.isPending) return;
    const parsed = form.validate(invoiceTotalSchema);
    if (!parsed) return;
    if (parsed.total < Number(transaction.discount ?? 0)) {
      form.setErrors({
        total: `The total cannot be less than the ${naira(transaction.discount)} discount`,
      });
      return;
    }
    try {
      await update.mutateAsync({
        id: transaction.id,
        body: { total: parsed.total },
      });
      toast.success(`Invoice total updated to ${naira(parsed.total)}.`);
      onClose();
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <Modal
      title={`Edit invoice total - ${transaction.transactionId}`}
      onClose={onClose}
      size="sm"
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={formError} />
        <Input
          label="Invoice total (₦)"
          type="number"
          name="total"
          min={0}
          step="0.01"
          required
          data={values}
          setData={setValues}
          error={errors.total}
        />
        {transaction.computedTotal !== undefined &&
          transaction.computedTotal !== null && (
            <p className="text-xs text-zinc-500">
              Price list total for the current enrollments:{" "}
              {naira(transaction.computedTotal)}.
            </p>
          )}
        <p className="text-xs text-zinc-500">
          The invoice total is what the payer owes (before discount). Changing
          the enrollments does not change it.
        </p>
        <Button loading={update.isPending}>Save invoice total</Button>
      </form>
    </Modal>
  );
};
