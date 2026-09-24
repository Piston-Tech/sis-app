import { describe, expect, it } from "vitest";
import {
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORT_ROWS,
  SpreadsheetError,
  buildResultRows,
  canonicalHeader,
  cellToString,
  mapHeaders,
  matrixToSheet,
  missingRequiredColumns,
  normaliseHeaderKey,
  parseCsvText,
  parseSpreadsheet,
  resultColumns,
  rowErrorMessages,
  templateCsv,
  templateHeaders,
  toApiRows,
} from "@/lib/import";

const file = (content: string, name = "import.csv") =>
  new File([content], name, { type: "text/csv" });

describe("parseCsvText", () => {
  it("reads the header row, trims cells and skips empty rows", () => {
    const sheet = parseCsvText(
      '﻿ First Name , Last Name,Email\r\n  Ada , Eze ,ada@example.com \r\n,,\r\n\r\nChidi,Okafor,"c@example.com"\r\n',
    );
    expect(sheet.headers).toEqual(["First Name", "Last Name", "Email"]);
    expect(sheet.rows).toEqual([
      { "First Name": "Ada", "Last Name": "Eze", Email: "ada@example.com" },
      { "First Name": "Chidi", "Last Name": "Okafor", Email: "c@example.com" },
    ]);
  });

  it("handles quoted commas/newlines and short rows", () => {
    const sheet = parseCsvText('name,note\n"Doe, Jane","line1\nline2"\nSolo\n');
    expect(sheet.rows).toEqual([
      { name: "Doe, Jane", note: "line1\nline2" },
      { name: "Solo", note: "" },
    ]);
  });

  it("rejects an unclosed quote", () => {
    expect(() => parseCsvText('name,note\n"Doe, Jane,x\n')).toThrow(
      /unclosed quote/,
    );
  });

  it("de-duplicates and names blank headers", () => {
    const sheet = parseCsvText("email,,email\na,b,c\n");
    expect(sheet.headers).toEqual(["email", "Column 2", "email (2)"]);
  });

  it("undoes the export formula guard on phone numbers", () => {
    expect(parseCsvText("phone\n'+2348012345678\n").rows[0].phone).toBe(
      "+2348012345678",
    );
  });

  it("rejects empty files and header-only files", () => {
    expect(() => parseCsvText("")).toThrow(SpreadsheetError);
    expect(() => parseCsvText("\n\n")).toThrow(/empty/);
    expect(() => parseCsvText("firstName,lastName\n,\n")).toThrow(
      /no data rows/,
    );
  });

  it(`allows ${MAX_IMPORT_ROWS} data rows and rejects more`, () => {
    const rows = (n: number) =>
      "email\n" + Array.from({ length: n }, (_, i) => `u${i}@x.com`).join("\n");
    expect(parseCsvText(rows(MAX_IMPORT_ROWS)).rows).toHaveLength(
      MAX_IMPORT_ROWS,
    );
    expect(() => parseCsvText(rows(MAX_IMPORT_ROWS + 1))).toThrow(
      /1001 data rows; the maximum is 1000/,
    );
  });
});

describe("parseSpreadsheet", () => {
  it("parses .csv files", async () => {
    const sheet = await parseSpreadsheet(file("email\na@b.co\n"));
    expect(sheet.rows).toEqual([{ email: "a@b.co" }]);
  });

  it("rejects other extensions, oversize and empty files", async () => {
    await expect(parseSpreadsheet(file("x", "data.xls"))).rejects.toThrow(
      /Unsupported file type/,
    );
    await expect(parseSpreadsheet(file("x", "data.txt"))).rejects.toThrow(
      SpreadsheetError,
    );
    const big = file("email\n" + "a".repeat(MAX_IMPORT_FILE_BYTES));
    await expect(parseSpreadsheet(big)).rejects.toThrow(/maximum is 2 MB/);
    await expect(parseSpreadsheet(file(""))).rejects.toThrow(/empty/);
  });

  it("reads .xlsx through the reader and stringifies cells", async () => {
    const sheet = await parseSpreadsheet(file("PK", "people.XLSX"), {
      readXlsx: async () => [
        ["Student ID", "Class", "Package", "Start"],
        [null, null, null, null],
        ["STD2610000", "CLS261000", 2, new Date(Date.UTC(2026, 8, 1))],
      ],
    });
    expect(sheet.rows).toEqual([
      {
        "Student ID": "STD2610000",
        Class: "CLS261000",
        Package: "2",
        Start: "2026-09-01",
      },
    ]);
  });

  it("reports unreadable workbooks", async () => {
    await expect(
      parseSpreadsheet(file("nope", "a.xlsx"), {
        readXlsx: async () => {
          throw new Error("zip");
        },
      }),
    ).rejects.toThrow(/valid .xlsx/);
  });
});

describe("cellToString / matrixToSheet", () => {
  it("stringifies values", () => {
    expect(cellToString(null)).toBe("");
    expect(cellToString(12.5)).toBe("12.5");
    expect(cellToString(true)).toBe("true");
    expect(cellToString("  x ")).toBe("x");
  });

  it("uses the first non-empty row as header", () => {
    expect(matrixToSheet([[], ["", ""], ["a", "b", ""], ["1", "2"]])).toEqual({
      headers: ["a", "b"],
      rows: [{ a: "1", b: "2" }],
    });
  });
});

describe("header aliases", () => {
  it("normalises case, spaces, underscores and punctuation", () => {
    expect(normaliseHeaderKey(" First_Name ")).toBe("firstname");
    expect(normaliseHeaderKey("E-mail Address")).toBe("emailaddress");
  });

  it.each([
    ["First Name", "firstName"],
    ["firstname", "firstName"],
    ["first_name", "firstName"],
    ["FIRSTNAME", "firstName"],
    ["Middle Name", "middleName"],
    ["Surname", "lastName"],
    ["Email Address", "email"],
    ["Phone Number", "phone"],
    ["Company", "company"],
    ["Company ID", "company"],
    ["Corporate ID", "company"],
    ["membership_tier", "membershipTier"],
  ])("students: %s -> %s", (header, key) => {
    expect(canonicalHeader("students", header)).toBe(key);
  });

  it.each([
    ["Student ID", "studentId"],
    ["STD", "studentId"],
    ["Class", "class"],
    ["Class ID", "class"],
    ["CLS", "class"],
    ["Tier", "tier"],
    ["Package", "tier"],
    ["Mode", "delivery"],
    ["Delivery", "delivery"],
    ["Training Mode", "delivery"],
    ["Email Address", "email"],
    ["cba", "cba"],
  ])("enrollments: %s -> %s", (header, key) => {
    expect(canonicalHeader("enrollments", header)).toBe(key);
  });

  it("does not map fields of the other kind", () => {
    expect(canonicalHeader("students", "Class")).toBeNull();
    expect(canonicalHeader("enrollments", "Company")).toBeNull();
  });

  it("reports unmapped and duplicate headers", () => {
    const result = mapHeaders("students", [
      "First Name",
      "Nickname",
      "firstname",
      "Email",
    ]);
    expect(result.mapped).toEqual(["firstName", "email"]);
    expect(result.unmapped).toEqual(["Nickname"]);
    expect(result.duplicates).toEqual(["firstName"]);
  });

  it("builds API rows keyed by field, dropping empty cells and unmapped columns", () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email Address",
      "Notes",
      "Phone",
    ];
    expect(
      toApiRows("students", headers, [
        {
          "First Name": "Ada",
          "Last Name": "Eze",
          "Email Address": "a@x.co",
          Notes: "vip",
          Phone: "",
        },
      ]),
    ).toEqual([{ firstName: "Ada", lastName: "Eze", email: "a@x.co" }]);
  });

  it("finds missing required columns", () => {
    expect(missingRequiredColumns("students", ["firstName", "email"])).toEqual(
      ["lastName"],
    );
    expect(missingRequiredColumns("enrollments", ["class", "tier"])).toEqual([
      "studentId or email",
    ]);
    expect(
      missingRequiredColumns("enrollments", ["class", "tier", "email"]),
    ).toEqual([]);
  });
});

describe("templates", () => {
  it("uses the exact field names and one example row", () => {
    expect(templateHeaders("students")).toEqual([
      "prefix",
      "firstName",
      "middleName",
      "lastName",
      "email",
      "phone",
      "company",
      "membershipTier",
      "persona",
    ]);
    const lines = templateCsv("enrollments").split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "studentId,email,firstName,lastName,phone,class,tier,delivery,cba,status",
    );
    // The template round-trips through the parser and maps every column.
    const sheet = parseCsvText(templateCsv("enrollments"));
    expect(mapHeaders("enrollments", sheet.headers).unmapped).toEqual([]);
    expect(sheet.rows[0].phone).toBe("+2348098765432");
  });
});

describe("results", () => {
  it("flattens row errors in any shape", () => {
    expect(rowErrorMessages({ email: "Invalid email" })).toEqual([
      "email: Invalid email",
    ]);
    expect(rowErrorMessages(["a", "b"])).toEqual(["a", "b"]);
    expect(rowErrorMessages("bad")).toEqual(["bad"]);
    expect(rowErrorMessages(undefined)).toEqual([]);
  });

  it("merges inputs with results by 1-based row", () => {
    const rows = buildResultRows(
      [{ email: "a@x.co" }, { email: "b@x.co" }],
      [
        { row: 2, status: "error", errors: { email: "Taken" } },
        { row: 1, status: "created", studentId: "STD1" },
      ],
    );
    expect(rows).toEqual([
      {
        row: "1",
        email: "a@x.co",
        status: "created",
        errors: "",
        result_studentId: "STD1",
      },
      { row: "2", email: "b@x.co", status: "error", errors: "email: Taken" },
    ]);
    expect(resultColumns(["email"], rows)).toEqual([
      "row",
      "email",
      "status",
      "errors",
      "result_studentId",
    ]);
  });
});
