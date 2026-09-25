import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import {
  buildStatement,
  type StatementEnrollmentInput,
  type StatementLine,
} from "./statement";

/** Renders a student's statement of account (invoice & payments) as a PDF. */

// Academy details, as printed on the official payment receipts
const ACADEMY = {
  address: "122A Obadina Street, Omole Phase 1, Ikeja, Lagos.",
  email: "fees@pistonandfusion.org",
  phone: "+234(0)7063097056",
};
const BLUE = "#0a4ea2";
const GREY = "#475569";
const LINE = "#cbd5e1";
const LOGO = path.join(process.cwd(), "assets", "logo-mark.png");

// The PDF's standard fonts have no Naira sign, so amounts use the ISO code
const money = (value: number) =>
  `NGN ${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const date = (value: string | Date | null | undefined) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(d)
    .replace(/\//g, "-");
};

export type StatementStudent = {
  studentId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
};

export const renderStatementPdf = (
  student: StatementStudent | null,
  enrollments: StatementEnrollmentInput[],
) => {
  const statement = buildStatement(enrollments);
  const doc = new PDFDocument({ size: "A4", margin: 48 });
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;

  // Header: logo, wordmark and academy contact details
  if (fs.existsSync(LOGO)) doc.image(LOGO, left, 44, { width: 52 });
  doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(18).text("Piston & Fusion", left + 62, 50);
  doc.font("Helvetica").fontSize(11).text("Business Academy", left + 62, 71);
  doc
    .fillColor(GREY)
    .fontSize(9)
    .text(ACADEMY.address, left, 108)
    .text(`${ACADEMY.email}  |  ${ACADEMY.phone}`);

  doc
    .fillColor(BLUE)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("STATEMENT OF ACCOUNT", left, 50, { width, align: "right" });
  doc
    .fillColor("#000")
    .font("Helvetica")
    .fontSize(9)
    .text(`Issue date: ${date(new Date())}`, left, 70, { width, align: "right" });

  const name = [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ");
  doc.moveTo(left, 140).lineTo(left + width, 140).strokeColor(LINE).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#000")
    .text(`Student: ${name || "-"}`, left, 152)
    .font("Helvetica")
    .text(`Student ID: ${student?.studentId ?? "-"}`)
    .text(`Status: ${statement.status}`);

  // Summary band
  const bandY = doc.y + 10;
  doc.rect(left, bandY, width, 46).fill("#eff6ff");
  const cell = width / 3;
  (
    [
      ["Total due", statement.totals.due],
      ["Paid (confirmed)", statement.totals.paid],
      ["Balance", statement.totals.balance],
    ] as const
  ).forEach(([label, value], i) => {
    doc.fillColor(GREY).fontSize(8).text(label.toUpperCase(), left + 12 + i * cell, bandY + 9);
    doc
      .fillColor(label === "Balance" && value > 0 ? "#b91c1c" : "#000")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(money(value), left + 12 + i * cell, bandY + 22);
    doc.font("Helvetica");
  });
  doc.y = bandY + 62;

  const ensureSpace = (needed: number) => {
    if (doc.y + needed > doc.page.height - doc.page.margins.bottom - 40) doc.addPage();
  };

  const section = (title: string) => {
    // Keep a heading on the same page as at least the first block under it
    ensureSpace(160);
    doc.fillColor(BLUE).font("Helvetica-Bold").fontSize(11).text(title, left, doc.y);
    doc.moveDown(0.4);
  };

  const row = (label: string, value: string, bold = false) => {
    const y = doc.y;
    doc.fillColor(GREY).font("Helvetica").fontSize(9).text(label, left + 12, y, { width: 200 });
    doc
      .fillColor("#000")
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .text(value, left + 212, y, { width: width - 224, align: "right" });
    doc.moveDown(0.15);
  };

  const transactionBlock = (line: StatementLine, owned: boolean) => {
    ensureSpace(120);
    const top = doc.y;
    doc
      .fillColor("#000")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`${line.transactionId}`, left + 12, top + 8)
      .font("Helvetica")
      .fontSize(9)
      .text(line.courses.join("; "), { width: width - 24 });
    if (line.seats > 1) doc.fillColor(GREY).text(`${line.seats} enrollments`);
    doc.moveDown(0.3);

    if (owned) {
      row("Invoice total", money(line.total));
      if (line.discount > 0) row("Discount", `- ${money(line.discount)}`);
      row("Total due", money(line.due), true);
      row("Paid (confirmed)", money(line.paid));
      row("Balance", money(line.balance), true);
      if (line.balance > 0 && line.nextPaymentDate) row("Next payment due", date(line.nextPaymentDate));
      if (line.payments.length) {
        doc.moveDown(0.2);
        doc.fillColor(GREY).font("Helvetica-Bold").fontSize(8).text("PAYMENTS", left + 12);
        for (const p of line.payments) {
          row(`${date(p.date)}  ${p.reference}  (${p.status})`, money(p.amount));
        }
      }
    } else {
      row("Paid by", "Your organisation");
      row("Status", line.balance <= 0 ? "Paid in full" : "Payment in progress", true);
    }

    const bottom = doc.y + 6;
    doc.rect(left, top, width, bottom - top).strokeColor(LINE).stroke();
    doc.y = bottom + 10;
  };

  section("Your courses and payments");
  if (!statement.own.length) {
    doc.fillColor(GREY).fontSize(9).text("You have no courses billed to you.", left + 12);
    doc.moveDown(1);
  }
  statement.own.forEach((line) => transactionBlock(line, true));

  if (statement.organisation.length) {
    section("Paid by your organisation");
    statement.organisation.forEach((line) => transactionBlock(line, false));
  }

  ensureSpace(50);
  doc
    .moveDown(0.5)
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text(
      "Only confirmed payments are counted as paid. Transfers awaiting confirmation are shown for your reference. " +
        `An official receipt is emailed for each confirmed payment. Questions: ${ACADEMY.email}.`,
      left,
      doc.y,
      { width },
    );

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
};

