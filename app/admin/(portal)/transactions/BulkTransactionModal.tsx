"use client";

import { CompanySelector, Input, StudentSelector } from "@/components/Form";
import BulkImportModal from "@/components/admin/BulkImportModal";
import { useToast } from "@/components/admin/Toast";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BulkResponse } from "@/types/BulkImport";

const naira = (v: number | string | undefined | null) =>
  formatMoney(v ?? 0, true, "Nigerian Naira");

const INVALIDATE = ["transactions", "enrollments", "students", "classes"] as const;

const ENROLLMENT_HELP = (
  <p>
    One row per enrollment. Identify existing students by{" "}
    <code className="font-mono">studentId</code> (STD code) or{" "}
    <code className="font-mono">email</code>; unknown students with{" "}
    <code className="font-mono">firstName</code>,{" "}
    <code className="font-mono">lastName</code> and{" "}
    <code className="font-mono">email</code> are created. The whole file is
    imported only if every row is valid.
  </p>
);

/**
 * New transaction from a spreadsheet:
 * POST /admin/transactions/bulk
 * { payerType, payerId, discount?, nextPaymentDate?, rows, dryRun? }
 */
export const BulkTransactionModal = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const toast = useToast();
  const [payerType, setPayerType] = useState<"B2B" | "B2C">("B2B");
  const [payerId, setPayerId] = useState<number | undefined>();
  const [settings, setSettings] = useState<{
    discount: number | null;
    nextPaymentDate: Date | null;
  }>({ discount: null, nextPaymentDate: null });

  const discount = settings.discount ?? 0;
  const discountError =
    settings.discount !== null && settings.discount < 0
      ? "Discount cannot be negative"
      : null;

  const extraBody = useMemo(() => {
    if (!payerId || discountError) return null;
    return {
      payerType,
      payerId,
      ...(discount > 0 ? { discount } : {}),
      ...(settings.nextPaymentDate
        ? { nextPaymentDate: settings.nextPaymentDate.toISOString() }
        : {}),
    };
  }, [payerType, payerId, discount, discountError, settings.nextPaymentDate]);

  const renderSummaryExtra = (result: BulkResponse, phase: string) => {
    const total = result.transaction?.total ?? result.computedTotal;
    if (total === undefined || total === null) return null;
    return (
      <p
        className={cn(
          "p-3 rounded-xl text-sm border",
          result.success === false
            ? "bg-zinc-50 border-zinc-100 text-zinc-600"
            : "bg-emerald-50 border-emerald-100 text-emerald-900",
        )}
      >
        {phase === "dryRun" ? "Invoice total will be " : "Invoice total: "}
        <strong>{naira(total)}</strong>
        {discount > 0 && (
          <>
            {" "}
            - {naira(discount)} discount = <strong>{naira(Number(total) - discount)}</strong>{" "}
            due
          </>
        )}
        . This is the price list total of the imported enrollments.
      </p>
    );
  };

  return (
    <BulkImportModal
      kind="enrollments"
      title="Bulk upload transaction"
      description={ENROLLMENT_HELP}
      endpoint="/admin/transactions/bulk"
      allOrNothing
      extraBody={extraBody}
      settingsHint={
        discountError ?? `Select the ${payerType === "B2B" ? "company" : "student"} paying first.`
      }
      invalidate={[...INVALIDATE]}
      renderSummaryExtra={renderSummaryExtra}
      onImported={(result) => {
        const code = result.transaction?.transactionId;
        toast.success(
          `Transaction ${code ?? ""} created with ${result.summary?.enrollments ?? result.rows?.length ?? 0} enrollments.`,
        );
        if (code) {
          onClose();
          router.push(`/transactions/${encodeURIComponent(code)}`);
        }
      }}
      onClose={onClose}
      settings={
        <div className="space-y-4">
          <div
            role="radiogroup"
            aria-label="Payer type"
            className="flex gap-4"
          >
            {(
              [
                ["B2B", "Company Payer"],
                ["B2C", "Individual Student"],
              ] as const
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={payerType === type}
                onClick={() => {
                  if (type === payerType) return;
                  setPayerType(type);
                  setPayerId(undefined);
                }}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                  payerType === type
                    ? "bg-black text-white border-black"
                    : "bg-white text-zinc-500 border-zinc-100",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {payerType === "B2B" ? (
            <CompanySelector
              key="company"
              label="Paying company"
              value={payerId}
              onChange={setPayerId}
            />
          ) : (
            <StudentSelector
              key="student"
              label="Paying student"
              value={payerId}
              onChange={setPayerId}
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Discount (₦, Optional)"
              type="number"
              name="discount"
              min={0}
              step="0.01"
              data={settings}
              setData={setSettings}
              error={discountError}
            />
            <Input
              label="Next payment date (Optional)"
              type="date"
              name="nextPaymentDate"
              data={settings}
              setData={setSettings}
            />
          </div>
          {payerType === "B2B" && (
            <p className="text-xs text-zinc-500">
              New students in the file are linked to the paying company.
            </p>
          )}
        </div>
      }
    />
  );
};

const NO_EXTRA = {};

/**
 * More enrollments on an existing transaction:
 * POST /admin/transactions/:id/enrollments/bulk { rows, dryRun? }.
 * The stored invoice total is not changed.
 */
export const BulkEnrollmentsModal = ({
  transaction,
  onClose,
}: {
  transaction: { id: number; transactionId: string; total?: number };
  onClose: () => void;
}) => {
  const toast = useToast();

  const renderSummaryExtra = (result: BulkResponse, phase: string) => {
    if (result.computedTotal === undefined || result.computedTotal === null)
      return null;
    const diff = Number(result.priceDifference ?? 0);
    return (
      <p className="p-3 rounded-xl text-sm border bg-sky-50 border-sky-100 text-sky-900">
        {phase === "dryRun"
          ? "After this import the price list total would be "
          : "Price list total is now "}
        <strong>{naira(result.computedTotal)}</strong>
        {diff !== 0 && (
          <>
            {" "}
            ({naira(Math.abs(diff))} {diff > 0 ? "more" : "less"} than the
            invoice total)
          </>
        )}
        . The invoice total
        {transaction.total !== undefined ? ` (${naira(transaction.total)})` : ""}{" "}
        is not changed by the import; update it on the transaction page if
        needed.
      </p>
    );
  };

  return (
    <BulkImportModal
      kind="enrollments"
      title={`Add enrollments in bulk - ${transaction.transactionId}`}
      description={ENROLLMENT_HELP}
      endpoint={`/admin/transactions/${encodeURIComponent(String(transaction.id))}/enrollments/bulk`}
      allOrNothing
      extraBody={NO_EXTRA}
      invalidate={[...INVALIDATE]}
      renderSummaryExtra={renderSummaryExtra}
      onImported={(result) =>
        toast.success(
          `${result.summary?.enrollments ?? result.rows?.length ?? 0} enrollments added to ${transaction.transactionId}.`,
        )
      }
      onClose={onClose}
    />
  );
};
