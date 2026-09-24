"use client";

import { FormEvent, useMemo, useState } from "react";
import { User } from "lucide-react";
import { useGlobal } from "@/app/GlobalProvider";
import TagInput from "@/components/TagInput";
import useProfessionCategories from "@/hooks/useProfessionCategories";
import { getAllInterests } from "@/utils/recommendationTreeUtils";
import { getPersonaLabel, PRIORITISE_OPTIONS, PrioritiseOption } from "@/constants/profile";
import { SUPPORT_EMAIL } from "@/constants/links";
import { SelectField, TextField, fieldLabelClass } from "@/components/student/FormControls";
import ProfessionFields from "@/components/student/profile/ProfessionFields";
import { useUpdateProfile } from "@/components/student/queries";
import { getErrorMessage, getFieldErrors } from "@/components/student/errors";
import { useToast } from "@/components/student/Toast";
import Loading from "@/app/app/loading";
import type { UserDetails } from "@/types";
import type { StudentMetaData, StudentProfessionDetails } from "@/types/Student";

const sectionClass = "rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10";

const ProfileForm = ({ user }: { user: UserDetails }) => {
  const meta: StudentMetaData = user.metaData ?? {};
  const categories = useProfessionCategories();
  const updateProfile = useUpdateProfile();
  const toast = useToast();
  const interestSuggestions = useMemo(() => getAllInterests(), []);

  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [current, setCurrent] = useState<StudentProfessionDetails>(meta.currentProfession ?? {});
  const [goal, setGoal] = useState<StudentProfessionDetails>(meta.goalProfession ?? {});
  const [prioritise, setPrioritise] = useState<PrioritiseOption>(meta.prioritise ?? "Both");
  const [preferredTags, setPreferredTags] = useState<string[]>(meta.preferredTags ?? []);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    // Email and membership tier are managed by the academy, never sent.
    updateProfile.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        metaData: {
          ...meta,
          currentProfession: current,
          goalProfession: goal,
          prioritise,
          preferredTags,
        },
      },
      {
        onSuccess: () => toast.success("Your profile has been updated."),
        onError: (error) => setFieldErrors(getFieldErrors(error)),
      },
    );
  };

  const errorMessage = updateProfile.isError ? getErrorMessage(updateProfile.error) : null;

  return (
    <form onSubmit={submit} className={`${sectionClass} lg:col-span-8`}>
      <h2 className="mb-8 text-xl font-black text-slate-900">Account details</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          id="profile-first-name"
          label="First name"
          autoComplete="given-name"
          required
          value={firstName}
          error={fieldErrors.firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          id="profile-last-name"
          label="Last name"
          autoComplete="family-name"
          required
          value={lastName}
          error={fieldErrors.lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          id="profile-email"
          label="Email address"
          type="email"
          value={user.email ?? ""}
          readOnly
          hint={
            SUPPORT_EMAIL ? (
              <>
                To change your email, contact{" "}
                <a className="font-semibold text-blue-700 underline" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </>
            ) : (
              "Your email can only be changed by the academy's support team."
            )
          }
        />
        <TextField
          id="profile-phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          value={phone}
          error={fieldErrors.phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          id="profile-organisation"
          label="Company / organisation"
          readOnly
          value={user.companyId ? "Company-sponsored account" : "Individual account"}
        />
        <TextField id="profile-student-id" label="Student ID" readOnly value={user.studentId || "—"} />
      </div>

      <h2 className="mb-6 mt-12 text-xl font-black text-slate-900">Current profession</h2>
      <ProfessionFields
        idPrefix="profile-current"
        value={current}
        onChange={setCurrent}
        levelLabel="Current level"
        categories={categories}
      />

      <h2 className="mb-6 mt-12 text-xl font-black text-slate-900">Goal profession</h2>
      <ProfessionFields
        idPrefix="profile-goal"
        value={goal}
        onChange={setGoal}
        levelLabel="Target level"
        professionLabel="Goal profession"
        categories={categories}
      />

      <h2 className="mb-6 mt-12 text-xl font-black text-slate-900">Recommendations</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SelectField
          id="profile-prioritise"
          label="Recommend courses for"
          value={prioritise}
          onChange={(e) => setPrioritise(e.target.value as PrioritiseOption)}
        >
          {PRIORITISE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <div className="md:col-span-2">
          <label htmlFor="profile-tags" className={fieldLabelClass}>
            Interests
          </label>
          <TagInput
            id="profile-tags"
            aria-describedby="profile-tags-hint"
            value={preferredTags}
            onChange={setPreferredTags}
            suggestions={interestSuggestions}
            placeholder="Type to search, press Enter or comma to add..."
          />
          <p id="profile-tags-hint" className="mt-1.5 text-sm text-slate-600">
            Topics you&apos;d like courses about.
          </p>
        </div>
      </div>

      {categories.error && (
        <p role="alert" className="mt-8 text-sm font-medium text-red-600">
          {categories.error}
        </p>
      )}

      <div className="mt-10 space-y-3">
        {errorMessage && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="rounded-3xl bg-slate-900 px-10 py-5 text-sm font-black uppercase tracking-wider text-white shadow-xl transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateProfile.isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
};

const UserProfilePage = () => {
  const { currentUser: user } = useGlobal();
  if (!user) return <Loading />;

  const personaLabel = getPersonaLabel(user.persona);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <h1 className="sr-only">Your profile</h1>
      <aside className={`${sectionClass} h-fit text-center lg:col-span-4`}>
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[2.5rem] border-4 border-white bg-blue-50 shadow-xl">
          <User className="h-16 w-16 text-blue-700" aria-hidden />
        </div>
        <p className="mb-1 text-2xl font-black text-slate-900">
          {user.firstName} {user.lastName}
        </p>
        {personaLabel && (
          <p className="mb-8 text-sm font-bold uppercase tracking-wider text-blue-700">{personaLabel}</p>
        )}
        {user.membershipTier && (
          <dl className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase text-slate-600">Membership tier</dt>
            <dd className="text-sm font-black text-slate-900">{user.membershipTier}</dd>
          </dl>
        )}
      </aside>

      {/* Remount when a different student signs in so the form resets. */}
      <ProfileForm key={user.id} user={user} />
    </div>
  );
};

export default UserProfilePage;
