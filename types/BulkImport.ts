/** Spreadsheet row for POST /admin/students/bulk. */
export interface BulkStudentRow {
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  /** ORG code, numeric id or exact company name. */
  company?: string;
  membershipTier?: string;
  persona?: string;
}

/** Spreadsheet row for the transaction / enrollment bulk endpoints. */
export interface BulkEnrollmentRow {
  /** STD code of an existing student. */
  studentId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  /** CLS code. */
  class: string;
  /** Tier name, short name or id. */
  tier: string;
  delivery?: string;
  cba?: string;
  status?: string;
}

export type BulkRowStatus =
  | "created"
  | "would_create"
  | "skipped_existing"
  | "ok"
  | "error";

/** Per-field messages ({ email: "..." }) or a list of messages. */
export type BulkRowErrors = Record<string, string> | string[] | string;

export interface BulkRowResult {
  /** 1-based data row number (header excluded). */
  row: number;
  status: BulkRowStatus;
  errors?: BulkRowErrors;
  // students
  studentId?: string | number;
  id?: number;
  email?: string;
  existingStudentId?: string | number;
  // enrollments
  studentCreated?: boolean;
  classId?: string | number;
  tier?: string | number;
}

export interface BulkStudentsSummary {
  total: number;
  created: number;
  skipped: number;
  failed: number;
}

export interface BulkEnrollmentsSummary {
  rows: number;
  enrollments: number;
  studentsCreated: number;
  studentsMatched: number;
}

export interface BulkResponse {
  success: boolean;
  error?: string;
  message?: string;
  summary?: Partial<BulkStudentsSummary & BulkEnrollmentsSummary>;
  rows?: BulkRowResult[];
  // transaction bulk
  transaction?: { id: number; transactionId: string; total?: number } | null;
  computedTotal?: number;
  priceDifference?: number;
}
