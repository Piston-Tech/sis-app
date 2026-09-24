import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  FORWARD_RULES,
  forwardRequest,
  isSafeSegment,
  planForward,
  stripTokens,
  toNextResponse,
  tokenFor,
} from "@/lib/api/forward";

describe("isSafeSegment", () => {
  it.each(["students", "profession-categories", "abc_123", "42"])(
    "accepts %s",
    (segment) => expect(isSafeSegment(segment)).toBe(true),
  );

  it.each(["", "..", ".", "a.b", "a/b", "a%2Fb", "a b", "é", "auth?x", "a\\b"])(
    "rejects %j",
    (segment) => expect(isSafeSegment(segment)).toBe(false),
  );
});

describe("tokenFor", () => {
  it("uses the user token for students, the admin token for admin, none for public", () => {
    expect(tokenFor("student")).toBe("user");
    expect(tokenFor("admin")).toBe("admin");
    expect(tokenFor("public")).toBeNull();
  });
});

describe("planForward", () => {
  it("builds admin URLs with the admin token and the query string", () => {
    const plan = planForward({
      audience: "admin",
      segments: ["students"],
      method: "GET",
      search: "?page=2&limit=20&sort=createdAt&order=desc&q=a b",
    });
    expect(plan).toEqual({
      ok: true,
      url: "/admin/students?page=2&limit=20&sort=createdAt&order=desc&q=a+b",
      method: "GET",
      authenticateAs: "admin",
      body: undefined,
    });
  });

  it("keeps the /students prefix and the user token for student routes", () => {
    const plan = planForward({
      audience: "student",
      segments: ["certificates", "7"],
      method: "GET",
      search: "?type=PDF",
    });
    expect(plan).toMatchObject({
      ok: true,
      url: "/students/certificates/7?type=PDF",
      authenticateAs: "user",
    });
  });

  it("forwards public routes without a token", () => {
    expect(
      planForward({
        audience: "public",
        segments: ["courses", "search"],
        method: "GET",
        search: "?q=pm",
      }),
    ).toMatchObject({
      ok: true,
      url: "/courses/search?q=pm",
      authenticateAs: null,
    });

    expect(
      planForward({
        audience: "public",
        segments: ["foundation", "applications"],
        method: "POST",
        body: { a: 1 },
      }),
    ).toMatchObject({
      ok: true,
      url: "/foundation/applications",
      body: { a: 1 },
    });
  });

  it("404s resources outside the allowlist", () => {
    const cases: [Parameters<typeof planForward>[0]["audience"], string[]][] = [
      ["public", ["auth", "refresh-token"]],
      ["public", ["admin", "students"]],
      ["public", ["students", "enrollments"]],
      ["student", ["me"]],
      ["admin", ["auth", "me"]],
      ["admin", ["auth", "refresh-token"]],
      ["admin", ["constructor"]],
      ["admin", ["__proto__"]],
      ["admin", ["hasOwnProperty"]],
      ["admin", []],
    ];
    for (const [audience, segments] of cases) {
      expect(planForward({ audience, segments, method: "GET" })).toMatchObject({
        ok: false,
        status: 404,
      });
    }
  });

  it("404s unsafe segments and too many segments", () => {
    const run = (
      audience: "admin" | "student",
      segments: string[],
      method: "GET" | "PATCH" = "GET",
    ) => planForward({ audience, segments, method });

    expect(run("admin", ["students", ".."])).toMatchObject({ status: 404 });
    expect(run("admin", ["students", "a/b"])).toMatchObject({ status: 404 });
    expect(
      run("admin", ["payments", "1", "status", "x"], "PATCH"),
    ).toMatchObject({ status: 404 });
    expect(run("student", ["enrollments", "1", "x"])).toMatchObject({
      status: 404,
    });
  });

  it("405s methods a resource does not allow", () => {
    expect(
      planForward({
        audience: "public",
        segments: ["courses"],
        method: "POST",
      }),
    ).toMatchObject({ ok: false, status: 405, allow: "GET" });
    expect(
      planForward({
        audience: "student",
        segments: ["enrollments"],
        method: "DELETE",
      }),
    ).toMatchObject({ status: 405 });
  });

  it("supports PATCH and DELETE on admin resources", () => {
    expect(
      planForward({
        audience: "admin",
        segments: ["payments", "5", "status"],
        method: "PATCH",
        body: { status: "Confirmed" },
      }),
    ).toMatchObject({
      ok: true,
      url: "/admin/payments/5/status",
      method: "PATCH",
      body: { status: "Confirmed" },
    });
    expect(
      planForward({
        audience: "admin",
        segments: ["classes", "9"],
        method: "DELETE",
      }),
    ).toMatchObject({ ok: true, url: "/admin/classes/9" });
  });

  it("moves a body id onto the path for collection PUTs", () => {
    expect(
      planForward({
        audience: "admin",
        segments: ["classes"],
        method: "PUT",
        body: { id: 12, name: "x" },
      }),
    ).toMatchObject({
      ok: true,
      url: "/admin/classes/12",
      body: { name: "x" },
    });

    // foundation collections are two segments deep
    expect(
      planForward({
        audience: "admin",
        segments: ["foundation", "programs"],
        method: "PUT",
        body: { id: 3, isActive: false },
      }),
    ).toMatchObject({
      ok: true,
      url: "/admin/foundation/programs/3",
      body: { isActive: false },
    });

    // item PUTs are left alone
    expect(
      planForward({
        audience: "admin",
        segments: ["foundation", "cohorts", "4"],
        method: "PUT",
        body: { isActive: true },
      }),
    ).toMatchObject({ ok: true, url: "/admin/foundation/cohorts/4" });
  });

  it("rejects an unsafe body id", () => {
    expect(
      planForward({
        audience: "admin",
        segments: ["students"],
        method: "PUT",
        body: { id: "../auth/me" },
      }),
    ).toMatchObject({ ok: false, status: 400 });
  });

  it("only allowlists safe resource names", () => {
    for (const rule of Object.values(FORWARD_RULES)) {
      for (const name of Object.keys(rule.resources)) {
        expect(isSafeSegment(name)).toBe(true);
      }
    }
  });
});

describe("stripTokens", () => {
  it("removes tokens but keeps every other key", () => {
    expect(
      stripTokens({
        success: true,
        user: { id: 1 },
        accessToken: "a",
        refreshToken: "r",
        pagination: { page: 1 },
      }),
    ).toEqual({ success: true, user: { id: 1 }, pagination: { page: 1 } });
  });
});

describe("toNextResponse", () => {
  it("passes JSON through with its status and Retry-After", async () => {
    const response = new Response(null, {
      status: 429,
      headers: { "Retry-After": "60" },
    });
    const res = toNextResponse({
      data: { success: false, error: "Slow down" },
      response,
    });
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("60");
    expect(await res.json()).toEqual({ success: false, error: "Slow down" });
  });

  it("passes binaries through with their content type", async () => {
    const response = new Response(null, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=c.pdf",
      },
    });
    const res = toNextResponse({
      data: {},
      blob: new Blob(["%PDF"]),
      response,
    });
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("c.pdf");
    expect(await res.text()).toBe("%PDF");
  });

  it("handles 204", () => {
    const res = toNextResponse({
      data: {},
      blob: new Blob([]),
      response: new Response(null, { status: 204 }),
    });
    expect(res.status).toBe(204);
  });
});

describe("forwardRequest", () => {
  const ok = (data: object, status = 200) => ({
    data,
    response: new Response(null, {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  });

  it("forwards method, query and token, and passes pagination through", async () => {
    const pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
    const send = vi
      .fn()
      .mockResolvedValue(ok({ success: true, data: [], pagination }));
    const request = new NextRequest(
      "http://localhost/api/admin/students?page=1",
    );

    const res = await forwardRequest(request, "admin", ["students"], send);

    expect(send).toHaveBeenCalledWith({
      url: "/admin/students?page=1",
      method: "GET",
      body: undefined,
      authenticateAs: "admin",
    });
    expect((await res.json()).pagination).toEqual(pagination);
  });

  it("sends JSON bodies for mutations", async () => {
    const send = vi.fn().mockResolvedValue(ok({ success: true }, 201));
    const request = new NextRequest(
      "http://localhost/api/students/recommendations",
      {
        method: "POST",
        body: JSON.stringify({ persona: "x" }),
        headers: { "Content-Type": "application/json" },
      },
    );

    const res = await forwardRequest(
      request,
      "student",
      ["recommendations"],
      send,
    );

    expect(res.status).toBe(201);
    expect(send).toHaveBeenCalledWith({
      url: "/students/recommendations",
      method: "POST",
      body: { persona: "x" },
      authenticateAs: "user",
    });
  });

  it("400s invalid JSON and never calls the backend for rejected paths", async () => {
    const send = vi.fn();
    const bad = new NextRequest("http://localhost/api/admin/students", {
      method: "POST",
      body: "{nope",
    });
    expect(
      (await forwardRequest(bad, "admin", ["students"], send)).status,
    ).toBe(400);

    const hidden = new NextRequest("http://localhost/api/admin/auth/me");
    const res = await forwardRequest(hidden, "admin", ["auth", "me"], send);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, error: "Not found" });
    expect(send).not.toHaveBeenCalled();
  });
});
