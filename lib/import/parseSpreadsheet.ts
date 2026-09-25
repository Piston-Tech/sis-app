import Papa from "papaparse";

export const MAX_IMPORT_ROWS = 1000;
export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".csv", ".xlsx"] as const;

export interface ParsedSheet {
  /** Header row as written in the file (trimmed, de-duplicated). */
  headers: string[];
  /** Data rows keyed by header; every cell is a trimmed string. */
  rows: Record<string, string>[];
}

/** User-facing parse failure (bad type, too big, too many rows, malformed). */
export class SpreadsheetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpreadsheetError";
  }
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Any spreadsheet cell -> trimmed string (dates as yyyy-mm-dd). */
export const cellToString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return "";
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  const text = String(value).trim();
  // Undo the formula-injection guard of our own CSV exports ('+234... -> +234...).
  return /^'[=+\-@]/.test(text) ? text.slice(1) : text;
};

/**
 * Raw cell matrix -> headers + row objects. The first non-empty row is the
 * header row; fully empty rows are skipped; more than MAX_IMPORT_ROWS data
 * rows is an error.
 */
export const matrixToSheet = (
  matrix: ReadonlyArray<ReadonlyArray<unknown>>,
): ParsedSheet => {
  const cells = matrix.map((row) => (row ?? []).map(cellToString));
  const isEmpty = (row: string[]) => row.every((c) => c === "");

  const headerIndex = cells.findIndex((row) => !isEmpty(row));
  if (headerIndex === -1) {
    throw new SpreadsheetError("The file is empty.");
  }

  const rawHeaders = cells[headerIndex].map((h) => h.replace(/^\uFEFF/, "").trim());
  // Drop trailing blank header cells.
  while (rawHeaders.length && rawHeaders[rawHeaders.length - 1] === "") rawHeaders.pop();

  const used = new Map<string, number>();
  const headers = rawHeaders.map((h, i) => {
    const base = h || `Column ${i + 1}`;
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });

  const dataRows = cells.slice(headerIndex + 1).filter((row) => !isEmpty(row));
  if (dataRows.length === 0) {
    throw new SpreadsheetError("The file has a header row but no data rows.");
  }
  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new SpreadsheetError(
      `The file has ${dataRows.length} data rows; the maximum is ${MAX_IMPORT_ROWS}. Split it into smaller files.`,
    );
  }

  const rows = dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = row[i] ?? "";
    });
    return record;
  });

  return { headers, rows };
};

/** Parses CSV text (header row first). */
export const parseCsvText = (text: string): ParsedSheet => {
  const result = Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), {
    header: false,
    skipEmptyLines: "greedy",
  });
  // Delimiter warnings are expected for single-column files; only an
  // unbalanced quote makes the data untrustworthy.
  const quoteError = result.errors.find((e) => e.type === "Quotes");
  if (quoteError) {
    throw new SpreadsheetError(
      `The CSV file has an unclosed quote${quoteError.row !== undefined ? ` near row ${quoteError.row + 1}` : ""}.`,
    );
  }
  return matrixToSheet(result.data);
};

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
};

export type XlsxReader = (file: Blob) => Promise<ReadonlyArray<ReadonlyArray<unknown>>>;

// Loaded on demand so the xlsx parser only ships to pages that import files.
const defaultXlsxReader: XlsxReader = async (file) => {
  const { readSheet } = await import("read-excel-file/browser");
  return readSheet(file);
};

/**
 * Reads an uploaded .csv or .xlsx (first sheet) into headers + string rows.
 * Throws SpreadsheetError with a user-facing message on any problem.
 */
export const parseSpreadsheet = async (
  file: Blob & { name: string },
  { readXlsx = defaultXlsxReader }: { readXlsx?: XlsxReader } = {},
): Promise<ParsedSheet> => {
  const ext = extensionOf(file.name);
  if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new SpreadsheetError("Unsupported file type. Upload a .csv or .xlsx file.");
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new SpreadsheetError(
      `The file is ${(file.size / 1024 / 1024).toFixed(1)} MB; the maximum is 2 MB.`,
    );
  }
  if (file.size === 0) throw new SpreadsheetError("The file is empty.");

  if (ext === ".csv") return parseCsvText(await file.text());

  let matrix: ReadonlyArray<ReadonlyArray<unknown>>;
  try {
    matrix = await readXlsx(file);
  } catch {
    throw new SpreadsheetError(
      "Could not read the Excel file. Make sure it is a valid .xlsx workbook (not .xls).",
    );
  }
  return matrixToSheet(matrix);
};
