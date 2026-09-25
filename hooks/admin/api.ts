import apiClient from "@/services/apiClient";
import { isAxiosError } from "axios";

/** Resources exposed under /api/admin/<resource>. */
export type AdminResource =
  | "students"
  | "companies"
  | "courses"
  | "classes"
  | "transactions"
  | "payments"
  | "enrollments"
  | "tiers";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResult<T> {
  items: T[];
  pagination: Pagination;
}

export type FieldErrors = Record<string, string>;

/** Normalised error for every admin API failure. */
export class ApiError extends Error {
  status: number | undefined;
  fieldErrors: FieldErrors | undefined;

  constructor(
    message: string,
    status?: number,
    fieldErrors?: FieldErrors | undefined,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested record was not found.",
  409: "This record has dependent records and cannot be changed or deleted.",
  429: "Too many requests. Please wait a moment and try again.",
  502: "An upstream service failed. Please try again.",
};

/** Converts anything thrown by axios / the API into an ApiError. */
export const toApiError = (e: unknown): ApiError => {
  if (e instanceof ApiError) return e;

  if (isAxiosError(e)) {
    const status = e.response?.status;
    const body = (e.response?.data ?? {}) as {
      error?: unknown;
      message?: unknown;
      errors?: unknown;
    };
    const fieldErrors =
      body.errors && typeof body.errors === "object"
        ? (body.errors as FieldErrors)
        : undefined;
    const serverMessage =
      typeof body.error === "string"
        ? body.error
        : typeof body.message === "string" && status && status >= 400
          ? body.message
          : undefined;
    const message =
      // 409 always explains dependent records unless the server was specific
      serverMessage ??
      (status ? STATUS_MESSAGES[status] : undefined) ??
      (fieldErrors ? "Please fix the highlighted fields." : undefined) ??
      (e.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : "Network error. Please check your connection.");
    return new ApiError(message, status, fieldErrors);
  }

  if (e instanceof Error) return new ApiError(e.message);
  return new ApiError("Something went wrong.");
};

/** Throws when a 2xx response still reports `success: false`. */
const unwrap = <T>(body: {
  success?: boolean;
  data?: T;
  error?: string;
  errors?: FieldErrors;
  message?: string;
}) => {
  if (body && body.success === false) {
    throw new ApiError(
      body.error ??
        (body.errors ? "Please fix the highlighted fields." : undefined) ??
        body.message ??
        "Request failed.",
      undefined,
      body.errors,
    );
  }
  return body;
};

export type QueryValue = string | number | boolean | null | undefined;

export const buildQuery = (params: Record<string, QueryValue>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

export interface AdminRequestOptions {
  /** Request timeout in ms (default: the apiClient default, 10s). */
  timeout?: number;
}

export const adminRequest = async <T = unknown>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  body?: unknown,
  options: AdminRequestOptions = {},
): Promise<{ data: T; message?: string; pagination?: Pagination }> => {
  const config = options.timeout ? { timeout: options.timeout } : undefined;
  try {
    const response =
      method === "get" || method === "delete"
        ? await apiClient[method](url, config)
        : await apiClient[method](url, body ?? {}, config);
    return unwrap(response.data) as {
      data: T;
      message?: string;
      pagination?: Pagination;
    };
  } catch (e) {
    throw toApiError(e);
  }
};

/** Query-key factory. Everything for a resource lives under ["admin", resource]. */
export const adminKeys = {
  all: ["admin"] as const,
  resource: (resource: AdminResource) => ["admin", resource] as const,
  list: (resource: AdminResource, params: Record<string, QueryValue>) =>
    ["admin", resource, "list", params] as const,
  detail: (resource: AdminResource, id: string | number) =>
    ["admin", resource, "detail", String(id)] as const,
  search: (resource: AdminResource, q: string) =>
    ["admin", resource, "search", q] as const,
  byId: (resource: AdminResource, id: string | number) =>
    ["admin", resource, "byId", String(id)] as const,
  /** Nested under "companies" so company invalidation refreshes contacts. */
  companyContacts: (companyId: string | number) =>
    ["admin", "companies", "contacts", String(companyId)] as const,
  /** Nested under "payments" so payment invalidation refreshes previews. */
  receiptPreview: (paymentId: string | number) =>
    ["admin", "payments", "receipt-preview", String(paymentId)] as const,
};

export const MAX_LIMIT = 100;
export const DEFAULT_LIMIT = 20;
export const SEARCH_MIN_CHARS = 2;
