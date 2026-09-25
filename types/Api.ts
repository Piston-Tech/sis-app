// Response envelopes returned by sis-backend and passed through unchanged by
// the /api route handlers.

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Field-level validation errors (400): `{ field: message }`. */
export type FieldErrors = Record<string, string>;

export interface ApiError {
  success: false;
  error?: string;
  errors?: FieldErrors;
  message?: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Collection GET: `?page=&limit=&sort=&order=` plus filters. */
export interface Paginated<T> extends ApiSuccess<T[]> {
  pagination: Pagination;
}

export interface ListQuery {
  page?: number;
  /** Max 100, backend default 20 */
  limit?: number;
  sort?: string;
  order?: "asc" | "desc" | "ASC" | "DESC";
}
