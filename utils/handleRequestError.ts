import type { FieldErrors } from "@/types/Api";

interface RequestErrorLike {
  message?: string;
  response?: {
    status?: number;
    headers?: Record<string, unknown>;
    data?: { error?: unknown; errors?: unknown; message?: unknown };
  };
}

const isFieldErrors = (value: unknown): value is FieldErrors =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Routes an axios error to form state: field errors (400 `{ errors }`) go to
 * setErrors, anything else becomes a single message for setError.
 */
const handleRequestError = (
  e: unknown,
  setError: (error: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- callers pass typed per-form setters
  setErrors: (errors: any) => void,
) => {
  const err = (e ?? {}) as RequestErrorLike;
  const { errors, error, message } = err.response?.data ?? {};

  if (isFieldErrors(errors)) {
    setErrors(errors);
    return;
  }

  if (err.response?.status === 429) {
    const retryAfter = Number(err.response.headers?.["retry-after"]);
    setError(
      typeof error === "string" && error
        ? error
        : Number.isFinite(retryAfter) && retryAfter > 0
          ? `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`
          : "Too many attempts. Please try again later.",
    );
    return;
  }

  setError(
    (typeof error === "string" && error) ||
      (typeof message === "string" && message) ||
      err.message ||
      "Network error",
  );
};

export default handleRequestError;
