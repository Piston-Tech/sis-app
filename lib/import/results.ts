import type { BulkRowErrors, BulkRowResult } from "@/types/BulkImport";

/** Row errors in any shape -> ["email: Invalid email", ...]. */
export const rowErrorMessages = (errors: BulkRowErrors | undefined | null): string[] => {
  if (!errors) return [];
  if (typeof errors === "string") return [errors];
  if (Array.isArray(errors)) return errors.map(String);
  return Object.entries(errors).map(([field, message]) =>
    field && field !== "_form" && field !== "row" ? `${field}: ${message}` : String(message),
  );
};

const OUTPUT_KEYS = [
  "studentId",
  "id",
  "existingStudentId",
  "studentCreated",
  "classId",
  "tier",
] as const;

/**
 * One output row per input row: the uploaded values plus status, errors and
 * any ids the server returned (matched by the 1-based `row` number).
 */
export const buildResultRows = (
  inputRows: ReadonlyArray<Record<string, string>>,
  results: ReadonlyArray<BulkRowResult>,
) => {
  const byRow = new Map(results.map((r) => [r.row, r]));
  return inputRows.map((input, i) => {
    const result = byRow.get(i + 1);
    const out: Record<string, string> = { row: String(i + 1), ...input };
    out.status = result?.status ?? "";
    out.errors = rowErrorMessages(result?.errors).join("; ");
    for (const key of OUTPUT_KEYS) {
      const value = result?.[key];
      if (value !== undefined && value !== null && value !== "")
        out[`result_${key}`] = String(value);
    }
    return out;
  });
};

/** Column order for the results CSV: row, input columns, status, errors, result ids. */
export const resultColumns = (
  inputKeys: readonly string[],
  rows: ReadonlyArray<Record<string, string>>,
) => {
  const resultKeys = OUTPUT_KEYS.map((k) => `result_${k}`).filter((k) =>
    rows.some((r) => r[k] !== undefined),
  );
  return ["row", ...inputKeys, "status", "errors", ...resultKeys];
};
