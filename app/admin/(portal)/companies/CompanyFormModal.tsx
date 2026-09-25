import Modal from "@/components/Modal";
import { Button, Input, Select } from "@/components/Form";
import FormError from "@/components/admin/FormError";
import { useToast } from "@/components/admin/Toast";
import { companySchema } from "@/components/admin/schemas";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import { useResourceMutation } from "@/hooks/admin/useResourceMutation";
import { Company } from "@/types";
import { CopyableId } from "@/components/common/CopyButton";
import CompanyContacts from "@/components/admin/CompanyContacts";

const INDUSTRIES = ["IT", "Education", "Oil & Gas"];

const CompanyFormModal = ({
  company,
  onClose,
}: {
  company: Company | null;
  onClose: () => void;
}) => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const form = useFormState({
    name: company?.name ?? "",
    industry: company?.industry ?? "",
  });
  const { values, setValues, errors, formError } = form;
  const { create, update } = useResourceMutation<unknown>("companies");
  const saving = create.isPending || update.isPending;

  // Keep a legacy industry value selectable when editing.
  const industries =
    values.industry && !INDUSTRIES.includes(values.industry)
      ? [...INDUSTRIES, values.industry]
      : INDUSTRIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite || saving) return;
    const payload = form.validate(companySchema);
    if (!payload) return;

    try {
      const res = company
        ? await update.mutateAsync({ id: company.id, body: payload })
        : await create.mutateAsync(payload);
      toast.success(
        res.message || (company ? "Company updated." : "Company created."),
      );
      onClose();
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <Modal
      title={
        company
          ? canWrite
            ? "Edit Company"
            : "Company Details"
          : "Add New Company"
      }
      onClose={onClose}
    >
      {company?.companyId && (
        <p className="mb-4 text-xs text-zinc-500">
          Company ID:{" "}
          <CopyableId
            value={company.companyId}
            label="company ID"
            className="font-mono font-semibold text-zinc-700"
          />
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={formError} />
        <fieldset disabled={!canWrite} className="space-y-4">
          <Input
            label="Name"
            name="name"
            required
            data={values}
            setData={setValues}
            error={errors.name}
          />
          <Select
            label="Industry"
            name="industry"
            required
            options={industries}
            data={values}
            setData={setValues}
            error={errors.industry}
          />
        </fieldset>
        {canWrite && (
          <Button loading={saving}>
            {company ? "Save Changes" : "Create Company"}
          </Button>
        )}
      </form>
      {/* Outside the company form: the contact editor has its own form. */}
      {company && (
        <div className="mt-8 pt-6 border-t border-zinc-100">
          <CompanyContacts companyId={company.id} />
        </div>
      )}
    </Modal>
  );
};

export default CompanyFormModal;
