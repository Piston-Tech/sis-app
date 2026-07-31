import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import apiServer from "@/services/apiServer";

const formatMoney = (amount: number) => {
  return `NGN ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

type EnrollmentData = {
  id: number;
  transactionId: number;
  class?: {
    customClass?: { price?: number };
    course?: { prices?: { price?: number }[]; price?: number };
  };
  transaction?: {
    id: number;
    transactionId: string;
    payerId?: number;
    payerType?: string;
    total?: number;
    discount?: number;
    payments?: { amountPaid?: number }[];
  };
};

export async function GET() {
  try {
    const { data: meData } = await apiServer({ url: "/auth/me", method: "GET" });
    const student = meData?.user || null;

    const { data: enrollData } = await apiServer({
      url: "/students/enrollments",
      method: "GET",
    });

    const enrollments: EnrollmentData[] = enrollData?.data || [];

    const txMap = new Map<number, EnrollmentData["transaction"]>();
    enrollments.forEach((enrollment) => {
      if (enrollment.transaction?.id) {
        txMap.set(enrollment.transaction.id, enrollment.transaction);
      }
    });

    const transactions = Array.from(txMap.values()).filter(Boolean);

    const transactionGroups = transactions.map((transaction) => {
      const groupedEnrollments = enrollments.filter(
        (enrollment) => enrollment.transactionId === transaction?.id,
      );

      const totalCost = groupedEnrollments.reduce((sum, enrollment) => {
        if (typeof transaction?.total === "number") {
          return sum + Number(transaction.total);
        }

        const price =
          enrollment.class?.customClass?.price ??
          enrollment.class?.course?.prices?.[0]?.price ??
          enrollment.class?.course?.price ??
          0;

        return sum + Number(price || 0);
      }, 0);

      const totalPaid = (transaction?.payments || []).reduce(
        (sum, payment) => sum + Number(payment.amountPaid || 0),
        0,
      );

      const discount = Number(transaction?.discount || 0);
      const outstanding = Math.max(0, totalCost - totalPaid - discount);

      return {
        transaction,
        totalCost,
        totalPaid,
        outstanding,
      };
    });

    const totalBilled = transactionGroups.reduce((sum, group) => sum + group.totalCost, 0);
    const totalPaid = transactionGroups.reduce((sum, group) => sum + group.totalPaid, 0);
    const totalOutstanding = transactionGroups.reduce(
      (sum, group) => sum + group.outstanding,
      0,
    );

    const latestTransaction = transactionGroups[0]?.transaction;
    const payerType = String(latestTransaction?.payerType || "").toLowerCase();

    const billingEntity = (() => {
      if (payerType.includes("company") || payerType.includes("corporate")) {
        return student?.company?.name
          ? `${student.company.name} (Company)`
          : `Company #${latestTransaction?.payerId || "N/A"}`;
      }

      if (
        payerType.includes("student") ||
        payerType.includes("individual") ||
        payerType.includes("self")
      ) {
        const fullName = [student?.firstName, student?.middleName, student?.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        return fullName
          ? `${fullName} (Student)`
          : `Student #${latestTransaction?.payerId || "N/A"}`;
      }

      return "Billing entity unavailable";
    })();

    const status =
      totalOutstanding <= 0
        ? "All Cleared"
        : totalPaid > 0
          ? "Partially Paid"
          : "Payment Pending";

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (error) => reject(error));

      doc.fontSize(18).text("Piston and Fusion Invoice and Receipt", {
        align: "left",
      });
      doc.moveDown(0.3);
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text(`Generated: ${new Date().toLocaleString()}`)
        .fillColor("#000000");

      doc.moveDown(1);
      const studentName = [student?.firstName, student?.middleName, student?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      doc.fontSize(11).text(`Student: ${studentName || "N/A"}`);
      doc.text(`Billing Entity: ${billingEntity}`);
      doc.text(`Status: ${status}`);
      doc.text(`Total Billed: ${formatMoney(totalBilled)}`);
      doc.text(`Total Paid: ${formatMoney(totalPaid)}`);
      doc.text(`Outstanding: ${formatMoney(totalOutstanding)}`);

      doc.moveDown(1.2);
      doc.fontSize(12).text("Transaction Breakdown", { underline: true });
      doc.moveDown(0.6);

      if (!transactionGroups.length) {
        doc.fontSize(10).text("No transactions found.");
      } else {
        transactionGroups.forEach((group, index) => {
          const tx = group.transaction;
          doc.fontSize(10).text(
            `${index + 1}. ${tx?.transactionId || "N/A"} | Paid: ${formatMoney(group.totalPaid)} | Outstanding: ${formatMoney(group.outstanding)}`,
          );

          const txPayerType = String(tx?.payerType || "").toLowerCase();
          let txBilling = "Not specified";

          if (txPayerType.includes("company") || txPayerType.includes("corporate")) {
            txBilling = student?.company?.name
              ? `${student.company.name} (Company)`
              : `Company #${tx?.payerId || "N/A"}`;
          } else if (
            txPayerType.includes("student") ||
            txPayerType.includes("individual") ||
            txPayerType.includes("self")
          ) {
            txBilling = studentName
              ? `${studentName} (Student)`
              : `Student #${tx?.payerId || "N/A"}`;
          }

          doc.fontSize(9).fillColor("#555555").text(`   Billing Entity: ${txBilling}`);
          doc
            .fontSize(9)
            .fillColor("#555555")
            .text(`   Total Billed: ${formatMoney(group.totalCost)}`)
            .fillColor("#000000");
          doc.moveDown(0.4);
        });
      }

      doc.end();
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-receipt-${student?.studentId || "student"}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate invoice PDF", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate invoice PDF" },
      { status: 500 },
    );
  }
}
