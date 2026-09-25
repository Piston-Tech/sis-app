import { isAxiosError } from "axios";

export const RATE_LIMIT_MESSAGE = "Too many attempts, try again in a minute.";

type ErrorBody = {
  success?: boolean;
  error?: unknown;
  message?: unknown;
  errors?: Record<string, unknown>;
};

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

/** HTTP status of a failed request, if any. */
export const getErrorStatus = (error: unknown): number | undefined => {
  if (isAxiosError(error)) return error.response?.status;
  if (error instanceof ApiError) return error.status;
  return undefined;
};

/** Field errors (`{ errors: { field: message } }`) from a failed request. */
export const getFieldErrors = (error: unknown): Record<string, string> => {
  const body: ErrorBody | undefined = isAxiosError(error)
    ? (error.response?.data as ErrorBody | undefined)
    : error instanceof ApiError
      ? error.body
      : undefined;

  const result: Record<string, string> = {};
  if (body?.errors && typeof body.errors === "object") {
    Object.entries(body.errors).forEach(([field, message]) => {
      const text = asString(message);
      if (text) result[field] = text;
    });
  }
  return result;
};

/** A single, human-readable message for any failed request. */
export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (getErrorStatus(error) === 429) return RATE_LIMIT_MESSAGE;

  if (isAxiosError(error)) {
    const body = error.response?.data as ErrorBody | undefined;
    const fieldMessage = Object.values(getFieldErrors(error))[0];
    if (!error.response) {
      return "We couldn't reach the server. Check your connection and try again.";
    }
    return (
      asString(body?.error) ?? fieldMessage ?? asString(body?.message) ?? fallback
    );
  }

  if (error instanceof ApiError) {
    return (
      asString(error.body?.error) ??
      Object.values(getFieldErrors(error))[0] ??
      asString(error.body?.message) ??
      fallback
    );
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/** Error thrown for non-2xx `fetch` responses (used where axios isn't). */
export class ApiError extends Error {
  status: number;
  body?: ErrorBody;

  constructor(status: number, body?: ErrorBody) {
    super(
      status === 429
        ? RATE_LIMIT_MESSAGE
        : (asString(body?.error) ?? asString(body?.message) ?? "Request failed"),
    );
    this.status = status;
    this.body = body;
  }
}
