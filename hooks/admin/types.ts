import { Payment, Student, Tier } from "@/types";

/** Payer embedded in transaction / payment rows. */
export interface PayerSummary {
  id: number;
  studentId?: string;
  companyId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface TransactionSummary {
  id: number;
  transactionId: string;
  payerType: string;
  payerId: number;
  /** Stored invoice total: THE source of truth for what is owed. */
  total?: number;
  discount: number;
  noOfEnrollments: number;
  /** Legacy (pre-stored-total) live price; prefer `total`. */
  subTotal?: number;
  totalPaid: number;
  /** total - discount */
  totalDue: number;
  /** Price-list price of the current enrollments (informational only). */
  computedTotal?: number;
  /** computedTotal - total */
  priceDifference?: number;
  currency?: string;
  payer: PayerSummary | null;
  balance: number;
  status: string;
  nextPaymentDate?: string | null;
  createdAt: string;
}

export interface TransactionEnrollment {
  id: number;
  enrollmentId: string;
  transactionId: number;
  studentId: number;
  classId: number;
  cba: string;
  delivery: string;
  tierId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  student: Pick<
    Student,
    "studentId" | "firstName" | "middleName" | "lastName" | "email" | "phone"
  >;
  tier: Pick<Tier, "id" | "name" | "shortName" | "subTitle" | "description">;
  class: {
    id: number;
    classId: string;
    courseId: number;
    plannedStartDate: string;
    schedule: string;
    isCustom: boolean;
    course: {
      title: string;
      code: string;
      levelId: number;
      duration: number;
    };
  };
}

export interface TransactionDetail extends TransactionSummary {
  payments: Payment[];
  enrollments: TransactionEnrollment[];
}

export type PaymentStatus = "PENDING" | "RECEIVED" | "DECLINED";

export type PaymentRow = Payment & {
  method?: string | null;
  paymentDate?: string | null;
  transaction: {
    id: number;
    transactionId: string;
    payerId: number;
    payerType: string;
    payer: PayerSummary | null;
  } | null;
};

export const payerName = (
  payerType: string | undefined,
  payer: PayerSummary | null | undefined,
) =>
  !payer
    ? "Unknown payer"
    : payerType === "B2B"
      ? (payer.name ?? "")
      : [payer.firstName, payer.lastName].filter(Boolean).join(" ");

export const payerCode = (
  payerType: string | undefined,
  payer: PayerSummary | null | undefined,
) => (payerType === "B2B" ? payer?.companyId : payer?.studentId) ?? "";

/** Stored invoice total, falling back to the legacy subTotal. */
export const invoiceTotal = (t: Pick<TransactionSummary, "total" | "subTotal">) =>
  Number(t.total ?? t.subTotal ?? 0);
