import { Class, Session } from "@/types";
import CustomClass from "@/types/CustomClass";
import { useCallback } from "react";
import { classSchema } from "@/components/admin/schemas";
import { useFormState } from "./useFormState";
import { useResourceMutation } from "./useResourceMutation";

export type ClassWithRelations = Class & {
  noOfEnrollments?: number;
  customClass?: CustomClass | null;
  sessions?: Session[];
  course?: { id: number; code: string; title: string };
};

export interface SessionFormValues {
  /** Present for sessions that already exist (lets the backend upsert). */
  id?: number;
  date: Date | null;
  startTime: string;
  endTime: string;
  zoomLink: string;
  venueDetails: string;
  status: string;
  notes: string;
  delivery: string;
}

export interface CustomClassFormValues {
  title: string;
  description: string;
  instructions: string;
  price: number | null;
}

export interface ClassFormValues {
  courseId: number;
  plannedStartDate: Date | null;
  schedule: string;
  isCustom: boolean;
  customClass: CustomClassFormValues;
  sessions: SessionFormValues[];
}

const newSession = (date: Date | null): SessionFormValues => ({
  date,
  startTime: "09:00",
  endTime: "15:00",
  zoomLink: "",
  venueDetails: "",
  status: "Confirmed",
  notes: "",
  delivery: "Hybrid",
});

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? null : d;
};

const toFormValues = (data: ClassWithRelations | null): ClassFormValues => {
  const start = toDate(data?.plannedStartDate) ?? new Date();
  const sessions =
    data?.sessions?.map((s) => ({
      id: s.id,
      date: toDate(s.date),
      startTime: s.startTime ?? "",
      endTime: s.endTime ?? "",
      zoomLink: s.zoomLink ?? "",
      venueDetails: s.venueDetails ?? "",
      status: s.status ?? "",
      notes: s.notes ?? "",
      delivery: s.delivery ?? "",
    })) ?? [];

  return {
    courseId: data?.courseId ?? 0,
    plannedStartDate: start,
    schedule: data?.schedule ?? "",
    isCustom: data?.isCustom ?? false,
    customClass: {
      title: data?.customClass?.title ?? "",
      description: data?.customClass?.description ?? "",
      instructions: data?.customClass?.instructions ?? "",
      price:
        data?.customClass?.price !== undefined &&
        data?.customClass?.price !== null
          ? Number(data.customClass.price)
          : 0,
    },
    sessions: sessions.length ? sessions : [newSession(start)],
  };
};

/**
 * Create / edit a class together with its sessions and optional custom-class
 * details. Both create (POST /admin/classes) and update
 * (PUT /admin/classes/:id) send the full payload:
 * { courseId, plannedStartDate, schedule, isCustom, sessions[], customClass? }.
 */
const useClassForm = (
  data: ClassWithRelations | null,
  onSaved: (message?: string) => void,
) => {
  const form = useFormState<ClassFormValues>(() => toFormValues(data));
  const { values, setValues } = form;
  const { create, update } = useResourceMutation<unknown>("classes");
  const loading = create.isPending || update.isPending;

  /** Top-level fields; moving the start date in create mode moves day 1. */
  const setClassFields = useCallback(
    (next: ClassFormValues) => {
      setValues((prev) => {
        const startChanged =
          next.plannedStartDate?.getTime() !== prev.plannedStartDate?.getTime();
        if (!data && startChanged && next.sessions.length > 0) {
          const [first, ...rest] = next.sessions;
          return {
            ...next,
            sessions: [{ ...first, date: next.plannedStartDate }, ...rest],
          };
        }
        return next;
      });
    },
    [data, setValues],
  );

  const setCustomClass = useCallback(
    (customClass: CustomClassFormValues) =>
      setValues((prev) => ({ ...prev, customClass })),
    [setValues],
  );

  const setSession = useCallback(
    (index: number, session: SessionFormValues) =>
      setValues((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s, i) => (i === index ? session : s)),
      })),
    [setValues],
  );

  const removeSession = useCallback(
    (index: number) =>
      setValues((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((_, i) => i !== index),
      })),
    [setValues],
  );

  const addSessionRow = useCallback(
    () =>
      setValues((prev) => {
        const last = prev.sessions[prev.sessions.length - 1];
        const base = last?.date ?? prev.plannedStartDate;
        const date = base ? new Date(base) : null;
        if (date && last) date.setDate(date.getDate() + 1);
        return { ...prev, sessions: [...prev.sessions, newSession(date)] };
      }),
    [setValues],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const payload = form.validate(classSchema, values);
    if (!payload) return;

    const body = {
      courseId: payload.courseId,
      plannedStartDate: payload.plannedStartDate,
      schedule: payload.schedule,
      isCustom: payload.isCustom,
      sessions: payload.sessions,
      ...(payload.isCustom ? { customClass: payload.customClass } : {}),
    };

    try {
      const res = data
        ? await update.mutateAsync({ id: data.id, body })
        : await create.mutateAsync(body);
      onSaved(res.message);
    } catch (err) {
      form.applyServerError(err);
    }
  };

  return {
    values,
    setClassFields,
    setCustomClass,
    setSession,
    removeSession,
    addSessionRow,
    handleSubmit,
    loading,
    errors: form.errors,
    formError: form.formError,
  };
};

export default useClassForm;
