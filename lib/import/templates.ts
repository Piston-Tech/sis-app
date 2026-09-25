import { IMPORT_FIELDS, ImportKind } from "./fields";

export type TemplateFormat = "csv" | "xlsx";

/** Exact template headers (API field names) for a kind. */
export const templateHeaders = (kind: ImportKind) =>
  IMPORT_FIELDS[kind].map((f) => f.key);

/** Header row + one example row. */
export const templateMatrix = (kind: ImportKind): string[][] => [
  templateHeaders(kind),
  IMPORT_FIELDS[kind].map((f) => f.example),
];

// Template cells are our own constants, so no formula-injection prefixing
// (which would turn "+234..." into "'+234...").
const csvCell = (cell: string) =>
  /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;

export const templateCsv = (kind: ImportKind) =>
  templateMatrix(kind)
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

const FILE_NAMES: Record<ImportKind, string> = {
  students: "students-import-template",
  enrollments: "enrollments-import-template",
};

const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/** Downloads the import template for `kind` as CSV or XLSX (browser only). */
export const downloadTemplate = async (kind: ImportKind, format: TemplateFormat) => {
  const name = `${FILE_NAMES[kind]}.${format}`;
  if (format === "csv") {
    saveBlob(
      new Blob(["\uFEFF" + templateCsv(kind)], { type: "text/csv;charset=utf-8" }),
      name,
    );
    return;
  }
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const [headers, example] = templateMatrix(kind);
  const blob = await writeXlsxFile(
    [
      headers.map((value) => ({ value, fontWeight: "bold" as const })),
      example.map((value) => ({ value, type: String })),
    ],
    { columns: headers.map(() => ({ width: 22 })), sheet: "Import" },
  ).toBlob();
  saveBlob(blob, name);
};
