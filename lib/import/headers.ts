import { IMPORT_FIELDS, ImportKind } from "./fields";

/** "First Name" / "first_name" / "FIRST-NAME" -> "firstname". */
export const normaliseHeaderKey = (header: string) =>
  header
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const buildAliasMap = (kind: ImportKind) => {
  const map = new Map<string, string>();
  for (const field of IMPORT_FIELDS[kind]) {
    for (const spelling of [field.key, field.label, ...(field.aliases ?? [])]) {
      map.set(normaliseHeaderKey(spelling), field.key);
    }
  }
  return map;
};

const ALIAS_MAPS: Record<ImportKind, Map<string, string>> = {
  students: buildAliasMap("students"),
  enrollments: buildAliasMap("enrollments"),
};

/** Canonical API field for a spreadsheet header, or null if unknown for `kind`. */
export const canonicalHeader = (kind: ImportKind, header: string) =>
  ALIAS_MAPS[kind].get(normaliseHeaderKey(header)) ?? null;

export interface HeaderMapping {
  /** Original header -> canonical key (null = unmapped / ignored). */
  mapping: Array<{ header: string; key: string | null }>;
  /** Canonical keys that were found. */
  mapped: string[];
  /** Headers that did not match any field (ignored on import). */
  unmapped: string[];
  /** Canonical keys that appear under more than one header (first wins). */
  duplicates: string[];
}

export const mapHeaders = (
  kind: ImportKind,
  headers: readonly string[],
): HeaderMapping => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  const mapping = headers.map((header) => {
    const key = header.trim() ? canonicalHeader(kind, header) : null;
    if (key) {
      if (seen.has(key)) {
        duplicates.add(key);
        return { header, key: null };
      }
      seen.add(key);
    }
    return { header, key };
  });
  return {
    mapping,
    mapped: [...seen],
    unmapped: mapping
      .filter((m) => !m.key && m.header.trim() && !duplicates.has(canonicalHeader(kind, m.header) ?? ""))
      .map((m) => m.header),
    duplicates: [...duplicates],
  };
};

/**
 * Converts parsed rows (keyed by original header) into API rows keyed by
 * canonical field, dropping unmapped columns and empty cells.
 */
export const toApiRows = (
  kind: ImportKind,
  headers: readonly string[],
  rows: ReadonlyArray<Record<string, string>>,
): Array<Record<string, string>> => {
  const { mapping } = mapHeaders(kind, headers);
  return rows.map((row) => {
    const out: Record<string, string> = {};
    for (const { header, key } of mapping) {
      if (!key) continue;
      const value = row[header];
      if (value !== undefined && value !== "") out[key] = value;
    }
    return out;
  });
};
