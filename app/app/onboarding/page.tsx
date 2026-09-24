"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/app/GlobalProvider";
import Loading from "@/app/app/loading";
import useProfessionCategories from "@/hooks/useProfessionCategories";
import { getInterestsBySubcategory } from "@/utils/recommendationTreeUtils";
import {
  getPersonaLabel,
  getProficiencyLabel,
  PERSONAS,
  PRIORITISE_OPTIONS,
  PrioritiseOption,
} from "@/constants/profile";
import { SelectField, TextField } from "@/components/student/FormControls";
import ProfessionFields, { ProfessionErrors } from "@/components/student/profile/ProfessionFields";
import { useUpdateProfile } from "@/components/student/queries";
import { getErrorMessage } from "@/components/student/errors";
import type { UserDetails } from "@/types";
import type { StudentProfessionDetails } from "@/types/Student";

const TOTAL_STEPS = 5;

const choiceClass = (selected: boolean) =>
  `flex w-full cursor-pointer items-center gap-3 rounded-lg border p-4 text-left transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 ${
    selected
      ? "border-blue-600 bg-blue-50 text-blue-800"
      : "border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-slate-50"
  }`;

const professionErrors = (value: StudentProfessionDetails): ProfessionErrors => {
  const errors: ProfessionErrors = {};
  if (!value.category) errors.category = "Choose a category";
  if (!value.subCategory) errors.subCategory = "Choose a sub-category";
  if (!value.profession?.trim()) errors.profession = "Choose or type a profession";
  if (!value.level) errors.level = "Choose a level";
  return errors;
};

const OnboardingForm = ({ user }: { user: UserDetails }) => {
  const router = useRouter();
  const categories = useProfessionCategories();
  const updateProfile = useUpdateProfile();

  const [step, setStep] = useState(1);
  const [prefix, setPrefix] = useState(user.prefix ?? "");
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [middleName, setMiddleName] = useState(user.middleName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [persona, setPersona] = useState("");
  const [current, setCurrent] = useState<StudentProfessionDetails>({});
  const [goal, setGoal] = useState<StudentProfessionDetails>({});
  const [prioritise, setPrioritise] = useState<PrioritiseOption>("Both");
  const [preferredTags, setPreferredTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentErrors, setCurrentErrors] = useState<ProfessionErrors>({});
  const [goalErrors, setGoalErrors] = useState<ProfessionErrors>({});

  const suggestedTags = useMemo(() => {
    const tags = [
      ...(current.category && current.subCategory
        ? getInterestsBySubcategory(current.category, current.subCategory)
        : []),
      ...(goal.category && goal.subCategory
        ? getInterestsBySubcategory(goal.category, goal.subCategory)
        : []),
    ];
    return Array.from(new Set(tags));
  }, [current.category, current.subCategory, goal.category, goal.subCategory]);

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      const next: Record<string, string> = {};
      if (!firstName.trim()) next.firstName = "First name is required";
      if (!lastName.trim()) next.lastName = "Last name is required";
      if (!phone.trim()) next.phone = "Phone number is required";
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    if (currentStep === 2) {
      const next: Record<string, string> = persona
        ? {}
        : { persona: "Choose the option that describes you best" };
      setErrors(next);
      return Object.keys(next).length === 0;
    }
    if (currentStep === 3) {
      const next = professionErrors(current);
      setCurrentErrors(next);
      return Object.keys(next).length === 0;
    }
    if (currentStep === 4) {
      const next = professionErrors(goal);
      setGoalErrors(next);
      return Object.keys(next).length === 0;
    }
    return true;
  };

  const next = () => {
    if (validateStep(step)) setStep((value) => Math.min(TOTAL_STEPS, value + 1));
  };

  const finalize = async () => {
    for (let s = 1; s < TOTAL_STEPS; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    try {
      // Email and membership tier are managed by the academy, never sent.
      await updateProfile.mutateAsync({
        prefix,
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        persona,
        metaData: {
          currentProfession: current,
          goalProfession: goal,
          prioritise,
          preferredTags,
        },
      });
      // useUpdateProfile has already refreshed the current user (with persona).
      router.replace("/");
    } catch {
      // Shown below via updateProfile.error.
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
        <div
          className="mb-8 flex justify-between"
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
          aria-valuetext={`Step ${step} of ${TOTAL_STEPS}`}
        >
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`mx-1 h-2 flex-1 rounded-full ${step >= i + 1 ? "bg-blue-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <p className="mb-1 text-sm font-semibold text-slate-600">
          Step {step} of {TOTAL_STEPS}
        </p>

        {step === 1 && (
          <section aria-labelledby="step-heading">
            <h1 id="step-heading" className="mb-2 text-2xl font-bold text-slate-800">
              Your profile
            </h1>
            <p className="mb-6 text-slate-600">Let&apos;s start with your basic information.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="onboarding-prefix"
                label="Prefix (optional)"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              >
                <option value="">None</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
              </SelectField>
              <TextField
                id="onboarding-first-name"
                label="First name"
                required
                autoComplete="given-name"
                value={firstName}
                error={errors.firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                id="onboarding-middle-name"
                label="Middle name (optional)"
                autoComplete="additional-name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <TextField
                id="onboarding-last-name"
                label="Last name"
                required
                autoComplete="family-name"
                value={lastName}
                error={errors.lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                id="onboarding-email"
                label="Email"
                type="email"
                readOnly
                value={user.email ?? ""}
                hint="This is your registered email."
              />
              <TextField
                id="onboarding-phone"
                label="Phone number"
                type="tel"
                required
                autoComplete="tel"
                placeholder="+2348012345678"
                value={phone}
                error={errors.phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="step-heading">
            <h1 id="step-heading" className="mb-2 text-2xl font-bold text-slate-800">
              Career stage
            </h1>
            <p className="mb-6 text-slate-600">Help us understand your professional background.</p>
            <fieldset aria-describedby={errors.persona ? "persona-error" : undefined}>
              <legend className="mb-3 text-sm font-semibold text-slate-700">
                Which best describes you? *
              </legend>
              <div className="space-y-2">
                {PERSONAS.map((option) => (
                  <label key={option.value} className={choiceClass(persona === option.value)}>
                    <input
                      type="radio"
                      name="persona"
                      value={option.value}
                      checked={persona === option.value}
                      onChange={() => setPersona(option.value)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    {option.careerStage}
                  </label>
                ))}
              </div>
              {errors.persona && (
                <p id="persona-error" className="mt-2 text-sm text-red-600">
                  {errors.persona}
                </p>
              )}
            </fieldset>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step-heading">
            <h1 id="step-heading" className="mb-2 text-2xl font-bold text-slate-800">
              Current profession
            </h1>
            <p className="mb-6 text-slate-600">Tell us about your current role.</p>
            <ProfessionFields
              idPrefix="onboarding-current"
              value={current}
              onChange={setCurrent}
              levelLabel="Current level"
              required
              errors={currentErrors}
              categories={categories}
              className="space-y-4"
            />
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="step-heading">
            <h1 id="step-heading" className="mb-2 text-2xl font-bold text-slate-800">
              Goal profession
            </h1>
            <p className="mb-6 text-slate-600">What would you like to achieve professionally?</p>
            <ProfessionFields
              idPrefix="onboarding-goal"
              value={goal}
              onChange={setGoal}
              levelLabel="Target level"
              professionLabel="Goal profession"
              required
              errors={goalErrors}
              categories={categories}
              className="space-y-4"
            />
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="step-heading" className="space-y-6">
            <div>
              <h1 id="step-heading" className="mb-2 text-2xl font-bold text-slate-800">
                Preferences &amp; summary
              </h1>
              <p className="text-slate-600">Choose your focus and review your answers.</p>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-slate-700">
                Recommend courses for
              </legend>
              <div className="space-y-2">
                {PRIORITISE_OPTIONS.map((option) => (
                  <label key={option.value} className={choiceClass(prioritise === option.value)}>
                    <input
                      type="radio"
                      name="prioritise"
                      value={option.value}
                      checked={prioritise === option.value}
                      onChange={() => setPrioritise(option.value)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {suggestedTags.length > 0 && (
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-700">
                  Interests (select any that apply)
                </legend>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => {
                    const selected = preferredTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setPreferredTags((tags) =>
                            selected ? tags.filter((t) => t !== tag) : [...tags, tag],
                          )
                        }
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                          selected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
              <h2 className="mb-4 font-semibold text-slate-800">Summary</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm text-slate-700">
                <dt className="font-semibold">Name</dt>
                <dd>{[prefix, firstName, middleName, lastName].filter(Boolean).join(" ")}</dd>
                <dt className="font-semibold">Phone</dt>
                <dd>{phone}</dd>
                <dt className="font-semibold">Career stage</dt>
                <dd>{getPersonaLabel(persona)}</dd>
                <dt className="font-semibold">Current role</dt>
                <dd>
                  {current.profession}
                  {current.level ? ` (${getProficiencyLabel(current.level)})` : ""}
                </dd>
                <dt className="font-semibold">Goal role</dt>
                <dd>
                  {goal.profession}
                  {goal.level ? ` (${getProficiencyLabel(goal.level)})` : ""}
                </dd>
              </dl>
            </div>

            {(updateProfile.isError || categories.error) && (
              <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {updateProfile.isError ? getErrorMessage(updateProfile.error) : categories.error}
              </p>
            )}
          </section>
        )}

        <div className="mt-8 flex gap-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(1, value - 1))}
              className="flex-1 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Previous
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={finalize}
              disabled={updateProfile.isPending}
              className="flex-1 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateProfile.isPending ? "Saving..." : "Complete onboarding"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

const OnboardingPage = () => {
  const { currentUser, loading } = useGlobal();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!currentUser) router.replace("/auth");
    else if (currentUser.persona) router.replace("/");
  }, [currentUser, loading, router]);

  if (!currentUser || currentUser.persona) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 lg:p-12">
        <Loading />
      </div>
    );
  }

  return <OnboardingForm key={currentUser.id} user={currentUser} />;
};

export default OnboardingPage;
