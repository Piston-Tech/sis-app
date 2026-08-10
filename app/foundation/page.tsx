"use client";

import { CheckCircle2, GraduationCap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

interface Cohort {
  id: number;
  batchName: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  program: { id: number; title: string; description: string; duration: string };
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function FoundationApplicationForm() {
  const searchParams = useSearchParams();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/foundation/cohorts")
      .then((response) => response.json())
      .then((response) => setCohorts(response.data ?? []));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/foundation/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const result = await response.json();
    setMessage(result.message ?? result.error ?? "We could not submit your application.");
    if (response.ok) event.currentTarget.reset();
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section className="pt-4 lg:pt-16">
          <div className="mb-6 inline-flex rounded-xl bg-primary-900 p-3 text-white"><GraduationCap className="h-7 w-7" /></div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-800">Piston & Fusion Business Academy</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">Foundations Program</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">Get a practical preview of our training experience, expert learning environment, and the programmes built for your next professional step.</p>
          <ul className="mt-8 space-y-3 text-sm text-slate-700">
            <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Choose the program that fits your goal.</li>
            <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Receive follow-up from our program team.</li>
          </ul>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Apply for a place</h2>
          <p className="mt-2 text-sm text-slate-600">Complete your details and we will be in touch.</p>
          <form className="mt-7 space-y-4" onSubmit={submit}>
            <label className="block text-sm font-medium text-slate-700">Open cohort<select required name="foundationCohortId" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3" defaultValue=""><option value="" disabled>Select a cohort</option>{cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.program.title} - {cohort.batchName} ({formatDate(cohort.startDate)} to {formatDate(cohort.endDate)} | Apply by {formatDate(cohort.applicationDeadline)})</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">First name<input required name="firstName" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3" /></label><label className="text-sm font-medium text-slate-700">Last name<input required name="lastName" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3" /></label></div>
            <label className="block text-sm font-medium text-slate-700">Email address<input required type="email" name="email" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3" /></label>
            <label className="block text-sm font-medium text-slate-700">Phone number<input name="phone" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3" /></label>
            <label className="block text-sm font-medium text-slate-700">Current profession or role<input name="currentProfession" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3" /></label>
            <label className="block text-sm font-medium text-slate-700">Referral code <span className="font-normal text-slate-400">(optional)</span><input name="referralCode" defaultValue={searchParams.get("ref") ?? ""} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 uppercase" /></label>
            {message && <p className="rounded-lg bg-slate-100 px-3 py-3 text-sm text-slate-700">{message}</p>}
            <button disabled={submitting || cohorts.length === 0} className="w-full rounded-lg bg-primary-900 px-4 py-3 font-semibold text-white disabled:opacity-50">{submitting ? "Submitting..." : "Submit application"}</button>
            {cohorts.length === 0 && <p className="text-sm text-slate-500">No active cohorts are currently open for application.</p>}
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