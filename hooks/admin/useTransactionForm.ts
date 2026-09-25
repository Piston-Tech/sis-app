import { CreateEnrollmentData, SelectedClassSearch } from "@/types";
import { useCallback, useMemo } from "react";
import { transactionSchema } from "@/components/admin/schemas";
import { useFormState } from "./useFormState";
import { useResourceMutation } from "./useResourceMutation";

export type EnrollmentRow = CreateEnrollmentData & {
  /** Stable React key for the row. */
  key: number;
  subTotal: number;
  selectedClass?: SelectedClassSearch;
};

type PayerType = "B2C" | "B2B";

let rowKey = 0;
const newRow = (): EnrollmentRow => ({
  key: ++rowKey,
  studentId: 0,
  classId: 0,
  cba: "",
  delivery: "Hybrid",
  tierId: 1,
  status: "PROCESSING",
  subTotal: 0,
});

interface TransactionFormValues {
  payerType: PayerType;
  payerId: number;
  discount: number | null;
  enrollments: EnrollmentRow[];
}

/** Price of the chosen class for the chosen tier (0 if unknown). */
export const priceFor = (
  selectedClass: SelectedClassSearch | undefined,
  tierId: number,
) => {
  const plan = selectedClass?.course?.prices?.find((p) => p.tierId === tierId);
  const price = plan ? parseFloat(plan.price) : 0;
  return Number.isFinite(price) ? price : 0;
};

/**
 * New transaction with its enrollments:
 * POST /admin/transactions
 * { payerType, payerId, total, discount, enrollments: [{ studentId, classId,
 *   cba, delivery, tierId, status }] }
 * For B2C payers every enrollment's studentId is the payer.
 */
const useTransactionForm = (onSaved: (message?: string) => void) => {
  const form = useFormState<TransactionFormValues>(() => ({
    payerType: "B2C",
    payerId: 0,
    discount: 0,
    enrollments: [newRow()],
  }));
  const { values, setValues } = form;
  const { create } = useResourceMutation<unknown>("transactions", {
    alsoInvalidate: ["enrollments", "classes"],
  });

  const total = useMemo(
    () => values.enrollments.reduce((sum, e) => sum + (e.subTotal || 0), 0),
    [values.enrollments],
  );

  const setPayerType = useCallback(
    (payerType: PayerType) =>
      setValues((prev) =>
        prev.payerType === payerType
          ? prev
          : { ...prev, payerType, payerId: 0, enrollments: [newRow()] },
      ),
    [setValues],
  );

  const setPayerId = useCallback(
    (payerId: number) => setValues((prev) => ({ ...prev, payerId })),
    [setValues],
  );

  const setDiscount = useCallback(
    (discount: number | null) => setValues((prev) => ({ ...prev, discount })),
    [setValues],
  );

  /** Merges a patch into one row and recomputes its subtotal. */
  const updateEnrollment = useCallback(
    (key: number, patch: Partial<EnrollmentRow>) =>
      setValues((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((row) => {
          if (row.key !== key) return row;
          const next = { ...row, ...patch };
          return {
            ...next,
            subTotal: priceFor(next.selectedClass, next.tierId),
          };
        }),
      })),
    [setValues],
  );

  const addEnrollmentRow = useCallback(
    () =>
      setValues((prev) => ({
        ...prev,
        enrollments: [...prev.enrollments, newRow()],
      })),
    [setValues],
  );

  const removeEnrollmentRow = useCallback(
    (key: number) =>
      setValues((prev) =>
        prev.enrollments.length <= 1
          ? prev
          : {
              ...prev,
              enrollments: prev.enrollments.filter((r) => r.key !== key),
            },
      ),
    [setValues],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (create.isPending) return;

    const input = {
      payerType: values.payerType,
      payerId: values.payerId,
      total,
      discount: values.discount ?? 0,
      enrollments: values.enrollments.map((row) => ({
        studentId: values.payerType === "B2C" ? values.payerId : row.studentId,
        classId: row.classId,
        cba: row.cba,
        delivery: row.delivery,
        tierId: row.tierId,
        status: row.status,
      })),
    };
    const payload = form.validate(transactionSchema, input);
    if (!payload) return;

    try {
      const res = await create.mutateAsync(payload);
      onSaved(res.message);
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return {
    values,
    total,
    setPayerType,
    setPayerId,
    setDiscount,
    updateEnrollment,
    addEnrollmentRow,
    removeEnrollmentRow,
    handleSubmit,
    loading: create.isPending,
    errors: form.errors,
    formError: form.formError,
  };
};

export default useTransactionForm;
