import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import {
  AdminResource,
  ApiError,
  DEFAULT_LIMIT,
  ListResult,
  MAX_LIMIT,
  QueryValue,
  SEARCH_MIN_CHARS,
  adminKeys,
  adminRequest,
  buildQuery,
} from "./api";

export interface ResourceListParams {
  page?: number;
  limit?: number;
  /**
   * Free-text search. When it has at least 2 characters the hook calls
   * /admin/<resource>/search?q= (max 15 results, no pagination) instead of
   * the paginated list. Debounced internally.
   */
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  /** Simple equality filters, e.g. { status: "PENDING" }. */
  filters?: Record<string, QueryValue>;
  enabled?: boolean;
}

/**
 * Paginated admin collection. Response contract:
 * `{ success, data: T[], pagination: { page, limit, total, totalPages } }`.
 */
export function useResourceList<T>(
  resource: AdminResource,
  {
    page = 1,
    limit = DEFAULT_LIMIT,
    search = "",
    sort,
    order,
    filters,
    enabled = true,
  }: ResourceListParams = {},
) {
  const [debouncedSearch] = useDebounce(search.trim(), 300);
  const isSearch = debouncedSearch.length >= SEARCH_MIN_CHARS;
  const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT);

  const params: Record<string, QueryValue> = isSearch
    ? { q: debouncedSearch }
    : { page, limit: safeLimit, sort, order, ...filters };

  const query = useQuery<
    ListResult<T> & { serverPagination: boolean },
    ApiError
  >({
    queryKey: isSearch
      ? adminKeys.search(resource, debouncedSearch)
      : adminKeys.list(resource, params),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const url = isSearch
        ? `/admin/${resource}/search${buildQuery({ q: debouncedSearch })}`
        : `/admin/${resource}${buildQuery(params)}`;
      const body = await adminRequest<T[]>("get", url);
      const items = Array.isArray(body.data) ? body.data : [];
      const pagination = body.pagination ?? {
        page: isSearch ? 1 : page,
        limit: isSearch ? items.length : safeLimit,
        // -1 = unknown total (API omitted pagination).
        total: isSearch ? items.length : -1,
        // Unknown total: allow paging forward while pages come back full.
        totalPages: isSearch ? 1 : items.length < safeLimit ? page : page + 1,
      };
      return { items, pagination, serverPagination: !!body.pagination };
    },
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    /** False when the API omitted `pagination` (totals are then estimates). */
    hasServerPagination: query.data?.serverPagination ?? false,
    isSearch,
    /** True on the very first load (no data yet). */
    isLoading: query.isLoading,
    /** True whenever a request is in flight (including page changes). */
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useResourceList;
