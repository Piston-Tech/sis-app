"use client";

import Modal from "@/components/Modal";
import cn from "@/utils/cn";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import {
  DragEvent,
  ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAdminGlobal } from "@/app/AdminProvider";
import { AdminResource } from "@/hooks/admin/api";
import { useBulkImport } from "@/hooks/admin/useBulkImport";
import {
  ACCEPTED_EXTENSIONS,
  IMPORT_FIELDS,
  ImportKind,
  MAX_IMPORT_ROWS,
  ParsedSheet,
  REQUIRED_RULE,
  SpreadsheetError,
  TemplateFormat,
  buildResultRows,
  downloadTemplate,
  mapHeaders,
  missingRequiredColumns,
  parseSpreadsheet,
  resultColumns,
  rowErrorMessages,
  toApiRows,
} from "@/lib/import";
import { BulkResponse, BulkRowResult, BulkRowStatus } from "@/types/BulkImport";
import FormError from "./FormError";
import { downloadCsv } from "./csv";

const PREVIEW_ROWS = 50;

const STATUS_CHIP: Record<BulkRowStatus, { label: string; className: string }> =
  {
    created: { label: "Created", className: "bg-emerald-50 text-emerald-700" },
    would_create: {
      label: "Will create",
      className: "bg-sky-50 text-sky-700",
    },
    skipped_existing: {
      label: "Skipped (exists)",
      className: "bg-zinc-100 text-zinc-600",
    },
    ok: { label: "OK", className: "bg-emerald-50 text-emerald-700" },
    error: { label: "Error", className: "bg-rose-50 text-rose-700" },
  };

const SUMMARY_LABELS: Record<string, string> = {
  total: "Rows",
  rows: "Rows",
  created: "Created",
  skipped: "Skipped (existing)",
  failed: "Failed",
  enrollments: "Enrollments",
  studentsCreated: "New students",
  studentsMatched: "Existing students",
};

export const StatusChip = ({ status }: { status: BulkRowStatus }) => {
  const chip = STATUS_CHIP[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-600",
  };
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        chip.className,
      )}
    >
      {chip.label}
    </span>
  );
};

type Phase = "dryRun" | "import";

export interface BulkImportModalProps {
  kind: ImportKind;
  title: string;
  description?: ReactNode;
  /** Path under /api, e.g. "/admin/students/bulk". */
  endpoint: string;
  /**
   * Extra body fields merged with `rows` (companyId, payer...). `null` means
   * the settings are incomplete and validation is blocked.
   */
  extraBody?: Record<string, unknown> | null;
  /** Why `extraBody` is null (shown next to the Validate button). */
  settingsHint?: string;
  /** Settings controls rendered above the file picker (e.g. payer, company). */
  settings?: ReactNode;
  /** All-or-nothing endpoints: any row error blocks the import. */
  allOrNothing?: boolean;
  /** Resources refreshed after a successful import. */
  invalidate: AdminResource[];
  /** Extra kind-specific lines under the summary (totals etc.). */
  renderSummaryExtra?: (result: BulkResponse, phase: Phase) => ReactNode;
  /** Called after a successful (non-dry) import. */
  onImported?: (result: BulkResponse) => void;
  onClose: () => void;
}

const summaryEntries = (result: BulkResponse) =>
  Object.entries(result.summary ?? {}).filter(
    ([key, value]) => SUMMARY_LABELS[key] && typeof value === "number",
  ) as Array<[string, number]>;

const hasRowErrors = (result: BulkResponse) =>
  (result.rows ?? []).some((r) => r.status === "error");

const importableRows = (result: BulkResponse) =>
  (result.rows ?? []).filter(
    (r) => r.status !== "error" && r.status !== "skipped_existing",
  ).length;

const SummaryCounts = ({ result }: { result: BulkResponse }) => {
  const entries = summaryEntries(result);
  if (!entries.length) return null;
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className={cn(
            "p-3 rounded-xl border text-center",
            key === "failed" && value > 0
              ? "border-rose-200 bg-rose-50"
              : "border-zinc-100 bg-zinc-50",
          )}
        >
          <dt className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {SUMMARY_LABELS[key]}
          </dt>
          <dd className="text-lg font-black text-zinc-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
};

const ResultTable = ({
  results,
  apiRows,
  kind,
}: {
  results: BulkRowResult[];
  apiRows: Array<Record<string, string>>;
  kind: ImportKind;
}) => {
  const toggleId = useId();
  const errorCount = results.filter((r) => r.status === "error").length;
  const [onlyErrors, setOnlyErrors] = useState(errorCount > 0);
  const shown =
    onlyErrors && errorCount > 0
      ? results.filter((r) => r.status === "error")
      : results;
  const identity = (r: BulkRowResult) => {
    const input = apiRows[r.row - 1] ?? {};
    return kind === "students"
      ? [input.firstName, input.lastName].filter(Boolean).join(" ") ||
          r.email ||
          input.email
      : input.studentId ||
          input.email ||
          [input.firstName, input.lastName].filter(Boolean).join(" ");
  };
  const detail = (r: BulkRowResult) => {
    const input = apiRows[r.row - 1] ?? {};
    if (kind === "students") return r.email ?? input.email ?? "";
    return [input.class, input.tier].filter(Boolean).join(" / ");
  };
  const newId = (r: BulkRowResult) =>
    r.existingStudentId
      ? `Existing: ${r.existingStudentId}`
      : r.studentId
        ? `${r.studentId}${r.studentCreated ? " (new)" : ""}`
        : "";

  return (
    <div className="space-y-2">
      {errorCount > 0 && (
        <div className="flex items-center gap-2">
          <input
            id={toggleId}
            type="checkbox"
            checked={onlyErrors}
            onChange={(e) => setOnlyErrors(e.target.checked)}
          />
          <label htmlFor={toggleId} className="text-xs text-zinc-700">
            Show only rows with errors ({errorCount})
          </label>
        </div>
      )}
      <div className="max-h-80 overflow-auto border border-zinc-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Per-row results</caption>
          <thead className="sticky top-0 bg-zinc-50">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold text-zinc-500">
                Row
              </th>
              <th scope="col" className="px-3 py-2 font-bold text-zinc-500">
                Status
              </th>
              <th scope="col" className="px-3 py-2 font-bold text-zinc-500">
                Student
              </th>
              <th scope="col" className="px-3 py-2 font-bold text-zinc-500">
                {kind === "students" ? "Email" : "Class / Tier"}
              </th>
              <th scope="col" className="px-3 py-2 font-bold text-zinc-500">
                Student ID
              </th>
              <th scope="col" className="px-3 py-2 font-bold text-zinc-500">
                Messages
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {shown.map((r) => {
              const messages = rowErrorMessages(r.errors);
              return (
                <tr
                  key={r.row}
                  className={r.status === "error" ? "bg-rose-50/40" : ""}
                >
                  <td className="px-3 py-2 text-zinc-500">{r.row}</td>
                  <td className="px-3 py-2">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="px-3 py-2 text-zinc-900">{identity(r)}</td>
                  <td className="px-3 py-2 text-zinc-600 break-all">
                    {detail(r)}
                  </td>
                  <td className="px-3 py-2 font-mono text-zinc-600">
                    {newId(r)}
                  </td>
                  <td className="px-3 py-2 text-rose-700">
                    {messages.length ? (
                      <ul className="space-y-0.5">
                        {messages.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const STEPS = ["Choose file", "Preview", "Validate", "Import"] as const;

/**
 * Spreadsheet import: choose a .csv/.xlsx -> client preview -> dry run
 * (`dryRun: true`) -> import. The same `rows` payload is validated and
 * imported; changing the file or settings requires validating again.
 */
export default function BulkImportModal({
  kind,
  title,
  description,
  endpoint,
  extraBody = {},
  settingsHint,
  settings,
  allOrNothing = false,
  invalidate,
  renderSummaryExtra,
  onImported,
  onClose,
}: BulkImportModalProps) {
  const { canWrite } = useAdminGlobal();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [validation, setValidation] = useState<{
    key: string;
    result: BulkResponse;
  } | null>(null);
  const [finalResult, setFinalResult] = useState<BulkResponse | null>(null);
  const [failedImport, setFailedImport] = useState<BulkResponse | null>(null);
  const bulk = useBulkImport({ invalidate });
  const working = parsing || bulk.isPending;

  const headerInfo = useMemo(
    () => (sheet ? mapHeaders(kind, sheet.headers) : null),
    [kind, sheet],
  );
  const missing = useMemo(
    () => (headerInfo ? missingRequiredColumns(kind, headerInfo.mapped) : []),
    [kind, headerInfo],
  );
  const apiRows = useMemo(
    () => (sheet ? toApiRows(kind, sheet.headers, sheet.rows) : []),
    [kind, sheet],
  );
  const payloadKey = useMemo(
    () => JSON.stringify({ rows: apiRows, ...(extraBody ?? {}) }),
    [apiRows, extraBody],
  );

  const currentValidation =
    validation && validation.key === payloadKey ? validation.result : null;
  const staleValidation = !!validation && validation.key !== payloadKey;

  const step = finalResult
    ? 4
    : currentValidation
      ? 3
      : sheet
        ? 2
        : 1;

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    setParseError(null);
    setSheet(null);
    setValidation(null);
    setFailedImport(null);
    setFinalResult(null);
    bulk.reset();
    setFileName(file.name);
    setParsing(true);
    try {
      setSheet(await parseSpreadsheet(file));
    } catch (e) {
      setParseError(
        e instanceof SpreadsheetError
          ? e.message
          : "Could not read the file. Check that it is a valid .csv or .xlsx file.",
      );
    } finally {
      setParsing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (working) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  const run = async (phase: Phase) => {
    if (!sheet || !extraBody || missing.length || working) return;
    const body = {
      ...extraBody,
      rows: apiRows,
      ...(phase === "dryRun" ? { dryRun: true } : {}),
    };
    setFailedImport(null);
    try {
      const result = await bulk.mutateAsync({ url: endpoint, body });
      if (phase === "dryRun") {
        setValidation({ key: payloadKey, result });
      } else if (result.success === false) {
        // All-or-nothing endpoints reject the whole batch with row errors.
        setFailedImport(result);
      } else {
        setFinalResult(result);
        onImported?.(result);
      }
    } catch {
      // bulk.error is rendered below.
    }
  };

  const downloadResults = (result: BulkResponse) => {
    const rows = buildResultRows(apiRows, result.rows ?? []);
    const columns = resultColumns(headerInfo?.mapped ?? [], rows);
    downloadCsv(
      `${kind}-import-results`,
      rows,
      columns.map((header) => ({ header, value: (r) => r[header] })),
    );
  };

  const importBlockedReason = !canWrite
    ? "You have read-only access."
    : !currentValidation
      ? staleValidation
        ? "The file or settings changed. Validate again."
        : "Validate the file first."
      : allOrNothing && hasRowErrors(currentValidation)
        ? "Fix the rows with errors and upload the file again; nothing is imported while any row fails."
        : importableRows(currentValidation) === 0 &&
            (currentValidation.rows?.length ?? 0) > 0
          ? "There are no new rows to import."
          : null;

  const statusMessage = parsing
    ? "Reading file..."
    : bulk.isPending
      ? "Working, please wait..."
      : finalResult
        ? "Import complete."
        : failedImport
          ? "Import rejected. Nothing was imported."
          : currentValidation
            ? `Validation complete: ${currentValidation.rows?.length ?? 0} rows checked, ${
                (currentValidation.rows ?? []).filter(
                  (r) => r.status === "error",
                ).length
              } with errors.`
            : sheet
              ? `${sheet.rows.length} rows ready to validate.`
              : "";

  const shownResult = finalResult ?? failedImport ?? currentValidation;
  const phaseOfShown: Phase =
    finalResult || failedImport ? "import" : "dryRun";

  return (
    <Modal title={title} onClose={onClose} size="xl">
      <div className="space-y-6">
        <ol className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider">
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={step === i + 1 ? "step" : undefined}
              className={cn(
                "px-3 py-1 rounded-full border",
                step === i + 1
                  ? "bg-black text-white border-black"
                  : step > i + 1
                    ? "bg-zinc-100 text-zinc-700 border-zinc-100"
                    : "text-zinc-400 border-zinc-200",
              )}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        <p role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </p>

        {description && (
          <div className="text-sm text-zinc-600">{description}</div>
        )}

        {settings && !finalResult && (
          <fieldset disabled={working} className="space-y-4">
            {settings}
          </fieldset>
        )}

        {!finalResult && (
          <section aria-label="Choose file" className="space-y-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!working) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "p-6 border-2 border-dashed rounded-2xl text-center space-y-3 transition-colors",
                dragging ? "border-black bg-zinc-50" : "border-zinc-200",
              )}
            >
              <FileSpreadsheet
                size={28}
                className="mx-auto text-zinc-400"
                aria-hidden="true"
              />
              <p className="text-sm text-zinc-600">
                {fileName ? (
                  <>
                    <strong className="text-zinc-900">{fileName}</strong>
                    {sheet ? ` - ${sheet.rows.length} rows` : ""}
                  </>
                ) : (
                  "Drag and drop a .csv or .xlsx file here, or"
                )}
              </p>
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                // display:none keeps it out of the dialog's focus trap; the
                // button below opens it.
                className="hidden"
                tabIndex={-1}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                type="button"
                disabled={working}
                data-autofocus={settings ? undefined : true}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50"
              >
                <Upload size={16} aria-hidden="true" />
                {fileName ? "Choose another file" : "Choose file"}
              </button>
              <p className="text-[11px] text-zinc-500">
                .csv or .xlsx (first sheet), header row first, max{" "}
                {MAX_IMPORT_ROWS} rows and 2 MB. {REQUIRED_RULE[kind]}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-zinc-500">Download template:</span>
              {(["csv", "xlsx"] as TemplateFormat[]).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => downloadTemplate(kind, format)}
                  className="inline-flex items-center gap-1 font-semibold text-black hover:underline"
                >
                  <Download size={12} aria-hidden="true" />
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
            <FormError message={parseError} />
          </section>
        )}

        {sheet && headerInfo && !finalResult && (
          <section aria-label="Preview" className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
              Preview{" "}
              <span className="font-normal normal-case tracking-normal text-zinc-500">
                ({Math.min(PREVIEW_ROWS, sheet.rows.length)} of{" "}
                {sheet.rows.length} rows)
              </span>
            </h3>
            {missing.length > 0 && (
              <p
                role="alert"
                className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-100"
              >
                <AlertTriangle
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />
                Missing required column{missing.length > 1 ? "s" : ""}:{" "}
                {missing.join(", ")}. Use the template headers.
              </p>
            )}
            {(headerInfo.unmapped.length > 0 ||
              headerInfo.duplicates.length > 0) && (
              <p className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-100">
                <AlertTriangle
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {headerInfo.unmapped.length > 0 && (
                    <>
                      Ignored columns (not recognised):{" "}
                      {headerInfo.unmapped.join(", ")}.{" "}
                    </>
                  )}
                  {headerInfo.duplicates.length > 0 && (
                    <>
                      Duplicate columns (only the first is used):{" "}
                      {headerInfo.duplicates.join(", ")}.
                    </>
                  )}
                </span>
              </p>
            )}
            <div className="max-h-72 overflow-auto border border-zinc-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  First {PREVIEW_ROWS} rows of the uploaded file
                </caption>
                <thead className="sticky top-0 bg-zinc-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-zinc-500">
                      #
                    </th>
                    {headerInfo.mapping.map(({ header, key }) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-3 py-2 align-bottom whitespace-nowrap"
                      >
                        <span className="block font-bold text-zinc-700">
                          {header}
                        </span>
                        <span
                          className={cn(
                            "block text-[10px] font-mono",
                            key ? "text-emerald-700" : "text-amber-700",
                          )}
                        >
                          {key ? `-> ${key}` : "ignored"}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {sheet.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5 text-zinc-400">{i + 1}</td>
                      {headerInfo.mapping.map(({ header, key }) => (
                        <td
                          key={header}
                          className={cn(
                            "px-3 py-1.5 whitespace-nowrap",
                            key ? "text-zinc-800" : "text-zinc-400",
                          )}
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <FormError message={bulk.error?.message} />

        {shownResult && (
          <section
            aria-label={
              phaseOfShown === "dryRun" ? "Validation results" : "Import results"
            }
            className="space-y-3"
          >
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
              {finalResult ? (
                <>
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600"
                    aria-hidden="true"
                  />
                  Import complete
                </>
              ) : failedImport ? (
                "Import rejected - nothing was imported"
              ) : (
                "Validation results (nothing saved yet)"
              )}
            </h3>
            {(shownResult.error || shownResult.message) &&
              !finalResult && (
                <p className="text-sm text-zinc-700">
                  {shownResult.error ?? shownResult.message}
                </p>
              )}
            <SummaryCounts result={shownResult} />
            {renderSummaryExtra?.(shownResult, phaseOfShown)}
            {shownResult.rows && shownResult.rows.length > 0 && (
              <ResultTable
                key={`${phaseOfShown}-${finalResult ? "final" : "check"}`}
                results={shownResult.rows}
                apiRows={apiRows}
                kind={kind}
              />
            )}
            <button
              type="button"
              onClick={() => downloadResults(shownResult)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-black hover:underline"
            >
              <Download size={12} aria-hidden="true" />
              Download results (CSV)
            </button>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          {finalResult ? (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800"
            >
              Done
            </button>
          ) : (
            <>
              {(!extraBody && settingsHint) || importBlockedReason ? (
                <p className="text-xs text-zinc-500 mr-auto">
                  {!extraBody && settingsHint
                    ? settingsHint
                    : sheet
                      ? importBlockedReason
                      : null}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => run("dryRun")}
                disabled={
                  !sheet || !extraBody || missing.length > 0 || working
                }
                aria-busy={
                  (bulk.isPending && !!bulk.variables?.body.dryRun) ||
                  undefined
                }
                className="px-5 py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-40"
              >
                {bulk.isPending && bulk.variables?.body.dryRun
                  ? "Validating..."
                  : currentValidation
                    ? "Validate again"
                    : "Validate"}
              </button>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => run("import")}
                  disabled={!!importBlockedReason || working || !extraBody}
                  aria-busy={
                    (bulk.isPending && !bulk.variables?.body.dryRun) ||
                    undefined
                  }
                  className="px-5 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-40"
                >
                  {bulk.isPending && !bulk.variables?.body.dryRun
                    ? "Importing..."
                    : "Import"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Field list for help text, e.g. in a description. */
export const fieldList = (kind: ImportKind) =>
  IMPORT_FIELDS[kind].map((f) => f.key).join(", ");
