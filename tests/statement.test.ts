import { describe, expect, it } from "vitest";
import { buildStatement } from "@/lib/student/statement";

const enrollment = (tx: object, course = { title: "Data Analysis", code: "DMC 101" }) => ({
  class: { classId: "CLS1", course },
  transaction: tx as never,
});

describe("student statement", () => {
  it("uses the backend's confirmed totals, not pending payments", () => {
    const s = buildStatement([
      enrollment({
        id: 1,
        transactionId: "TRN1",
        payerType: "B2C",
        total: "270000.00",
        discount: "0.00",
        totalPaid: 81000,
        balance: 189000,
        payments: [
          { paymentId: "PAY1", amountPaid: "81000.00", status: "RECEIVED" },
          { paymentId: "PAY2", amountPaid: "81000.00", status: "PENDING" },
        ],
      }),
    ]);

    expect(s.totals).toEqual({ due: 270000, paid: 81000, balance: 189000 });
    expect(s.own[0].payments.map((p) => p.status)).toEqual(["Received", "Awaiting confirmation"]);
    expect(s.status).toBe("Partially paid");
  });

  it("counts a transaction once however many seats it has", () => {
    const tx = { id: 7, transactionId: "TRN7", payerType: "B2C", total: 400000, discount: 0, totalPaid: 400000, balance: 0 };
    const s = buildStatement([enrollment(tx), enrollment(tx)]);

    expect(s.own).toHaveLength(1);
    expect(s.own[0].seats).toBe(2);
    expect(s.totals.due).toBe(400000);
    expect(s.status).toBe("Paid in full");
  });

  it("lists company-paid courses separately and doesn't bill the student for them", () => {
    const s = buildStatement([
      enrollment({ id: 2, transactionId: "TRN2", payerType: "B2B", total: 270000, discount: 0, totalPaid: 270000, balance: 0 }),
      enrollment({ id: 3, transactionId: "TRN3", payerType: "B2C", total: 170000, discount: 0, totalPaid: 170000, balance: 0 }),
    ]);

    expect(s.organisation.map((l) => l.transactionId)).toEqual(["TRN2"]);
    expect(s.totals.due).toBe(170000);
    expect(s.status).toBe("Paid in full");
  });

  it("applies discounts to the amount due", () => {
    const s = buildStatement([
      enrollment({ id: 4, transactionId: "TRN4", payerType: "B2C", total: 300000, discount: 50000, totalPaid: 0, balance: 250000 }),
    ]);

    expect(s.own[0].due).toBe(250000);
    expect(s.status).toBe("Payment pending");
  });
});
