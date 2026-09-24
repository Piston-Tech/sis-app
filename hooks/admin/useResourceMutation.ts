import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminResource, ApiError, adminKeys, adminRequest } from "./api";

type Method = "post" | "put" | "patch" | "delete";

export interface AdminMutationRequest {
  method: Method;
  url: string;
  body?: unknown;
}

export interface MutationResult<T> {
  data: T;
  message?: string;
}

/**
 * Low-level mutation for any admin endpoint. `invalidate` lists the resources
 * whose cached queries (lists, details, searches) are refetched on success.
 */
export function useAdminMutation<TVars, TData = unknown>(
  toRequest: (vars: TVars) => AdminMutationRequest,
  { invalidate = [] }: { invalidate?: AdminResource[] } = {},
) {
  const queryClient = useQueryClient();

  return useMutation<MutationResult<TData>, ApiError, TVars>({
    mutationFn: async (vars) => {
      const { method, url, body } = toRequest(vars);
      const res = await adminRequest<TData>(method, url, body);
      return { data: res.data, message: res.message };
    },
    onSuccess: async () => {
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

const path = (resource: AdminResource, id?: number | string) =>
  id === undefined
    ? `/admin/${resource}`
    : `/admin/${resource}/${encodeURIComponent(String(id))}`;

/**
 * CRUD mutations for a resource:
 * - create: POST   /admin/<resource>        body
 * - update: PUT    /admin/<resource>/<id>   body
 * - remove: DELETE /admin/<resource>/<id>
 * Each invalidates the resource (plus `alsoInvalidate`) on success.
 */
export function useResourceMutation<TBody, TData = unknown>(
  resource: AdminResource,
  { alsoInvalidate = [] }: { alsoInvalidate?: AdminResource[] } = {},
) {
  const invalidate = [resource, ...alsoInvalidate];

  const create = useAdminMutation<TBody, TData>(
    (body) => ({ method: "post", url: path(resource), body }),
    { invalidate },
  );

  const update = useAdminMutation<{ id: number | string; body: TBody }, TData>(
    ({ id, body }) => ({ method: "put", url: path(resource, id), body }),
    { invalidate },
  );

  const remove = useAdminMutation<number | string, TData>(
    (id) => ({ method: "delete", url: path(resource, id) }),
    { invalidate },
  );

  return { create, update, remove };
}

export default useResourceMutation;
