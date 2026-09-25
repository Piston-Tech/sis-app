import {
  ClassSelector,
  Input,
  Select,
  StudentSelector,
} from "@/components/Form";
import { EnrollmentRow } from "@/hooks/admin/useTransactionForm";
import formatMoney from "@/utils/formatMoney";
import { Trash2 } from "lucide-react";

export const CBA_OPTIONS = ["PA", "PC", "PA-D", "PA-G"];
export const DELIVERY_OPTIONS = ["Hybrid", "Classroom", "Virtual"];

const SingleEnrollment = ({
  index,
  corporate,
  enrollment,
  onChange,
  onRemove,
  errors,
}: {
  index: number;
  corporate: boolean;
  enrollment: EnrollmentRow;
  onChange: (patch: Partial<EnrollmentRow>) => void;
  /** Omit when the row cannot be removed (e.g. the only enrollment). */
  onRemove?: () => void;
  errors: Record<string, string>;
}) => {
  const err = (field: string) => errors[`enrollments.${index}.${field}`];

  return (
    <div
      role="group"
      aria-label={`Enrollment ${index + 1}`}
      className="flex flex-col p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4"
    >
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove enrollment ${index + 1}`}
          className="relative -mb-4 self-end z-10 text-neutral-400 hover:text-red-500 transition-colors duration-100 cursor-pointer"
          onClick={onRemove}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      )}
      <div className="grid grid-cols-1 gap-4">
        {corporate && (
          <StudentSelector
            value={enrollment.studentId || undefined}
            onChange={(studentId) => onChange({ studentId })}
            error={err("studentId")}
          />
        )}
        <ClassSelector
          value={enrollment.classId || undefined}
          onChange={(selectedClass) =>
            onChange({ classId: selectedClass.id, selectedClass })
          }
          error={err("classId")}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Select
          label="Plan"
          required
          name="tierId"
          data={enrollment}
          error={err("tierId")}
          placeholder={
            enrollment.selectedClass ? "- Select -" : "Select a class first"
          }
          options={
            enrollment.selectedClass?.course?.prices?.map((p) => ({
              value: p.tierId,
              title: p.tier?.name ?? `Tier ${p.tierId}`,
            })) ?? []
          }
          setData={(data) =>
            onChange({ tierId: data.tierId ? parseInt(data.tierId, 10) : 0 })
          }
        />
        <Select
          label="CBA"
          required
          name="cba"
          data={enrollment}
          error={err("cba")}
          options={CBA_OPTIONS}
          setData={(data) => onChange({ cba: data.cba })}
        />
        <Select
          label="Delivery"
          required
          name="delivery"
          data={enrollment}
          error={err("delivery")}
          options={DELIVERY_OPTIONS}
          setData={(data) => onChange({ delivery: data.delivery })}
        />
      </div>
      <Input
        disabled
        value={
          enrollment.subTotal
            ? formatMoney(enrollment.subTotal, true, "Nigerian Naira")
            : ""
        }
        label="Subtotal"
        placeholder={formatMoney(0, true, "Nigerian Naira")}
      />
    </div>
  );
};

export default SingleEnrollment;
