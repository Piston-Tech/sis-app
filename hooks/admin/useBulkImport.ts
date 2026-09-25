import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import apiClient from "@/services/apiClient";
import { BulkResponse } from "@/types/BulkImport";
import { AdminResource, ApiError, adminKeys, toApiError } from "./api";

/** Bulk calls can process up to 1000 rows; give them more than the 10s default. */
export const BULK_TIMEOUT_MS = 120_000;

const isBulkBody = (value: unknown): value is BulkResponse =>
  !!value &&
  typeof value === "object" &&
  (Array.isArray((value as BulkResponse).rows) ||
    typeof (value as BulkResponse).summary === "object");

/**
 * POSTs a bulk payload. Row-level failures (a 2xx with success:false, or a
 * 400 whose body still carries `rows`/`summary`, as the all-or-nothing
 * transaction import does) resolve with the body so the UI can show per-row
 * errors; everything else rejects with an ApiError.
 */
export const postBulk = async (
  url: string,
  body: unknown,
): Promise<BulkResponse> => {
  try {
    const res = await apiClient.post(url, body, { timeout: BULK_TIMEOUT_MS });
    const data: unknown = res.data;
    if (isBulkBody(data)) return data;
    const other = (data ?? {}) as Partial<BulkResponse>;
    if (other.success === false)
      throw new ApiError(other.error ?? other.message ?? "Request failed.");
    return { success: true, ...other };
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 400) {
      const data = e.response.data;
      if (isBulkBody(data)) return { ...data, success: false };
    }
    if (e instanceof ApiError) throw e;
    throw toApiError(e);
  }
};

export interface BulkVars {
  url: string;
  body: Record<string, unknown>;
}

/** Mutation around postBulk; invalidates `invalidate` after a real (non-dry) run. */
export function useBulkImport({
  invalidate = [],
}: {
  invalidate?: AdminResource[];
}) {
  const queryClient = useQueryClient();
  return useMutation<BulkResponse, ApiError, BulkVars>({
    mutationFn: ({ url, body }) => postBulk(url, body),
    onSuccess: async (_data, vars) => {
      if (vars.body.dryRun) return;
      await Promise.all(
        invalidate.map((resource) =>
          queryClient.invalidateQueries({
            queryKey: adminKeys.resource(resource),
          }),
        ),
      );
    },
  });
}
