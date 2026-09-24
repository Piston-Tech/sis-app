"use client";

import Modal from "@/components/Modal";
import { Button, Input, Select, TransactionSelector } from "@/components/Form";
import FormError from "./FormError";
import { useToast } from "./Toast";
import { PAYMENT_METHODS, paymentSchema } from "./schemas";
import { useFormState } from "@/hooks/admin/useFormState";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";

interface FixedTransaction {
  id: number;
  transactionId: string;
  payerType: string;
}

interface PaymentFormValues {
  transactionId: number;
  category: string;
  amountPaid: number | null;
  method: string;
  paymentDate: Date | null;
}

/**
 * Records a payment: POST /admin/payments
 * { transactionId, category, amountPaid, status: "PENDING", receiptSent: false,
 *   method?, paymentDate? }. Pass `transaction` to lock it (transaction page).
 */
const PaymentFormModal = ({
  transaction,
  onClose,
}: {
  transaction?: FixedTransaction;
  onClose: () => void;
}) => {
  const toast = useToast();
  const form = useFormState<PaymentFormValues>({
    transactionId: transaction?.id ?? 0,
    category: transaction?.payerType ?? "",
    amountPaid: null,
    method: "",
    paymentDate: new Date(),
  });
  const { values, setValues, errors, formError } = form;
  const { create } = useResourceMutation<unknown>("payments", {
    alsoInvalidate: ["transactions"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (create.isPending) return;
    const parsed = form.validate(paymentSchema, {
      ...values,
      status: "PENDING",
      receiptSent: false,
    });
    if (!parsed) return;

    const { method, paymentDate, ...required } = parsed;
    const body = {
      ...required,
      ...(method ? { method } : {}),
      ...(paymentDate ? { paymentDate } : {}),
    };

    try {
      const res = await create.mutateAsync(body);
      toast.success(res.message || "Payment recorded.");
      onClose();
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <Modal
      title={
        transaction
          ? `Record Payment - ${transaction.transactionId}`
          : "Record Payment"
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />
        {!transaction && (
          <TransactionSelector
            value={values.transactionId || undefined}
            onChange={(t) =>
              setValues((prev) => ({
                ...prev,
                transactionId: t.id,
                category: t.payerType ?? prev.category,
              }))
            }
            error={errors.transactionId}
          />
        )}
        <Input
          label="Amount Paid (₦)"
          type="number"
          name="amountPaid"
          min={0}
          step="0.01"
          required
          data={values}
          setData={setValues}
          error={errors.amountPaid}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Method (Optional)"
            name="method"
            options={[...PAYMENT_METHODS]}
            data={values}
            setData={setValues}
            error={errors.method}
          />
          <Input
            label="Payment Date (Optional)"
            type="date"
            name="paymentDate"
            data={values}
            setData={setValues}
            error={errors.paymentDate}
          />
        </div>
        <p className="text-xs text-zinc-500">
          New payments are recorded as pending until approved on the Payments
          page.
        </p>
        <Button loading={create.isPending}>Record Payment</Button>
      </form>
    </Modal>
  );
};

export default PaymentFormModal;
