"use client";

import { Button, Input, TextArea } from "@/components/Form";
import Modal from "@/components/Modal";
import { CopyableId } from "@/components/common/CopyButton";
import formatMoney from "@/utils/formatMoney";
import { FileText, Send, Users } from "lucide-react";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import {
  receiptPdfUrl,
  useReceiptPreview,
  useSendReceipt,
} from "@/hooks/admin/useReceipt";
import { Payment } from "@/types";
import { ReceiptPreview } from "@/types/Receipt";
import FormError from "./FormError";
import { sendReceiptSchema } from "./schemas";
import { StatusContent } from "./TableStatusRow";
import { useToast } from "./Toast";

export type ReceiptPayment = Pick<
  Payment,
  | "id"
  | "paymentId"
  | "status"
  | "amountPaid"
  | "receiptSent"
  | "receiptNo"
  | "receiptSentAt"
  | "receiptSentTo"
>;

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

/** Receipt number + "Sent to x on <date>" / "Not sent". */
export const ReceiptStatus = ({
  payment,
  compact = false,
}: {
  payment: ReceiptPayment;
  compact?: boolean;
}) => {
  const sentOn = formatDate(payment.receiptSentAt);
  return (
    <div className={compact ? "text-[11px]" : "text-xs"}>
      {payment.receiptNo ? (
        <CopyableId
          value={payment.receiptNo}
          label={`receipt number ${payment.receiptNo}`}
          className="font-mono font-semibold text-zinc-700"
        />
      ) : null}
      <p className={payment.receiptSent ? "text-emerald-700" : "text-zinc-400"}>
        {payment.receiptSent
          ? `Sent${payment.receiptSentTo ? ` to ${payment.receiptSentTo}` : ""}${sentOn ? ` on ${sentOn}` : ""}`
          : "Receipt not sent"}
      </p>
    </div>
  );
};

/** "View receipt" (PDF, new tab) and, for writers, "Send/Resend receipt". */
export const ReceiptActions = ({
  payment,
  onSend,
}: {
  payment: ReceiptPayment;
  onSend: () => void;
}) => {
  const { canWrite } = useAdminGlobal();
  if (payment.status !== "RECEIVED") return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={receiptPdfUrl(payment.id)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View receipt for payment ${payment.paymentId} (PDF, opens in a new tab)`}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        <FileText size={12} aria-hidden="true" />
        View receipt
      </a>
      {canWrite && (
        <button
          type="button"
          onClick={onSend}
          aria-label={`${payment.receiptSent ? "Resend" : "Send"} receipt for payment ${payment.paymentId}`}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black text-white text-[11px] font-semibold hover:bg-zinc-800"
        >
          <Send size={12} aria-hidden="true" />
          {payment.receiptSent ? "Resend receipt" : "Send receipt"}
        </button>
      )}
    </div>
  );
};

const SOURCE_LABEL: Record<string, string> = {
  student: "Student",
  billing_contact: "Company billing contact",
};

interface SendValues {
  to: string;
  cc: string;
  receiptNo: string;
}

const SendReceiptForm = ({
  payment,
  preview,
  onManageContacts,
  onClose,
}: {
  payment: ReceiptPayment;
  preview: ReceiptPreview;
  onManageContacts?: () => void;
  onClose: () => void;
}) => {
  const toast = useToast();
  const send = useSendReceipt();
  const numberLocked = !!payment.receiptNo;
  const form = useFormState<SendValues>({
    to: "",
    cc: "",
    receiptNo: payment.receiptNo ?? preview.receiptNo ?? "",
  });
  const { values, setValues, errors, formError } = form;
  const recipient = preview.recipient;
  const canSend = !!recipient || !!values.to.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (send.isPending || !canSend) return;
    const parsed = form.validate(sendReceiptSchema);
    if (!parsed) return;
    if (!numberLocked && !parsed.receiptNo) {
      form.setErrors({ receiptNo: "Receipt number is required" });
      return;
    }
    const body = {
      ...(!numberLocked && parsed.receiptNo
        ? { receiptNo: parsed.receiptNo }
        : {}),
      ...(parsed.to ? { to: parsed.to } : {}),
      ...(parsed.cc.length ? { cc: parsed.cc } : {}),
    };
    try {
      const res = await send.mutateAsync({ paymentId: payment.id, body });
      const to = res.data?.receiptSentTo ?? parsed.to ?? recipient?.email;
      toast.success(
        res.message ||
          `Receipt ${res.data?.receiptNo ?? parsed.receiptNo ?? payment.receiptNo ?? ""} sent${to ? ` to ${to}` : ""}.`,
      );
      onClose();
    } catch (err) {
      // 409 (not received / number used / no recipient) and 502 (email
      // failed) carry a server message; show it inline.
      form.applyServerError(err);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <FormError message={formError} />

      <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Recipient
        </p>
        {recipient ? (
          <>
            <p className="text-sm font-bold text-zinc-900">{recipient.name}</p>
            <p className="text-sm text-zinc-600 break-all">{recipient.email}</p>
            <p className="text-xs text-zinc-500">
              {SOURCE_LABEL[recipient.source] ?? recipient.source}
            </p>
          </>
        ) : (
          <div role="alert" className="space-y-2">
            <p className="text-sm text-amber-800">
              {preview.missingRecipientReason ||
                "There is no recipient for this receipt. Add a billing contact to the company."}
            </p>
            {onManageContacts && (
              <button
                type="button"
                onClick={onManageContacts}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold hover:bg-zinc-100"
              >
                <Users size={14} aria-hidden="true" />
                Manage company contacts
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <Input
          label={recipient ? "Send to (Optional override)" : "Send to"}
          name="to"
          type="email"
          placeholder={recipient?.email ?? "billing@company.com"}
          data={values}
          setData={setValues}
          error={errors.to}
        />
        <p className="text-[11px] text-zinc-500 mt-1">
          {recipient
            ? "Leave empty to send to the recipient above."
            : "Enter an address to send this receipt without a billing contact."}
        </p>
      </div>

      <div>
        <TextArea
          label="CC (Optional)"
          name="cc"
          rows={2}
          placeholder="finance@company.com, hr@company.com"
          data={values}
          setData={setValues}
          error={
            Object.entries(errors).find(
              ([key]) => key === "cc" || key.startsWith("cc."),
            )?.[1]
          }
        />
        <p className="text-[11px] text-zinc-500 mt-1">
          Up to 5 addresses, separated by commas.
        </p>
      </div>

      <div>
        <Input
          label="Receipt number"
          name="receiptNo"
          required={!numberLocked}
          disabled={numberLocked}
          data={values}
          setData={setValues}
          error={errors.receiptNo}
        />
        <p className="text-[11px] text-zinc-500 mt-1">
          {numberLocked
            ? "This payment already has a receipt number; resending reuses it."
            : "Proposed next number. Use the next number after the last manually issued receipt if needed."}
        </p>
      </div>

      <Button
        loading={send.isPending}
        loadingText="Sending..."
        disabled={!canSend}
      >
        {payment.receiptSent ? "Resend receipt" : "Send receipt"}
      </Button>
    </form>
  );
};

/**
 * Send / resend the receipt of a RECEIVED payment:
 * GET  /admin/payments/:id/receipt/preview -> recipient + proposed number
 * POST /admin/payments/:id/receipt { receiptNo?, to?, cc? }
 */
export const SendReceiptModal = ({
  payment,
  onManageContacts,
  onClose,
}: {
  payment: ReceiptPayment;
  /** Opens the payer company's contacts (B2B without billing contact). */
  onManageContacts?: () => void;
  onClose: () => void;
}) => {
  const { preview, isLoading, error, refetch } = useReceiptPreview(payment.id);

  return (
    <Modal
      title={`${payment.receiptSent ? "Resend" : "Send"} receipt - ${payment.paymentId}`}
      onClose={onClose}
    >
      <p className="text-sm text-zinc-600 mb-4">
        Payment of{" "}
        <strong>{formatMoney(payment.amountPaid ?? 0, true, "Nigerian Naira")}</strong>
        . The receipt PDF is attached to the email.
      </p>
      {preview ? (
        <SendReceiptForm
          payment={payment}
          preview={preview}
          onManageContacts={onManageContacts}
          onClose={onClose}
        />
      ) : (
        <div className="py-8 text-center text-sm">
          <StatusContent
            isLoading={isLoading}
            error={error}
            emptyText="Could not load the receipt preview."
            onRetry={() => refetch()}
          />
        </div>
      )}
    </Modal>
  );
};
