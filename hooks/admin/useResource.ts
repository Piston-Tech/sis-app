import { useQuery } from "@tanstack/react-query";
import { AdminResource, ApiError, adminKeys, adminRequest } from "./api";

/** Single admin record: GET /admin/<resource>/<id>. */
export function useResource<T>(
  resource: AdminResource,
  id: string | number | null | undefined,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const hasId = id !== null && id !== undefined && id !== "" && id !== 0;

  const query = useQuery<T, ApiError>({
    queryKey: adminKeys.detail(resource, hasId ? id : "none"),
    enabled: enabled && hasId,
    queryFn: async () => {
      const body = await adminRequest<T>(
        "get",
        `/admin/${resource}/${encodeURIComponent(String(id))}`,
      );
      return body.data;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useResource;
