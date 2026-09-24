export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

const escapeCell = (raw: string | number | boolean | null | undefined) => {
  let cell = raw === null || raw === undefined ? "" : String(raw);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(cell)) cell = `'${cell}`;
  return /[",\n\r]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
};

export const toCsv = <T>(rows: T[], columns: CsvColumn<T>[]) =>
  [
    columns.map((c) => escapeCell(c.header)).join(","),
    ...rows.map((row) =>
      columns.map((c) => escapeCell(c.value(row))).join(","),
    ),
  ].join("\r\n");

/** Client-side CSV export of the rows currently loaded in a table. */
export const downloadCsv = <T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
) => {
  const blob = new Blob(["﻿" + toCsv(rows, columns)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
