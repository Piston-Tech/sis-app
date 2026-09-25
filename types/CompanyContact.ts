/** A person at a company. At most one contact per company is the billing contact. */
export default interface CompanyContact {
  id: number;
  companyId: number;
  name: string;
  email: string;
  phone?: string | null;
  jobTitle?: string | null;
  isBilling: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Billing contact summary embedded in company list rows. */
export type BillingContactSummary = Pick<CompanyContact, "id" | "name" | "email">;
