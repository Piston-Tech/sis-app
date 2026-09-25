import { useCallback, useState } from "react";
import type { ZodType } from "zod";
import { FieldErrors, toApiError } from "./api";

/** Flattens zod issues into { "field": msg, "sessions.0.date": msg }. */
export const zodFieldErrors = (
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): FieldErrors => {
  const errors: FieldErrors = {};
  issues.forEach((issue) => {
    const key = issue.path.map(String).join(".") || "_form";
    if (!errors[key]) errors[key] = issue.message;
  });
  return errors;
};

/**
 * Form values + field errors (client zod errors and backend `errors`) +
 * a form-level error message. All setters are functional so rapid updates
 * never overwrite each other.
 */
export function useFormState<T extends object>(initial: T | (() => T)) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }, []);

  /** Runs the schema; on failure stores field errors and returns null. */
  const validate = useCallback(
    <Out>(schema: ZodType<Out>, input: unknown = values): Out | null => {
      const result = schema.safeParse(input);
      if (result.success) {
        setErrors({});
        setFormError(null);
        return result.data;
      }
      setErrors(zodFieldErrors(result.error.issues));
      setFormError("Please fix the highlighted fields.");
      return null;
    },
    [values],
  );

  /** Maps a thrown API error onto field errors / form error. */
  const applyServerError = useCallback((e: unknown) => {
    const err = toApiError(e);
    if (err.fieldErrors) {
      // Flatten nested errors ({ enrollments: [{ classId }] }) to dotted keys.
      const cleaned: FieldErrors = {};
      const walk = (value: unknown, prefix: string) => {
        if (!value) return;
        if (typeof value === "object") {
          Object.entries(value as Record<string, unknown>).forEach(([k, v]) =>
            walk(v, prefix ? `${prefix}.${k}` : k),
          );
        } else if (prefix) {
          cleaned[prefix] = String(value);
        }
      };
      walk(err.fieldErrors, "");
      setErrors(cleaned);
    }
    setFormError(err.message);
    return err;
  }, []);

  const reset = useCallback((next: T) => {
    setValues(next);
    setErrors({});
    setFormError(null);
  }, []);

  return {
    values,
    setValues,
    setField,
    errors,
    setErrors,
    formError,
    setFormError,
    validate,
    applyServerError,
    reset,
  };
}

export default useFormState;
