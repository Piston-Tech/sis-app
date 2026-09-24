import { useQuery } from "@tanstack/react-query";
import { CompanyContact } from "@/types";
import { ApiError, adminKeys, adminRequest } from "./api";
import { useAdminMutation } from "./useResourceMutation";

const base = (companyId: number | string) =>
  `/admin/companies/${encodeURIComponent(String(companyId))}/contacts`;

export interface ContactBody {
  name?: string;
  email?: string;
  phone?: string | null;
  jobTitle?: string | null;
  isBilling?: boolean;
}

/**
 * Company contacts:
 * - GET    /admin/companies/:id/contacts
 * - POST   /admin/companies/:id/contacts             { name, email, phone?, jobTitle?, isBilling? }
 * - PUT    /admin/companies/:id/contacts/:contactId  (partial)
 * - DELETE /admin/companies/:id/contacts/:contactId
 * Mutations invalidate "companies" (list billing column + contacts query).
 */
export function useCompanyContacts(companyId: number | null | undefined) {
  const query = useQuery<CompanyContact[], ApiError>({
    queryKey: adminKeys.companyContacts(companyId ?? "none"),
    enabled: !!companyId,
    queryFn: async () => {
      const body = await adminRequest<CompanyContact[]>(
        "get",
        base(companyId!),
      );
      return Array.isArray(body.data) ? body.data : [];
    },
  });

  const create = useAdminMutation<ContactBody, CompanyContact>(
    (body) => ({ method: "post", url: base(companyId!), body }),
    { invalidate: ["companies"] },
  );

  const update = useAdminMutation<
    { contactId: number; body: ContactBody },
    CompanyContact
  >(
    ({ contactId, body }) => ({
      method: "put",
      url: `${base(companyId!)}/${encodeURIComponent(String(contactId))}`,
      body,
    }),
    { invalidate: ["companies"] },
  );

  const remove = useAdminMutation<number>(
    (contactId) => ({
      method: "delete",
      url: `${base(companyId!)}/${encodeURIComponent(String(contactId))}`,
    }),
    { invalidate: ["companies"] },
  );

  return {
    contacts: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    create,
    update,
    remove,
  };
}

export default useCompanyContacts;
