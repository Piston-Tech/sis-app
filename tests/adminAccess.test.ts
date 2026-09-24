import { describe, expect, it } from "vitest";
import {
  accessCanManageAdmins,
  accessCanWrite,
  normaliseAccessLevel,
} from "@/utils/adminAccess";

describe("admin access levels", () => {
  it("fails closed to read-only for missing or unknown levels", () => {
    expect(normaliseAccessLevel(undefined)).toBe("viewer");
    expect(normaliseAccessLevel("")).toBe("viewer");
    expect(normaliseAccessLevel("owner")).toBe("viewer");
    // Department labels are not access levels
    expect(normaliseAccessLevel("Super Admin")).toBe("viewer");
    expect(normaliseAccessLevel("CBA")).toBe("viewer");
  });

  it("keeps known levels", () => {
    expect(normaliseAccessLevel("viewer")).toBe("viewer");
    expect(normaliseAccessLevel("admin")).toBe("admin");
    expect(normaliseAccessLevel("superadmin")).toBe("superadmin");
  });

  it("derives permissions from the level", () => {
    expect(accessCanWrite("viewer")).toBe(false);
    expect(accessCanWrite("admin")).toBe(true);
    expect(accessCanWrite("superadmin")).toBe(true);
    expect(accessCanManageAdmins("admin")).toBe(false);
    expect(accessCanManageAdmins("superadmin")).toBe(true);
  });
});
