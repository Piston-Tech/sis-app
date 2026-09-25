import {
  Button,
  CompanySelector,
  ErrorMsg,
  Input,
  StudentSelector,
} from "@/components/Form";
import Modal from "@/components/Modal";
import FormError from "@/components/admin/FormError";
import { useToast } from "@/components/admin/Toast";
import useTransactionForm from "@/hooks/admin/useTransactionForm";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import { Plus } from "lucide-react";
import SingleEnrollment from "./SingleEnrollment";

/** Create a transaction with its enrollments. */
const TransactionFormModal = ({ onClose }: { onClose: () => void }) => {
  const toast = useToast();
  const {
    values,
    total,
    setPayerType,
    setPayerId,
    setDiscount,
    updateEnrollment,
    addEnrollmentRow,
    removeEnrollmentRow,
    handleSubmit,
    loading,
    errors,
    formError,
  } = useTransactionForm((message) => {
    toast.success(message || "Transaction created.");
    onClose();
  });

  const corporate = values.payerType === "B2B";
  const discount = values.discount ?? 0;

  return (
    <Modal title="Add New Transaction" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />

        <div
          role="radiogroup"
          aria-label="Payer type"
          className="flex gap-4 mb-4"
        >
          {(
            [
              ["B2C", "Individual Student"],
              ["B2B", "Company Payer"],
            ] as const
          ).map(([type, label]) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={values.payerType === type}
              onClick={() => setPayerType(type)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
                values.payerType === type
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-500 border-zinc-100",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {corporate ? (
          <CompanySelector
            key="company"
            value={values.payerId || undefined}
            onChange={setPayerId}
            error={errors.payerId}
          />
        ) : (
          <StudentSelector
            key="student"
            value={values.payerId || undefined}
            onChange={setPayerId}
            error={errors.payerId}
          />
        )}

        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
              Enrollment{corporate && "s"}
            </h3>

            {corporate && (
              <button
                type="button"
                onClick={addEnrollmentRow}
                className="text-[10px] font-bold text-black flex items-center gap-1 hover:underline"
              >
                <Plus size={12} aria-hidden="true" /> Add Student
              </button>
            )}
          </div>
          <ErrorMsg message={errors.enrollments} />

          {values.enrollments.map((enrollment, index) => (
            <SingleEnrollment
              key={enrollment.key}
              index={index}
              enrollment={enrollment}
              corporate={corporate}
              onChange={(patch) => updateEnrollment(enrollment.key, patch)}
              onRemove={
                corporate && values.enrollments.length > 1
                  ? () => removeEnrollmentRow(enrollment.key)
                  : undefined
              }
              errors={errors}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
          <Input
            label="Price (₦)"
            disabled
            value={formatMoney(total, true, "Nigerian Naira")}
          />
          <Input
            label="Discount (₦)"
            type="number"
            name="discount"
            min={0}
            data={values}
            setData={(data) => setDiscount(data.discount)}
            error={errors.discount}
          />
          <Input
            label="Total Due"
            disabled
            className="font-bold"
            value={formatMoney(total - discount, true, "Nigerian Naira")}
          />
        </div>

        <Button
          loading={loading}
          loadingText="Creating..."
          className="py-4 rounded-2xl shadow-lg shadow-black/10"
        >
          Create Transaction & Enrollments
        </Button>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;
