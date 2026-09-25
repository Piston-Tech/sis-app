import { describe, expect, it } from "vitest";
import {
  ccListSchema,
  companyContactSchema,
  sendReceiptSchema,
} from "@/components/admin/schemas";

describe("ccListSchema", () => {
  it("splits on commas/semicolons/newlines and drops blanks", () => {
    expect(ccListSchema.parse(" a@x.co, b@y.co;\nc@z.co ,, ")).toEqual([
      "a@x.co",
      "b@y.co",
      "c@z.co",
    ]);
    expect(ccListSchema.parse("")).toEqual([]);
    expect(ccListSchema.parse(undefined)).toEqual([]);
  });

  it("rejects invalid addresses and more than 5", () => {
    expect(ccListSchema.safeParse("a@x.co, nope").success).toBe(false);
    expect(
      ccListSchema.safeParse("1@x.co,2@x.co,3@x.co,4@x.co,5@x.co,6@x.co")
        .success,
    ).toBe(false);
  });
});

describe("sendReceiptSchema", () => {
  it("omits empty optional fields", () => {
    expect(sendReceiptSchema.parse({ to: " ", cc: "", receiptNo: "" })).toEqual(
      { to: undefined, cc: [], receiptNo: undefined },
    );
  });

  it("validates the override address and receipt number", () => {
    expect(sendReceiptSchema.safeParse({ to: "bad" }).success).toBe(false);
    expect(
      sendReceiptSchema.parse({ to: "a@x.co", receiptNo: " RC-2608-026 " }),
    ).toMatchObject({ to: "a@x.co", receiptNo: "RC-2608-026" });
    expect(
      sendReceiptSchema.safeParse({ receiptNo: "RC 26 <script>" }).success,
    ).toBe(false);
  });
});

describe("companyContactSchema", () => {
  it("requires a name and a valid email", () => {
    expect(
      companyContactSchema.safeParse({
        name: "",
        email: "x",
        isBilling: false,
      }).success,
    ).toBe(false);
    expect(
      companyContactSchema.parse({
        name: " Ngozi ",
        email: "ngozi@acme.ng",
        phone: "",
        isBilling: true,
      }),
    ).toEqual({
      name: "Ngozi",
      email: "ngozi@acme.ng",
      phone: "",
      jobTitle: "",
      isBilling: true,
    });
  });
});
