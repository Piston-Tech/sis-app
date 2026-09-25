/**
 * A student's statement of account (the "invoice & receipt" PDF), built only
 * from what the backend returns for the student's enrollments. The backend's
 * transaction view already carries the stored invoice total, discount,
 * totalPaid (RECEIVED payments only) and balance, so nothing is recomputed
 * from prices or from pending payments here.
 */

type Numeric = number | string | null | undefined;

export interface StatementEnrollmentInput {
  transactionId?: number;
  delivery?: string | null;
  class?: {
    classId?: string;
    course?: { title?: string; code?: string } | null;
    customClass?: { title?: string } | null;
  } | null;
  transaction?: {
    id: number;
    transactionId: string;
    payerType?: string;
    total?: Numeric;
    discount?: Numeric;
    totalPaid?: Numeric;
    balance?: Numeric;
    nextPaymentDate?: string | null;
    payments?: {
      paymentId?: string;
      amountPaid?: Numeric;
      status?: string;
      paymentDate?: string | null;
      createdAt?: string | null;
    }[];
  } | null;
}

export interface StatementPayment {
  reference: string;
  date: string | null;
  amount: number;
  status: "Received" | "Awaiting confirmation" | "Declined";
}

export interface StatementLine {
  transactionId: string;
  courses: string[];
  seats: number;
  paidByOrganisation: boolean;
  total: number;
  discount: number;
  due: number;
  paid: number;
  balance: number;
  nextPaymentDate: string | null;
  payments: StatementPayment[];
}

export interface Statement {
  own: StatementLine[];
  organisation: StatementLine[];
  totals: { due: number; paid: number; balance: number };
  status: "Paid in full" | "Partially paid" | "Payment pending" | "Nothing billed";
}

const amount = (value: Numeric) => {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? 0));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};

const paymentStatus = (status?: string): StatementPayment["status"] => {
  const s = String(status ?? "").toUpperCase();
  if (s === "RECEIVED") return "Received";
  if (s === "DECLINED") return "Declined";
  return "Awaiting confirmation";
};

const courseLabel = (enrollment: StatementEnrollmentInput) => {
  const cls = enrollment.class;
  const title = cls?.customClass?.title || cls?.course?.title || "Course";
  return cls?.course?.code ? `${title} (${cls.course.code})` : title;
};

export const buildStatement = (enrollments: StatementEnrollmentInput[]): Statement => {
  const byTransaction = new Map<number, StatementEnrollmentInput[]>();
  for (const enrollment of enrollments) {
    const id = enrollment.transaction?.id;
    if (!id) continue;
    byTransaction.set(id, [...(byTransaction.get(id) ?? []), enrollment]);
  }

  const lines: StatementLine[] = [...byTransaction.values()].map((group) => {
    const tx = group[0].transaction!;
    const total = amount(tx.total);
    const discount = amount(tx.discount);
    const due = Math.max(0, total - discount);
    const paid = amount(tx.totalPaid);
    return {
      transactionId: tx.transactionId,
      courses: [...new Set(group.map(courseLabel))],
      seats: group.length,
      paidByOrganisation: String(tx.payerType ?? "").toUpperCase() === "B2B",
      total,
      discount,
      due,
      paid,
      balance: tx.balance !== undefined ? amount(tx.balance) : Math.max(0, due - paid),
      nextPaymentDate: tx.nextPaymentDate ?? null,
      payments: (tx.payments ?? []).map((p) => ({
        reference: p.paymentId ?? "",
        date: p.paymentDate ?? p.createdAt ?? null,
        amount: amount(p.amountPaid),
        status: paymentStatus(p.status),
      })),
    };
  });

  // The student is only billed for their own (B2C) transactions; courses paid
  // by an employer are listed separately and don't count towards what they owe
  const own = lines.filter((l) => !l.paidByOrganisation);
  const organisation = lines.filter((l) => l.paidByOrganisation);
  const sum = (key: "due" | "paid" | "balance") =>
    Math.round(own.reduce((s, l) => s + l[key], 0) * 100) / 100;
  const totals = { due: sum("due"), paid: sum("paid"), balance: sum("balance") };

  const status: Statement["status"] = !own.length
    ? "Nothing billed"
    : totals.balance <= 0
      ? "Paid in full"
      : totals.paid > 0
        ? "Partially paid"
        : "Payment pending";

  return { own, organisation, totals, status };
};
