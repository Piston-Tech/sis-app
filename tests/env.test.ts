import { describe, expect, it } from "vitest";
import { EnvValidationError, parseServerEnv } from "@/lib/env";

const complete = {
  BACKEND_URL: "http://localhost:5000/",
  NEXT_PUBLIC_DOMAIN_NAME: "example.com",
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: "id",
  NEXT_PUBLIC_LINKEDIN_CLIENT_ID: "id",
  NEXT_PUBLIC_LINKEDIN_REDIRECT_URI: "https://app.example.com/auth/linkedin",
};

describe("parseServerEnv", () => {
  it("accepts a complete env and strips the trailing slash", () => {
    const { env, warnings } = parseServerEnv(complete);
    expect(env.BACKEND_URL).toBe("http://localhost:5000");
    expect(warnings).toEqual([]);
  });

  it("fails loudly without BACKEND_URL (missing or blank)", () => {
    for (const BACKEND_URL of [undefined, "", "   "]) {
      expect(() => parseServerEnv({ ...complete, BACKEND_URL })).toThrow(
        EnvValidationError,
      );
    }
    expect(() => parseServerEnv({})).toThrow(/BACKEND_URL is required/);
  });

  it("rejects a non-http BACKEND_URL", () => {
    expect(() =>
      parseServerEnv({ ...complete, BACKEND_URL: "localhost:5000" }),
    ).toThrow(/BACKEND_URL/);
    expect(() =>
      parseServerEnv({ ...complete, BACKEND_URL: "ftp://x.example" }),
    ).toThrow(/BACKEND_URL/);
  });

  it("never includes values in the error", () => {
    expect.assertions(1);
    try {
      parseServerEnv({ ...complete, BACKEND_URL: "s3cr3t-not-a-url" });
    } catch (error) {
      expect((error as Error).message).not.toContain("s3cr3t");
    }
  });

  it("warns about missing public vars and partial bank details", () => {
    const { warnings } = parseServerEnv({
      BACKEND_URL: "https://api.example.com",
      NEXT_PUBLIC_BANK_NAME: "Bank",
    });
    expect(warnings.join("\n")).toMatch(/NEXT_PUBLIC_GOOGLE_CLIENT_ID/);
    expect(warnings.join("\n")).toMatch(/bank-transfer/);
  });

  it("treats blank optional values as unset", () => {
    const { env } = parseServerEnv({ ...complete, NEXT_PUBLIC_BANK_NAME: "" });
    expect(env.NEXT_PUBLIC_BANK_NAME).toBeUndefined();
  });
});
