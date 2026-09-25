import { NextResponse } from "next/server";

/** `{ success: false, error }` with the given status (never raw error objects). */
export const errorResponse = (status: number, error: string) =>
  NextResponse.json(
    { success: false, error },
    { status, headers: { "Cache-Control": "no-store" } },
  );

// Shown to students and admins, so plain language rather than status jargon
export const internalError = () =>
  errorResponse(500, "Something went wrong on our side. Please try again.");

export const backendUnavailable = () =>
  errorResponse(
    503,
    "We can't reach our servers right now. Please try again in a few minutes.",
  );

/** fetch() rejects with a TypeError when the backend is down or unreachable */
const isNetworkError = (error: unknown) =>
  error instanceof TypeError && /fetch failed|network/i.test(error.message);

/**
 * Wraps a route handler: any thrown error is logged server-side and turned
 * into a generic 500 so stack traces / backend details never reach the client.
 */
export const withErrorHandling =
  <Args extends unknown[]>(
    label: string,
    handler: (...args: Args) => Promise<Response>,
  ) =>
  async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`[api] ${label} failed:`, error);
      return isNetworkError(error) ? backendUnavailable() : internalError();
    }
  };
