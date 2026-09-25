import { describe, expect, it } from "vitest";
import { planForward } from "@/lib/api/forward";
import { newPassword, PASSWORD_RULES } from "@/components/admin/passwordPolicy";
import { describeActivity } from "@/components/admin/adminFormat";
import { adminAccountSchema } from "@/components/admin/schemas";

const plan = (segments: string[], method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") =>
  planForward({ audience: "admin", segments, method });

describe("admin accounts proxy allowlist", () => {
  it.each([
    [["admins"], "GET"],
    [["admins", "search"], "GET"],
    [["admins", "7"], "GET"],
    [["admins"], "POST"],
    [["admins", "7"], "PUT"],
    [["admins", "7", "reset-link"], "POST"],
    [["admins", "7", "temporary-password"], "POST"],
    [["admins", "7", "sign-out"], "POST"],
  ] as const)("forwards %j %s", (segments, method) => {
    const result = plan([...segments], method);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.url).toBe(`/admin/${segments.join("/")}`);
  });

  it("has no delete, and the actions are POST only", () => {
    expect(plan(["admins", "7"], "DELETE").ok).toBe(false);
    expect(plan(["admins", "7", "reset-link"], "GET").ok).toBe(false);
    expect(plan(["admins", "7", "temporary-password"], "PUT").ok).toBe(false);
  });
});

describe("admin password policy", () => {
  it.each(["BrandNewPass9!", "Aa1!aaaa"])("accepts %s", (password) => {
    expect(newPassword.safeParse(password).success).toBe(true);
  });

  it.each(["Sh1!", "alllowercase1!", "ALLUPPERCASE1!", "NoNumbers!!", "NoSymbols123", "Aa1!".padEnd(73, "a")])(
    "rejects %s",
    (password) => {
      expect(PASSWORD_RULES.some((rule) => !rule.test(password))).toBe(true);
      expect(newPassword.safeParse(password).success).toBe(false);
    },
  );
});

describe("admin form", () => {
  it("lowercases the email and requires an access level", () => {
    const parsed = adminAccountSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "Ada@Example.com",
      role: "",
      accessLevel: "viewer",
    });
    expect(parsed.success && parsed.data.email).toBe("ada@example.com");
    expect(
      adminAccountSchema.safeParse({ firstName: "A", lastName: "B", email: "a@b.co", accessLevel: "" })
        .success,
    ).toBe(false);
  });
});

describe("admin activity", () => {
  const entry = (action: string, details: Record<string, unknown> | null = null) => ({
    id: 1,
    action,
    details,
    createdAt: "2026-09-25T10:00:00Z",
    actor: null,
  });

  it("describes access changes and edits in words", () => {
    expect(describeActivity(entry("access_changed", { from: "admin", to: "viewer" }))).toBe(
      "Access changed: Admin access → Read-only",
    );
    expect(describeActivity(entry("updated", { role: {}, firstName: {} }))).toBe(
      "Updated department, first name",
    );
    expect(describeActivity(entry("reset_link_sent", { requestedBy: "self" }))).toBe(
      "Requested a password reset link",
    );
    expect(describeActivity(entry("temporary_password_set"))).toBe("Temporary password set");
    expect(describeActivity(entry("something_new"))).toBe("something new");
  });
});
