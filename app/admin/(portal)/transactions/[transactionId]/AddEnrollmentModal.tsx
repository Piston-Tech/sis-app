import { useState } from "react";
import {
  Button,
  ClassSelector,
  Select,
  StudentSelector,
} from "@/components/Form";
import Modal from "@/components/Modal";
import FormError from "@/components/admin/FormError";
import { useToast } from "@/components/admin/Toast";
import { addEnrollmentSchema } from "@/components/admin/schemas";
import { useFormState } from "@/hooks/admin/useFormState";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";
import { SelectedClassSearch } from "@/types";
import { CBA_OPTIONS, DELIVERY_OPTIONS } from "../SingleEnrollment";

/**
 * Adds an enrollment to an existing transaction:
 * POST /admin/enrollments
 * { transactionId, studentId, classId, cba, delivery, tierId, status }.
 */
const AddEnrollmentModal = ({
  close,
  transactionId,
  studentId,
}: {
  close: () => void;
  transactionId: number;
  /** Fixed student for B2C transactions. */
  studentId: number | undefined;
}) => {
  const toast = useToast();
  const form = useFormState({
    transactionId,
    studentId: studentId ?? 0,
    classId: 0,
    cba: "",
    delivery: "Hybrid",
    tierId: 0,
    status: "PROCESSING",
  });
  const { values, setValues, errors, formError } = form;
  const [selectedClass, setSelectedClass] = useState<SelectedClassSearch>();
  const { create } = useResourceMutation<unknown>("enrollments", {
    alsoInvalidate: ["transactions", "classes"],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (create.isPending) return;
    const payload = form.validate(addEnrollmentSchema);
    if (!payload) return;
    try {
      const res = await create.mutateAsync(payload);
      toast.success(res.message || "Enrollment added.");
      close();
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <Modal title="Add Enrollment" onClose={close}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />
        <StudentSelector
          disabled={studentId !== undefined}
          value={values.studentId || undefined}
          onChange={(id) => setValues((prev) => ({ ...prev, studentId: id }))}
          error={errors.studentId}
        />
        <ClassSelector
          value={values.classId || undefined}
          onChange={(data) => {
            setValues((prev) => ({ ...prev, classId: data.id, tierId: 0 }));
            setSelectedClass(data);
          }}
          error={errors.classId}
        />
        <Select
          label="Plan"
          required
          name="tierId"
          data={values}
          error={errors.tierId}
          placeholder={selectedClass ? "- Select -" : "Select a class first"}
          options={
            selectedClass?.course?.prices?.map((p) => ({
              value: p.tierId,
              title: p.tier?.name ?? `Tier ${p.tierId}`,
            })) ?? []
          }
          setData={(data) =>
            setValues((prev) => ({
              ...prev,
              tierId: data.tierId ? parseInt(data.tierId, 10) : 0,
            }))
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="CBA"
            required
            name="cba"
            data={values}
            error={errors.cba}
            options={CBA_OPTIONS}
            setData={(data) =>
              setValues((prev) => ({ ...prev, cba: data.cba }))
            }
          />
          <Select
            label="Delivery"
            required
            name="delivery"
            data={values}
            error={errors.delivery}
            options={DELIVERY_OPTIONS}
            setData={(data) =>
              setValues((prev) => ({ ...prev, delivery: data.delivery }))
            }
          />
        </div>
        <Button loading={create.isPending}>Add Enrollment</Button>
      </form>
    </Modal>
  );
};

export default AddEnrollmentModal;
