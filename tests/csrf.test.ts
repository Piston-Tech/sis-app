import { describe, expect, it } from "vitest";
import { checkCsrf } from "@/lib/api/csrf";

const run = (
  method: string,
  headers: Record<string, string>,
  pathname = "/api/admin/students",
) => checkCsrf({ method, pathname, headers: new Headers(headers) });

const json = { "content-type": "application/json", "content-length": "2" };

describe("checkCsrf", () => {
  it("allows safe methods from anywhere", () => {
    expect(
      run("GET", { origin: "https://evil.example", host: "app.example.com" }),
    ).toEqual({ ok: true });
  });

  it("allows same-origin JSON mutations", () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      expect(
        run(method, {
          origin: "https://app.example.com",
          host: "app.example.com",
          ...json,
        }),
      ).toEqual({ ok: true });
    }
  });

  it("matches X-Forwarded-Host behind a proxy", () => {
    expect(
      run("POST", {
        origin: "https://admin.example.com",
        host: "127.0.0.1:4000",
        "x-forwarded-host": "admin.example.com",
        ...json,
      }),
    ).toEqual({ ok: true });
  });

  it("blocks cross-origin, sibling-subdomain and null origins", () => {
    for (const origin of [
      "https://evil.example",
      "https://app.example.com",
      "null",
      "not a url",
    ]) {
      expect(
        run("POST", { origin, host: "admin.example.com", ...json }),
      ).toMatchObject({ ok: false, status: 403 });
    }
  });

  it("falls back to Sec-Fetch-Site when Origin is missing", () => {
    const host = "app.example.com";
    expect(
      run("POST", { host, "sec-fetch-site": "same-origin", ...json }),
    ).toEqual({ ok: true });
    expect(
      run("POST", { host, "sec-fetch-site": "same-site", ...json }),
    ).toMatchObject({ status: 403 });
    expect(run("POST", { host, ...json })).toMatchObject({ status: 403 });
  });

  it("requires JSON for requests with a body", () => {
    const base = {
      origin: "https://app.example.com",
      host: "app.example.com",
      "content-length": "10",
    };
    for (const type of [
      "text/plain",
      "application/x-www-form-urlencoded",
      "multipart/form-data; boundary=x",
    ]) {
      expect(run("POST", { ...base, "content-type": type })).toMatchObject({
        ok: false,
        status: 415,
      });
    }
    expect(run("POST", base)).toMatchObject({ status: 415 });
    expect(
      run("POST", {
        ...base,
        "content-type": "application/json; charset=utf-8",
      }),
    ).toEqual({ ok: true });
  });

  it("does not require a content type for empty bodies", () => {
    const same = { origin: "https://app.example.com", host: "app.example.com" };
    expect(run("DELETE", same)).toEqual({ ok: true });
    expect(run("POST", { ...same, "content-length": "0" })).toEqual({
      ok: true,
    });
  });
});
