"use client";

import { CheckCircle2, ExternalLink, GraduationCap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError, getErrorMessage, getFieldErrors } from "@/components/student/errors";
import { safeExternalUrl } from "@/components/student/format";

interface Cohort {
  id: number;
  batchName: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  program: {
    id: number;
    title: string;
    description: string;
    duration: string;
    websiteUrl?: string | null;
    courseDetails?: string | null;
  };
}

const genderOptions = ["Male", "Female", "Prefer not to say"];
const qualificationOptions = [
  "Secondary School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Certification",
  "Other",
];
const jobStatusOptions = [
  "Student",
  "Employed Full-Time",
  "Employed Part-Time",
  "Self-Employed",
  "Unemployed",
  "Freelancer",
  "Other",
];
const marketingSourceOptions = [
  "Website",
  "Social Media",
  "Friend or Family",
  "WhatsApp",
  "Instagram",
  "LinkedIn",
  "Email",
  "Other",
];

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-900 aria-[invalid=true]:border-red-500";

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** POST/GET JSON helper that throws ApiError for non-2xx responses. */
const requestJson = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init);
  let body: Record<string, unknown> | undefined;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  if (!response.ok || body?.success === false) {
    throw new ApiError(response.status, body as ConstructorParameters<typeof ApiError>[1]);
  }
  return body ?? {};
};

type FieldName =
  | "foundationCohortId"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "gender"
  | "highestQualification"
  | "currentJobStatus"
  | "currentProfession"
  | "digitalMarketingCourseBefore"
  | "interestReason"
  | "marketingSource"
  | "referralCode";

function Field({
  name,
  label,
  errors,
  children,
  className = "block",
}: {
  name: FieldName;
  label: ReactNode;
  errors: Record<string, string>;
  children: (props: {
    id: string;
    name: FieldName;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }) => ReactNode;
  className?: string;
}) {
  const id = `foundation-${name}`;
  const error = errors[name];
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children({
        id,
        name,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : undefined,
      })}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function FoundationApplicationForm() {
  const searchParams = useSearchParams();
  const [selectedCohortId, setSelectedCohortId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cohortsQuery = useQuery({
    queryKey: ["foundation", "cohorts"],
    queryFn: async () => {
      const body = await requestJson("/api/foundation/cohorts");
      return Array.isArray(body.data) ? (body.data as Cohort[]) : [];
    },
  });
  const cohorts = useMemo(() => cohortsQuery.data ?? [], [cohortsQuery.data]);

  const selectedCohort = useMemo(
    () => cohorts.find((cohort) => String(cohort.id) === selectedCohortId) ?? null,
    [cohorts, selectedCohortId],
  );
  const programUrl = safeExternalUrl(selectedCohort?.program.websiteUrl);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Capture the form now: React clears event.currentTarget after an await.
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    setSubmitting(true);
    setResult(null);
    setFieldErrors({});

    try {
      const body = await requestJson("/api/foundation/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      form.reset();
      setSelectedCohortId("");
      setResult({
        ok: true,
        message:
          (typeof body.message === "string" && body.message) ||
          "Your application has been received.",
      });
    } catch (error) {
      if (error instanceof TypeError) {
        setResult({
          ok: false,
          message: "We couldn't reach the server. Check your connection and try again.",
        });
      } else {
        setFieldErrors(getFieldErrors(error));
        setResult({
          ok: false,
          message: getErrorMessage(error, "We could not submit your application."),
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const noCohorts = cohortsQuery.isSuccess && cohorts.length === 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="pt-4 lg:pt-16">
          <div className="mb-6 inline-flex rounded-xl bg-primary-900 p-3 text-white">
            <GraduationCap className="h-7 w-7" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-800">
            Piston &amp; Fusion Business Academy
          </p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">Foundations Program</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Get a practical preview of our training experience and the programmes built for your
            next professional step.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
              Choose the program that fits your goal.
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
              Receive follow-up from our program team.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="apply-heading">
          <h2 id="apply-heading" className="text-2xl font-bold text-slate-950">
            Apply for a place
          </h2>
          <p className="mt-2 text-sm text-slate-600">Complete your details and we will be in touch.</p>

          <form className="mt-7 space-y-4" onSubmit={submit}>
            <Field name="foundationCohortId" label="Open cohort" errors={fieldErrors}>
              {(props) => (
                <select
                  {...props}
                  required
                  value={selectedCohortId}
                  onChange={(event) => setSelectedCohortId(event.target.value)}
                  disabled={cohortsQuery.isPending}
                  className={inputClass}
                >
                  <option value="" disabled>
                    {cohortsQuery.isPending ? "Loading cohorts..." : "Select a cohort"}
                  </option>
                  {cohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.program.title} - {cohort.batchName} ({formatDate(cohort.startDate)} to{" "}
                      {formatDate(cohort.endDate)} | Apply by {formatDate(cohort.applicationDeadline)})
                    </option>
                  ))}
                </select>
              )}
            </Field>

            {cohortsQuery.isError && (
              <p role="alert" className="text-sm text-red-600">
                We couldn&apos;t load the open cohorts.{" "}
                <button type="button" className="font-semibold underline" onClick={() => cohortsQuery.refetch()}>
                  Try again
                </button>
              </p>
            )}

            {selectedCohort && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">Selected program details</p>
                  {programUrl && (
                    <a
                      href={programUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary-900 underline"
                    >
                      Visit page <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                </div>
                {selectedCohort.program.courseDetails && (
                  <p className="whitespace-pre-wrap leading-6">{selectedCohort.program.courseDetails}</p>
                )}
                {selectedCohort.program.description && (
                  <p className="mt-2 whitespace-pre-wrap leading-6">{selectedCohort.program.description}</p>
                )}
                <p className="mt-2 leading-6">
                  Dates: {formatDate(selectedCohort.startDate)} to {formatDate(selectedCohort.endDate)}
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="firstName" label="First name" errors={fieldErrors}>
                {(props) => <input {...props} required autoComplete="given-name" className={inputClass} />}
              </Field>
              <Field name="lastName" label="Last name" errors={fieldErrors}>
                {(props) => <input {...props} required autoComplete="family-name" className={inputClass} />}
              </Field>
            </div>

            <Field name="email" label="Email address" errors={fieldErrors}>
              {(props) => <input {...props} required type="email" autoComplete="email" className={inputClass} />}
            </Field>
            <Field
              name="phone"
              label={
                <>
                  Phone number <span className="font-normal text-slate-500">(optional)</span>
                </>
              }
              errors={fieldErrors}
            >
              {(props) => <input {...props} type="tel" autoComplete="tel" className={inputClass} />}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="gender" label="Gender" errors={fieldErrors}>
                {(props) => (
                  <select {...props} required defaultValue="" className={inputClass}>
                    <option value="">Select</option>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field name="highestQualification" label="Highest educational qualification" errors={fieldErrors}>
                {(props) => (
                  <select {...props} required defaultValue="" className={inputClass}>
                    <option value="">Select</option>
                    {qualificationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="currentJobStatus"
                label={
                  <>
                    Current job status <span className="font-normal text-slate-500">(optional)</span>
                  </>
                }
                errors={fieldErrors}
              >
                {(props) => (
                  <select {...props} defaultValue="" className={inputClass}>
                    <option value="">Select</option>
                    {jobStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field
                name="currentProfession"
                label={
                  <>
                    Current profession or role <span className="font-normal text-slate-500">(optional)</span>
                  </>
                }
                errors={fieldErrors}
              >
                {(props) => <input {...props} autoComplete="organization-title" className={inputClass} />}
              </Field>
            </div>

            <Field name="digitalMarketingCourseBefore" label="Have you taken any related course before?" errors={fieldErrors}>
              {(props) => (
                <select {...props} required defaultValue="" className={inputClass}>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              )}
            </Field>

            <Field name="interestReason" label="Why are you interested in this program?" errors={fieldErrors}>
              {(props) => <textarea {...props} required rows={4} className={inputClass} />}
            </Field>

            <Field name="marketingSource" label="How did you hear about the Foundation Course?" errors={fieldErrors}>
              {(props) => (
                <select {...props} required defaultValue="" className={inputClass}>
                  <option value="">Select</option>
                  {marketingSourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field
              name="referralCode"
              label={
                <>
                  Referral code <span className="font-normal text-slate-500">(optional)</span>
                </>
              }
              errors={fieldErrors}
            >
              {(props) => (
                <input
                  {...props}
                  defaultValue={searchParams.get("ref") ?? ""}
                  className={`${inputClass} uppercase`}
                />
              )}
            </Field>

            {result && (
              <p
                role={result.ok ? "status" : "alert"}
                className={`rounded-lg px-3 py-3 text-sm ${
                  result.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
                }`}
              >
                {result.message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || cohortsQuery.isPending || noCohorts}
              aria-busy={submitting}
              className="w-full rounded-lg bg-primary-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit application"}
            </button>
            {noCohorts && (
              <p className="text-sm text-slate-600">No cohorts are currently open for application.</p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

export default function FoundationApplicationPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" />}>
      <FoundationApplicationForm />
    </Suspense>
  );
}
