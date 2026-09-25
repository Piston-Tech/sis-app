import type CompanyContact from "./CompanyContact";
import type { BillingContactSummary } from "./CompanyContact";

export default interface Company {
  id: number;
  companyId: string;
  name: string;
  industry: string;
  /** Included on the single-company GET. */
  contacts?: CompanyContact[];
  /** Included on list rows. */
  billingContact?: BillingContactSummary | null;
  createdAt?: Date;
  updatedAt?: Date;
}
