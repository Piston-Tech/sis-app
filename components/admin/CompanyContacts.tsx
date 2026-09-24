"use client";

import { Button, Input } from "@/components/Form";
import Modal from "@/components/Modal";
import cn from "@/utils/cn";
import {
  AlertTriangle,
  BadgeCheck,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { useId, useState } from "react";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import { useCompanyContacts } from "@/hooks/admin/useCompanyContacts";
import { CompanyContact } from "@/types";
import FormError from "./FormError";
import { companyContactSchema } from "./schemas";
import { StatusContent } from "./TableStatusRow";
import { useToast } from "./Toast";

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  isBilling: boolean;
}

const toValues = (
  contact: CompanyContact | null,
  firstContact: boolean,
): ContactFormValues => ({
  name: contact?.name ?? "",
  email: contact?.email ?? "",
  phone: contact?.phone ?? "",
  jobTitle: contact?.jobTitle ?? "",
  // A sole contact becomes the billing contact automatically.
  isBilling: contact?.isBilling ?? firstContact,
});

/** Add / edit form (inline, not a nested dialog). */
const ContactForm = ({
  companyId,
  contact,
  firstContact,
  onDone,
}: {
  companyId: number;
  contact: CompanyContact | null;
  firstContact: boolean;
  onDone: () => void;
}) => {
  const toast = useToast();
  const checkboxId = useId();
  const { create, update } = useCompanyContacts(companyId);
  const form = useFormState<ContactFormValues>(() =>
    toValues(contact, firstContact),
  );
  const { values, setValues, errors, formError } = form;
  const saving = create.isPending || update.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const parsed = form.validate(companyContactSchema);
    if (!parsed) return;
    const body = {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || null,
      jobTitle: parsed.jobTitle || null,
      isBilling: parsed.isBilling,
    };
    try {
      if (contact) {
        await update.mutateAsync({ contactId: contact.id, body });
        toast.success("Contact updated.");
      } else {
        await create.mutateAsync({
          ...body,
          phone: body.phone ?? undefined,
          jobTitle: body.jobTitle ?? undefined,
        });
        toast.success("Contact added.");
      }
      onDone();
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={contact ? `Edit contact ${contact.name}` : "Add contact"}
      className="space-y-3 p-4 border border-zinc-200 rounded-2xl bg-zinc-50/50"
    >
      <FormError message={formError} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Name"
          name="name"
          required
          autoComplete="off"
          data={values}
          setData={setValues}
          error={errors.name}
        />
        <Input
          label="Job title (Optional)"
          name="jobTitle"
          data={values}
          setData={setValues}
          error={errors.jobTitle}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="off"
          data={values}
          setData={setValues}
          error={errors.email}
        />
        <Input
          label="Phone (Optional)"
          name="phone"
          type="tel"
          data={values}
          setData={setValues}
          error={errors.phone}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id={checkboxId}
          type="checkbox"
          checked={values.isBilling}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, isBilling: e.target.checked }))
          }
        />
        <label htmlFor={checkboxId} className="text-sm text-zinc-700">
          Billing contact (receives payment receipts)
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <Button
          loading={saving}
          className="w-auto mt-0 px-4 py-2 text-sm rounded-xl"
        >
          {contact ? "Save contact" : "Add contact"}
        </Button>
      </div>
    </form>
  );
};

/**
 * Contacts of a company: list, add/edit/delete and "make billing contact".
 * One billing contact per company (the backend unsets the others).
 */
export const CompanyContacts = ({ companyId }: { companyId: number }) => {
  const { canWrite } = useAdminGlobal();
  const toast = useToast();
  const headingId = useId();
  const { contacts, isLoading, error, refetch, update, remove } =
    useCompanyContacts(companyId);

  // undefined = no form, null = add, contact = edit
  const [editing, setEditing] = useState<CompanyContact | null | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const hasBilling = contacts.some((c) => c.isBilling);

  const makeBilling = async (contact: CompanyContact) => {
    setBusyId(contact.id);
    setActionError(null);
    try {
      await update.mutateAsync({
        contactId: contact.id,
        body: { isBilling: true },
      });
      toast.success(`${contact.name} is now the billing contact.`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update contact.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (contact: CompanyContact) => {
    setBusyId(contact.id);
    setActionError(null);
    try {
      await remove.mutateAsync(contact.id);
      toast.success(`Contact ${contact.name} deleted.`);
      setConfirmDelete(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete contact.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3
          id={headingId}
          className="text-xs font-bold text-zinc-900 uppercase tracking-widest"
        >
          Contacts
        </h3>
        {canWrite && editing === undefined && (
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="text-xs font-bold text-black flex items-center gap-1 hover:underline"
          >
            <Plus size={14} aria-hidden="true" /> Add contact
          </button>
        )}
      </div>

      {!isLoading && !error && !hasBilling && (
        <p
          role="note"
          className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-100"
        >
          <AlertTriangle
            size={16}
            className="shrink-0 mt-px"
            aria-hidden="true"
          />
          No billing contact. Receipts for this company&apos;s payments cannot
          be emailed until one is added.
        </p>
      )}

      {actionError && (
        <p role="alert" className="text-sm text-rose-600">
          {actionError}
        </p>
      )}

      {editing === null && (
        <ContactForm
          companyId={companyId}
          contact={null}
          firstContact={contacts.length === 0}
          onDone={() => setEditing(undefined)}
        />
      )}

      {isLoading || error ? (
        <div className="py-4 text-center text-sm">
          <StatusContent
            isLoading={isLoading}
            error={error}
            emptyText=""
            onRetry={() => refetch()}
          />
        </div>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">
          No contacts yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {contacts.map((contact) =>
            editing?.id === contact.id ? (
              <li key={contact.id}>
                <ContactForm
                  companyId={companyId}
                  contact={contact}
                  firstContact={false}
                  onDone={() => setEditing(undefined)}
                />
              </li>
            ) : (
              <li
                key={contact.id}
                className={cn(
                  "p-3 rounded-2xl border space-y-2",
                  contact.isBilling
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-zinc-100 bg-zinc-50",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 flex items-center gap-2 flex-wrap">
                      {contact.name}
                      {contact.isBilling && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          <BadgeCheck size={12} aria-hidden="true" />
                          Billing
                        </span>
                      )}
                    </p>
                    {contact.jobTitle && (
                      <p className="text-xs text-zinc-500">
                        {contact.jobTitle}
                      </p>
                    )}
                  </div>
                  {canWrite && (
                    <div className="flex items-center gap-1">
                      {!contact.isBilling && (
                        <button
                          type="button"
                          disabled={busyId === contact.id}
                          onClick={() => makeBilling(contact)}
                          className="px-2 py-1 text-[11px] font-semibold rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-50"
                        >
                          Make billing contact
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDelete(null);
                          setEditing(contact);
                        }}
                        aria-label={`Edit contact ${contact.name}`}
                        className="p-1.5 text-zinc-400 hover:text-black"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(contact.id)}
                        aria-label={`Delete contact ${contact.name}`}
                        className="p-1.5 text-zinc-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-1 hover:underline break-all"
                  >
                    <Mail size={12} aria-hidden="true" />
                    {contact.email}
                  </a>
                  {contact.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} aria-hidden="true" />
                      {contact.phone}
                    </span>
                  )}
                </div>
                {confirmDelete === contact.id && (
                  <div
                    role="group"
                    aria-label={`Confirm deleting ${contact.name}`}
                    className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200"
                  >
                    <p className="text-xs text-zinc-700">
                      Delete {contact.name}?
                      {contact.isBilling &&
                        " The company will have no billing contact unless another contact is made billing."}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-zinc-200 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={busyId === contact.id}
                        aria-busy={busyId === contact.id || undefined}
                        onClick={() => doDelete(contact)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white disabled:opacity-50"
                      >
                        {busyId === contact.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
};

/** Stand-alone dialog for a company's contacts (e.g. from the receipt flow). */
export const CompanyContactsModal = ({
  companyId,
  companyName,
  onClose,
}: {
  companyId: number;
  companyName?: string;
  onClose: () => void;
}) => (
  <Modal
    title={companyName ? `Contacts - ${companyName}` : "Company contacts"}
    onClose={onClose}
  >
    <CompanyContacts companyId={companyId} />
  </Modal>
);

export default CompanyContacts;
