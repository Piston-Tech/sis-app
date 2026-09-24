import Modal from "@/components/Modal";
import { Button, CompanySelector, Input, Select } from "@/components/Form";
import FormError from "@/components/admin/FormError";
import { useToast } from "@/components/admin/Toast";
import { studentSchema, StudentInput } from "@/components/admin/schemas";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";
import { Student } from "@/types";
import { PERSONAS } from "@/constants/profile";

// Stored values are the persona codes the student onboarding writes
const PERSONA_OPTIONS = PERSONAS.map(({ value, label }) => ({ value, title: label }));

// Older admin edits stored the label ("Career Ascend"); map it to its code
const toPersonaCode = (persona?: string | null) =>
  PERSONAS.find(
    (option) =>
      option.value === persona ||
      option.label.toLowerCase() === persona?.toLowerCase(),
  )?.value ?? persona ?? "";
const TIER_OPTIONS = ["BASIC", "PRO", "ELITE"];

const toFormValues = (student: Student | null): StudentInput => ({
  prefix: student?.prefix ?? "",
  firstName: student?.firstName ?? "",
  middleName: student?.middleName ?? "",
  lastName: student?.lastName ?? "",
  email: student?.email ?? "",
  phone: student?.phone ?? "",
  companyId: student?.companyId ?? null,
  membershipTier: student?.membershipTier ?? "",
  persona: toPersonaCode(student?.persona),
});

const StudentFormModal = ({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const form = useFormState<StudentInput>(() => toFormValues(student));
  const { values, setValues, errors, formError } = form;
  const { create, update } = useResourceMutation<unknown>("students");
  const saving = create.isPending || update.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || saving) return;
    const parsed = form.validate(studentSchema);
    if (!parsed) return;
    // Only send companyId: null when removing an existing company link.
    const { companyId, ...rest } = parsed;
    const payload =
      companyId !== null || student?.companyId ? { ...rest, companyId } : rest;

    try {
      const res = student
        ? await update.mutateAsync({ id: student.id, body: payload })
        : await create.mutateAsync(payload);
      toast.success(
        res.message || (student ? "Student updated." : "Student created."),
      );
      onClose();
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <Modal
      title={
        student
          ? canWrite
            ? "Edit Student"
            : "Student Details"
          : "Add New Student"
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />
        <fieldset disabled={!canWrite} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prefix (Optional)"
              name="prefix"
              data={values}
              setData={setValues}
              error={errors.prefix}
            />
            <Input
              label="First Name"
              name="firstName"
              required
              data={values}
              setData={setValues}
              error={errors.firstName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Middle Name (Optional)"
              name="middleName"
              data={values}
              setData={setValues}
              error={errors.middleName}
            />
            <Input
              label="Last Name"
              name="lastName"
              required
              data={values}
              setData={setValues}
              error={errors.lastName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              data={values}
              setData={setValues}
              error={errors.email}
            />
            <Input
              label="Phone Number (Optional)"
              name="phone"
              type="tel"
              data={values}
              setData={setValues}
              error={errors.phone}
            />
          </div>
          <CompanySelector
            label="Company (Optional - leave empty for individuals)"
            value={values.companyId ?? undefined}
            onChange={(companyId) =>
              setValues((prev) => ({ ...prev, companyId }))
            }
            disabled={!canWrite}
            error={errors.companyId}
          />
          {values.companyId ? (
            <button
              type="button"
              onClick={() =>
                setValues((prev) => ({ ...prev, companyId: null }))
              }
              className="text-xs font-semibold text-zinc-500 hover:text-black underline"
            >
              Remove company (make individual)
            </button>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Membership Tier (Optional)"
              name="membershipTier"
              options={TIER_OPTIONS}
              data={values}
              setData={setValues}
              error={errors.membershipTier}
            />
            <Select
              label="Persona (Optional)"
              name="persona"
              options={PERSONA_OPTIONS}
              data={values}
              setData={setValues}
              error={errors.persona}
            />
          </div>
        </fieldset>
        {canWrite && (
          <Button loading={saving}>
            {student ? "Save Changes" : "Create Student"}
          </Button>
        )}
      </form>
    </Modal>
  );
};

export default StudentFormModal;
