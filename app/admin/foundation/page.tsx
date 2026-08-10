"use client";

import AdminLayout from "@/components/AdminLayout";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

interface Program {
  id: number;
  title: string;
  description: string;
  duration: string;
  isActive: boolean;
  cohorts?: { id: number }[];
}

interface Cohort {
  id: number;
  foundationProgramId: number;
  batchName: string;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  isActive: boolean;
  program?: { id: number; title: string; isActive?: boolean };
}

interface Application {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: "New" | "Contacted" | "Accepted" | "Declined";
  createdAt: string;
  program?: { title: string };
  cohort?: { batchName: string };
  referrer?: { firstName: string; lastName: string; studentId: string };
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function AdminFoundationPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [programDraft, setProgramDraft] = useState<Partial<Program>>({});

  const fetchFresh = (url: string) =>
    fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, {
      cache: "no-store",
    }).then((response) => response.json());

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [programResponse, cohortResponse, applicationResponse] =
        await Promise.all([
          fetchFresh("/api/admin/foundation/programs"),
          fetchFresh("/api/admin/foundation/cohorts"),
          fetchFresh("/api/admin/foundation/applications"),
        ]);

      setPrograms(programResponse.data ?? []);
      setCohorts(cohortResponse.data ?? []);
      setApplications(applicationResponse.data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeProgramOptions = useMemo(
    () => programs.filter((program) => program.isActive),
    [programs],
  );

  async function createProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/foundation/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });

    setMessage(
      response.ok
        ? "Foundation program added."
        : "Could not add the foundation program.",
    );

    if (response.ok) {
      event.currentTarget.reset();
      await load();
    }
  }

  async function createCohort(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/foundation/cohorts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setMessage(
      response.ok
        ? "Cohort created successfully."
        : "Could not create cohort. Check dates and program selection.",
    );

    if (response.ok) {
      event.currentTarget.reset();
      await load();
    }
  }

  async function updateProgram(programId: number) {
    const response = await fetch("/api/admin/foundation/programs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: programId,
        title: programDraft.title,
        duration: programDraft.duration,
        description: programDraft.description,
      }),
    });

    if (response.ok) {
      setMessage("Foundation program updated.");
      setEditingProgramId(null);
      setProgramDraft({});
      await load();
      return;
    }

    setMessage("Could not update foundation program.");
  }

  async function toggleProgramStatus(program: Program) {
    const response = await fetch("/api/admin/foundation/programs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: program.id, isActive: !program.isActive }),
    });

    if (response.ok) {
      setMessage(
        `Program ${!program.isActive ? "activated" : "deactivated"}.`,
      );
      await load();
      return;
    }

    setMessage("Could not update program status.");
  }

  async function toggleCohortStatus(cohort: Cohort) {
    const response = await fetch(`/api/admin/foundation/cohorts/${cohort.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cohort.isActive }),
    });

    if (response.ok) {
      await load();
      setMessage(`Cohort ${!cohort.isActive ? "activated" : "deactivated"}.`);
      return;
    }

    setMessage("Could not update cohort status.");
  }

  async function updateApplicationStatus(
    applicationId: number,
    status: Application["status"],
  ) {
    const response = await fetch(`/api/admin/foundation/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      await load();
      return;
    }

    setMessage("Could not update application status.");
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-zinc-900">Foundations</h1>
          <p className="mt-1 text-zinc-500">
            Manage foundation programs, rolling cohorts, and referral applications.
          </p>
        </header>

        {message && (
          <p className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
            {message}
          </p>
        )}

        {isLoading && (
          <p className="text-sm text-zinc-500">Refreshing foundation data...</p>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">Add foundation program</h2>
            <form className="mt-5 space-y-4" onSubmit={createProgram}>
              <input
                required
                name="title"
                placeholder="Program title"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5"
              />
              <input
                name="duration"
                placeholder="Duration, e.g. 2 days"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5"
              />
              <textarea
                name="description"
                placeholder="Short description"
                className="min-h-28 w-full rounded-lg border border-zinc-300 px-3 py-2.5"
              />
              <button className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white">
                Publish program
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">Create cohort batch</h2>
            <form className="mt-5 space-y-4" onSubmit={createCohort}>
              <select
                required
                name="foundationProgramId"
                defaultValue=""
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5"
              >
                <option value="" disabled>
                  Select active program
                </option>
                {activeProgramOptions.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </select>
              <input
                required
                name="batchName"
                placeholder="Batch name, e.g. August 2026 Cohort"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-zinc-600">
                  Start date
                  <input
                    required
                    type="date"
                    name="startDate"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                  />
                </label>
                <label className="text-sm text-zinc-600">
                  End date
                  <input
                    required
                    type="date"
                    name="endDate"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                  />
                </label>
              </div>
              <label className="block text-sm text-zinc-600">
                Application deadline
                <input
                  required
                  type="date"
                  name="applicationDeadline"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5"
                />
              </label>
              <button className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white">
                Add cohort
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold">Cohort batches</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Apply by</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {cohorts.map((cohort) => (
                  <tr key={cohort.id}>
                    <td className="px-4 py-3">{cohort.program?.title ?? "-"}</td>
                    <td className="px-4 py-3 font-medium">{cohort.batchName}</td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(cohort.applicationDeadline)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          cohort.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {cohort.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleCohortStatus(cohort)}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700"
                      >
                        {cohort.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {cohorts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      No cohorts created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-bold">Manage programs</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Cohorts</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {programs.map((program) => {
                  const isEditing = editingProgramId === program.id;
                  return (
                    <tr key={program.id}>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={programDraft.title ?? ""}
                            onChange={(event) =>
                              setProgramDraft((prev) => ({
                                ...prev,
                                title: event.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-zinc-300 px-2 py-1.5"
                          />
                        ) : (
                          <span className="font-medium">{program.title}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={programDraft.duration ?? ""}
                            onChange={(event) =>
                              setProgramDraft((prev) => ({
                                ...prev,
                                duration: event.target.value,
                              }))
                            }
                            className="w-full rounded-md border border-zinc-300 px-2 py-1.5"
                          />
                        ) : (
                          <span className="text-zinc-600">
                            {program.duration || "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <textarea
                            value={programDraft.description ?? ""}
                            onChange={(event) =>
                              setProgramDraft((prev) => ({
                                ...prev,
                                description: event.target.value,
                              }))
                            }
                            className="min-h-16 w-full rounded-md border border-zinc-300 px-2 py-1.5"
                          />
                        ) : (
                          <span className="text-zinc-600">
                            {program.description || "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-600">
                        {program.cohorts?.length ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            program.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {program.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => updateProgram(program.id)}
                                className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProgramId(null);
                                  setProgramDraft({});
                                }}
                                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingProgramId(program.id);
                                  setProgramDraft({
                                    title: program.title,
                                    duration: program.duration,
                                    description: program.description,
                                  });
                                }}
                                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleProgramStatus(program)}
                                className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700"
                              >
                                {program.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {programs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      No foundation programs created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 p-6">
            <h2 className="text-lg font-bold">Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Applicant</th>
                  <th className="px-5 py-3">Program</th>
                  <th className="px-5 py-3">Cohort</th>
                  <th className="px-5 py-3">Referrer</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">
                        {application.firstName} {application.lastName}
                      </p>
                      <p className="text-zinc-500">{application.email}</p>
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      {application.program?.title ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      {application.cohort?.batchName ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      {application.referrer
                        ? `${application.referrer.firstName} ${application.referrer.lastName} (${application.referrer.studentId})`
                        : "Direct"}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={application.status}
                        onChange={(event) =>
                          updateApplicationStatus(
                            application.id,
                            event.target.value as Application["status"],
                          )
                        }
                        className="rounded-lg border border-zinc-300 px-2 py-1.5 text-xs font-semibold"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-zinc-500">
                      No applications received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
