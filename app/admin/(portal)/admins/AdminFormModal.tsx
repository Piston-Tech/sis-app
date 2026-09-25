"use client";

import { useState } from "react";
import { KeyRound, LogOut, Mail, Power, TriangleAlert } from "lucide-react";
import Modal from "@/components/Modal";
import { Button, Input, Select } from "@/components/Form";
import FormError from "@/components/admin/FormError";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/Toast";
import { adminAccountSchema } from "@/components/admin/schemas";
import { describeActivity, formatDateTime } from "@/components/admin/adminFormat";
import CopyButton from "@/components/common/CopyButton";
import { useAdminGlobal } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import { useResource } from "@/hooks/admin/useResource";
import { useAdminMutation } from "@/hooks/admin/useResourceMutation";
import type { ManagedAdmin } from "@/types/AdminDetails";
import { ACCESS_LEVEL_LABELS } from "@/utils/adminAccess";
import { AccessBadge, StatusBadge } from "./AdminBadges";

const ACCESS_OPTIONS = [
  { value: "viewer", title: `${ACCESS_LEVEL_LABELS.viewer}: can look, can't change anything` },
  { value: "admin", title: `${ACCESS_LEVEL_LABELS.admin}: can add and edit records` },
  { value: "superadmin", title: `${ACCESS_LEVEL_LABELS.superadmin}: can also manage admins` },
];

type Action = "reset-link" | "temporary-password" | "sign-out" | "deactivate" | "reactivate";

const CONFIRM: Record<
  Action,
  { title: string; label: string; destructive?: boolean; message: (email: string) => string }
> = {
  "reset-link": {
    title: "Send a reset link?",
    label: "Send link",
    message: (email) =>
      `We'll email ${email} a link to choose a new password. It works once and expires in 1 hour. Their current password keeps working until they use it.`,
  },
  "temporary-password": {
    title: "Set a temporary password?",
    label: "Set temporary password",
    destructive: true,
    message: (email) =>
      `Use this when ${email} can't get email. Their current password stops working, they're signed out everywhere, and they'll have to choose a new password when they sign in. You'll see the temporary password once.`,
  },
  "sign-out": {
    title: "Sign out everywhere?",
    label: "Sign out",
    destructive: true,
    message: (email) =>
      `${email} will be signed out on every device straight away. Their password doesn't change.`,
  },
  deactivate: {
    title: "Deactivate this account?",
    label: "Deactivate",
    destructive: true,
    message: (email) =>
      `${email} will be signed out straight away and won't be able to sign in or reset their password. Their history is kept, and you can reactivate the account later.`,
  },
  reactivate: {
    title: "Reactivate this account?",
    label: "Reactivate",
    message: (email) =>
      `${email} will be able to sign in again with their existing password (or send them a reset link).`,
  },
};

// Creating an admin and sending a reset link wait for the email to go out
const EMAIL_TIMEOUT_MS = 45_000;

const toFormValues = (admin?: ManagedAdmin | null) => ({
  firstName: admin?.firstName ?? "",
  lastName: admin?.lastName ?? "",
  email: admin?.email ?? "",
  role: admin?.role ?? "",
  accessLevel: admin?.accessLevel ?? "admin",
});

const DetailsForm = ({
  admin,
  isSelf,
  onSaved,
}: {
  admin: ManagedAdmin | null;
  isSelf: boolean;
  onSaved: (message: string) => void;
}) => {
  const form = useFormState(() => toFormValues(admin));
  const { values, setValues, errors, formError } = form;

  const save = useAdminMutation<Record<string, unknown>, ManagedAdmin>(
    (body) =>
      admin
        ? { method: "put", url: `/admin/admins/${admin.id}`, body }
        : { method: "post", url: "/admin/admins", body },
    { invalidate: ["admins"], timeout: EMAIL_TIMEOUT_MS },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (save.isPending) return;
    const payload = form.validate(adminAccountSchema);
    if (!payload) return;
    // Your own access level can't change (the backend refuses it too)
    const body = isSelf ? { ...payload, accessLevel: undefined } : payload;
    try {
      const res = await save.mutateAsync(body);
      onSaved(res.message || (admin ? "Admin updated." : "Admin created."));
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormError message={formError} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First name" name="firstName" required data={values} setData={setValues} error={errors.firstName} />
        <Input label="Last name" name="lastName" required data={values} setData={setValues} error={errors.lastName} />
      </div>
      <Input label="Email" name="email" type="email" required data={values} setData={setValues} error={errors.email} />
      <Input
        label="Department (optional)"
        name="role"
        placeholder="e.g. CBA, OPS, Front Desk"
        data={values}
        setData={setValues}
        error={errors.role}
      />
      <Select
        label="Access"
        name="accessLevel"
        required
        options={ACCESS_OPTIONS}
        placeholder="Choose access"
        disabled={isSelf}
        data={values}
        setData={setValues}
        error={errors.accessLevel}
      />
      {isSelf && (
        <p className="text-xs text-zinc-500">
          You can&apos;t change your own access. Another super admin can.
        </p>
      )}
      {!admin && (
        <p className="text-xs text-zinc-500">
          We&apos;ll email them an invitation to set their own password (the link
          lasts 72 hours).
        </p>
      )}
      <Button loading={save.isPending}>{admin ? "Save changes" : "Create and send invitation"}</Button>
    </form>
  );
};

const SecurityActions = ({
  admin,
  onDone,
}: {
  admin: ManagedAdmin;
  onDone: (message: string) => void;
}) => {
  const [pending, setPending] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  const run = useAdminMutation<Action, { temporaryPassword?: string }>(
    (action) =>
      action === "deactivate" || action === "reactivate"
        ? { method: "put", url: `/admin/admins/${admin.id}`, body: { isActive: action === "reactivate" } }
        : { method: "post", url: `/admin/admins/${admin.id}/${action}` },
    { invalidate: ["admins"], timeout: EMAIL_TIMEOUT_MS },
  );

  const confirm = async () => {
    if (!pending) return;
    setActionError(null);
    try {
      const res = await run.mutateAsync(pending);
      if (pending === "temporary-password" && res.data?.temporaryPassword) {
        setTemporaryPassword(res.data.temporaryPassword);
      }
      onDone(res.message || "Done.");
      setPending(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const active = admin.isActive !== false;
  const actionButton = (action: Action, label: string, Icon: typeof Mail, tone = "text-zinc-800") => (
    <button
      type="button"
      onClick={() => {
        setActionError(null);
        setPending(action);
      }}
      className={`flex items-center gap-3 w-full rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm font-semibold hover:bg-zinc-50 transition-colors ${tone}`}
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </button>
  );

  return (
    <section aria-labelledby="admin-security-heading" className="space-y-3">
      <h3 id="admin-security-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-700">
        Password &amp; access
      </h3>

      {temporaryPassword && (
        <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-amber-900">Temporary password (shown once)</p>
          <div className="flex items-center gap-2">
            <code className="rounded-lg bg-white px-3 py-2 font-mono text-base tracking-wider text-zinc-900 border border-amber-200 select-all">
              {temporaryPassword}
            </code>
            <CopyButton value={temporaryPassword} label="temporary password" size={16} />
          </div>
          <p className="text-xs text-amber-900">
            Share it in person or by phone, not by email or chat. They&apos;ll be asked to choose
            their own password as soon as they sign in.
          </p>
        </div>
      )}

      {active ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actionButton("reset-link", "Email a reset link", Mail)}
          {actionButton("temporary-password", "Set a temporary password", KeyRound)}
          {actionButton("sign-out", "Sign out everywhere", LogOut)}
          {actionButton("deactivate", "Deactivate account", Power, "text-rose-700")}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm text-zinc-600">
            <TriangleAlert size={16} className="text-rose-600" aria-hidden="true" />
            This account is deactivated: they can&apos;t sign in.
          </p>
          {actionButton("reactivate", "Reactivate account", Power, "text-emerald-700")}
        </div>
      )}

      {pending && (
        <ConfirmDialog
          title={CONFIRM[pending].title}
          message={CONFIRM[pending].message(admin.email)}
          confirmLabel={CONFIRM[pending].label}
          destructive={CONFIRM[pending].destructive}
          loading={run.isPending}
          error={actionError}
          onConfirm={confirm}
          onCancel={() => setPending(null)}
        />
      )}
    </section>
  );
};

const Activity = ({ admin }: { admin: ManagedAdmin }) => {
  const entries = admin.activity ?? [];
  return (
    <section aria-labelledby="admin-activity-heading" className="space-y-3">
      <h3 id="admin-activity-heading" className="text-sm font-bold uppercase tracking-wider text-zinc-700">
        Recent activity
      </h3>
      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">No account changes recorded yet.</p>
      ) : (
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
              <span className="text-zinc-900">
                {describeActivity(entry)}
                {entry.actor && entry.actor.id !== admin.id && (
                  <span className="text-zinc-500"> by {entry.actor.name}</span>
                )}
              </span>
              <time dateTime={entry.createdAt} className="text-xs text-zinc-500 whitespace-nowrap">
                {formatDateTime(entry.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

/** Create an admin (adminId null) or manage an existing one */
const AdminFormModal = ({ adminId, onClose }: { adminId: number | null; onClose: () => void }) => {
  const { currentUser } = useAdminGlobal();
  const toast = useToast();
  const { data: admin, isLoading, error, refetch } = useResource<ManagedAdmin>("admins", adminId);
  const isSelf = !!adminId && adminId === currentUser?.id;

  if (adminId && !admin) {
    return (
      <Modal title="Admin" onClose={onClose}>
        <p role="status" className="text-sm text-zinc-500">
          {isLoading ? "Loading..." : error?.message}
        </p>
        {error && (
          <button type="button" onClick={() => refetch()} className="mt-4 text-sm font-semibold underline">
            Try again
          </button>
        )}
      </Modal>
    );
  }

  return (
    <Modal title={admin ? "Manage Admin" : "Add Admin"} onClose={onClose}>
      {admin && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <AccessBadge level={admin.accessLevel} />
          <StatusBadge admin={admin} />
          <span>Last signed in: {formatDateTime(admin.lastLoginAt)}</span>
          <span>· Password changed: {formatDateTime(admin.passwordChangedAt)}</span>
        </div>
      )}
      <DetailsForm
        admin={admin ?? null}
        isSelf={isSelf}
        onSaved={(message) => {
          toast.success(message);
          if (!admin) onClose();
        }}
      />
      {admin && (
        <div className="mt-8 pt-6 border-t border-zinc-100 space-y-8">
          {isSelf ? (
            <p className="text-sm text-zinc-600">
              This is your account. Change your password from My Account.
            </p>
          ) : (
            <SecurityActions admin={admin} onDone={(message) => toast.success(message)} />
          )}
          <Activity admin={admin} />
        </div>
      )}
    </Modal>
  );
};

export default AdminFormModal;
