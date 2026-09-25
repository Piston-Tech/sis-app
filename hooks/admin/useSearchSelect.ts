import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  AdminResource,
  ApiError,
  SEARCH_MIN_CHARS,
  adminKeys,
  adminRequest,
  buildQuery,
} from "./api";

/**
 * Typeahead search: GET /admin/<resource>/search?q=<q> (debounced 300ms,
 * only once q has >= 2 characters). Out-of-order responses are handled by
 * the query cache: only the result for the current key is ever shown.
 */
export function useSearchSelect<T>(
  resource: AdminResource,
  q: string,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const [debounced] = useDebounce(q.trim(), 300);
  const active = enabled && debounced.length >= SEARCH_MIN_CHARS;

  const query = useQuery<T[], ApiError>({
    queryKey: adminKeys.search(resource, debounced),
    enabled: active,
    queryFn: async () => {
      const body = await adminRequest<T[]>(
        "get",
        `/admin/${resource}/search${buildQuery({ q: debounced })}`,
      );
      return Array.isArray(body.data) ? body.data : [];
    },
  });

  return {
    options: active ? (query.data ?? []) : [],
    isSearching: active && query.isFetching,
    error: active ? query.error : null,
    /** Whether the (debounced) term is long enough to search. */
    active,
  };
}

/**
 * Resolves a pre-selected id to its display record via the existing
 * GET /admin/<resource>/search?id=<id> endpoint (returns a single object).
 */
export function useSearchSelected<T>(
  resource: AdminResource,
  id: number | undefined,
) {
  const query = useQuery<T | null, ApiError>({
    queryKey: adminKeys.byId(resource, id ?? 0),
    enabled: !!id,
    queryFn: async () => {
      const body = await adminRequest<T>(
        "get",
        `/admin/${resource}/search${buildQuery({ id })}`,
      );
      return body.data ?? null;
    },
  });

  return { selected: query.data ?? undefined, isLoading: query.isFetching };
}

export default useSearchSelect;
