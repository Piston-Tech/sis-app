import { StudentSelector } from "@/components/Form";
import CompanySelector from "@/components/Form/CompanySelector";
import Modal from "@/components/Modal";
import useTransactionForm from "@/hooks/useTransactionForm";
import { CreateEnrollmentData, Transaction } from "@/types";
import cn from "@/utils/cn";
import formatMoney from "@/utils/formatMoney";
import { Plus } from "lucide-react";
import SingleEnrollment from "./SingleEnrollment";

const TransactionFormModal = ({
  transaction,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) => {
  const {
    formData,
    setFormData,
    setEnrollment,
    addEnrollmentRow,
    removeEnrollmentRow,
    subTotals,
    setSubTotal,
    loading,
    handleSubmit,
    errors,
  } = useTransactionForm(transaction, onClose);

  return (
    <Modal
      title={transaction ? "Edit Transaction" : "Add New Transaction"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, payerType: "B2C", payerId: 0 })
            }
            disabled={transaction !== null}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
              formData.payerType === "B2C"
                ? "bg-black text-white border-black"
                : "bg-white text-zinc-500 border-zinc-100",
            )}
          >
            Individual Student
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, payerType: "B2B", payerId: 0 })
            }
            disabled={transaction !== null}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold border transition-all",
              formData.payerType === "B2B"
                ? "bg-black text-white border-black"
                : "bg-white text-zinc-500 border-zinc-100",
            )}
          >
            Company Payer
          </button>
        </div>

        <div className="gap-4">
          {formData.payerType === "B2C" ? (
            <StudentSelector
              value={formData.payerId}
              onChange={(payerId) => setFormData({ ...formData, payerId })}
              error={errors.payerId}
            />
          ) : (
            <CompanySelector
              value={formData.payerId}
              onChange={(payerId) => setFormData({ ...formData, payerId })}
              error={errors.payerId}
            />
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
              Enrollment{formData.payerType === "B2B" && "s"}
            </h3>

            {formData.payerType === "B2B" && (
              <button
                type="button"
                onClick={addEnrollmentRow}
                className="text-[10px] font-bold text-black flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Add Student
              </button>
            )}
          </div>

          {formData.enrollments.map((enrollment, index) => (
            <SingleEnrollment
              key={index}
              enrollment={enrollment}
              setEnrollment={(data: CreateEnrollmentData) =>
                setEnrollment(data, index)
              }
              remove={
                formData.payerType === "B2B" && index > 0
                  ? () => removeEnrollmentRow(index)
                  : () => alert("At least one enrollment is required")
              }
              corporate={formData.payerType === "B2B"}
              subTotal={subTotals[index]}
              setSubTotal={(total: number) => setSubTotal(total, index)}
              errors={errors.enrollments ? errors.enrollments[index] : undefined}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Price (#)
            </label>
            <input
              required
              type="text"
              disabled
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formatMoney(formData.total, true, "Nigerian Naira")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Discount
            </label>
            <input
              required
              type="number"
              className="w-full px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm"
              value={formData.discount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Total Due
            </label>
            <input
              required
              disabled
              type="text"
              className="w-full px-4 py-2 bg-zinc-100 border border-zinc-100 rounded-xl text-sm font-bold"
              // value={formData.total_due}
              value={formatMoney(
                formData.discount ? formData.total - formData.discount : formData.total,
                true,
                "Nigerian Naira",
              )}
              readOnly
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-black text-white rounded-2xl font-bold mt-4 shadow-lg shadow-black/10 hover:bg-zinc-800 transition-all"
        >
          {loading
            ? "Creating..."
            : (transaction ? "Update" : "Create") + "Transaction & Enrollments"}
        </button>
      </form>
    </Modal>
  );
};

export default TransactionFormModal;
