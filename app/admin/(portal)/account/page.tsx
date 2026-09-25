"use client";

import { AlertTriangle, KeyRound, UserRound } from "lucide-react";
import Card from "@/components/Card";
import { Button, Input } from "@/components/Form";
import FormError from "@/components/admin/FormError";
import PageHeader from "@/components/admin/PageHeader";
import { useToast } from "@/components/admin/Toast";
import { adminProfileSchema } from "@/components/admin/schemas";
import {
  PasswordChecklist,
  passwordFields,
  passwordsMatch,
  passwordsMatchError,
} from "@/components/admin/passwordPolicy";
import { useAdminGlobal, type AdminUser } from "@/app/AdminProvider";
import { useFormState } from "@/hooks/admin/useFormState";
import { toApiError } from "@/hooks/admin/api";
import apiClient from "@/services/apiClient";
import { ACCESS_LEVEL_LABELS } from "@/utils/adminAccess";
import { z } from "zod";
import { useState } from "react";
import { formatDateTime } from "@/components/admin/adminFormat";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    ...passwordFields,
  })
  .refine(passwordsMatch, passwordsMatchError)
  .refine((data) => data.password !== data.currentPassword, {
  error: "Your new password must be different from your current one",
  path: ["password"],
});

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</dt>
    <dd className="text-sm text-zinc-900 mt-1 break-words">{value}</dd>
  </div>
);

const ProfileCard = ({ user }: { user: AdminUser }) => {
  const { login: setUser, accessLevel } = useAdminGlobal();
  const toast = useToast();
  const form = useFormState({ firstName: user.firstName ?? "", lastName: user.lastName ?? "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = form.validate(adminProfileSchema);
    if (!payload || saving) return;
    setSaving(true);
    try {
      const { data } = await apiClient.put("/admin", payload);
      if (data.user) setUser(data.user);
      toast.success(data.message || "Your details have been updated.");
    } catch (err) {
      form.applyServerError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
        <UserRound size={20} aria-hidden="true" /> Your details
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Detail label="Email" value={user.email} />
        <Detail label="Access" value={ACCESS_LEVEL_LABELS[accessLevel]} />
        <Detail label="Department" value={user.role?.trim() || "-"} />
        <Detail label="Last signed in" value={formatDateTime(user.lastLoginAt)} />
        <Detail label="Password last changed" value={formatDateTime(user.passwordChangedAt)} />
      </dl>
      <p className="text-xs text-zinc-500">
        To change your email, access or department, ask a super admin.
      </p>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={form.formError} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            name="firstName"
            autoComplete="given-name"
            required
            data={form.values}
            setData={form.setValues}
            error={form.errors.firstName}
          />
          <Input
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            required
            data={form.values}
            setData={form.setValues}
            error={form.errors.lastName}
          />
        </div>
        <Button loading={saving} className="sm:w-auto sm:px-8">
          Save details
        </Button>
      </form>
    </Card>
  );
};

const EMPTY_PASSWORDS = { currentPassword: "", password: "", confirmPassword: "" };

const PasswordCard = ({ forced }: { forced: boolean }) => {
  const { login: setUser } = useAdminGlobal();
  const toast = useToast();
  const form = useFormState(EMPTY_PASSWORDS);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = form.validate(passwordSchema);
    if (!payload || saving) return;
    setSaving(true);
    try {
      const { data } = await apiClient.post("/admin/auth/change-password", payload);
      form.reset(EMPTY_PASSWORDS);
      toast.success(data.message || "Your password has been changed.");
      // Clears mustChangePassword, which unlocks the rest of the portal
      if (data.user) setUser(data.user);
    } catch (err) {
      const apiError = toApiError(err);
      if (apiError.status === 429) {
        form.setFormError("Too many attempts. Please wait 15 minutes and try again.");
      } else {
        form.applyServerError(err);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
          <KeyRound size={20} aria-hidden="true" /> {forced ? "Choose a new password" : "Change password"}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Changing your password signs you out on every other device.
        </p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-md">
        <FormError message={form.formError} />
        <Input
          label={forced ? "Temporary password" : "Current password"}
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          data={form.values}
          setData={form.setValues}
          error={form.errors.currentPassword}
        />
        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          data={form.values}
          setData={form.setValues}
          error={form.errors.password}
        />
        <PasswordChecklist id="account-password-rules" value={form.values.password} />
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          data={form.values}
          setData={form.setValues}
          error={form.errors.confirmPassword}
        />
        <Button loading={saving} className="sm:w-auto sm:px-8">
          Change password
        </Button>
      </form>
    </Card>
  );
};

const AdminAccount = () => {
  const { currentUser } = useAdminGlobal();
  if (!currentUser) return null;
  const forced = !!currentUser.mustChangePassword;

  return (
    <div className="space-y-6">
      <PageHeader title="My Account" description="Your admin profile and password." />
      {forced && (
        <div role="alert" className="flex gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <AlertTriangle size={20} className="shrink-0" aria-hidden="true" />
          <p>
            You signed in with a temporary password from a super admin. Choose
            your own password to continue using the portal.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {forced ? (
          <>
            <PasswordCard forced />
            <ProfileCard user={currentUser} />
          </>
        ) : (
          <>
            <ProfileCard user={currentUser} />
            <PasswordCard forced={false} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAccount;
