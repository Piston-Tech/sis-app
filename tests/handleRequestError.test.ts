import { describe, expect, it, vi } from "vitest";
import handleRequestError from "@/utils/handleRequestError";

const setup = () => ({ setError: vi.fn(), setErrors: vi.fn() });

describe("handleRequestError", () => {
  it("sends field errors to setErrors", () => {
    const { setError, setErrors } = setup();
    handleRequestError(
      {
        response: {
          status: 400,
          data: { success: false, errors: { email: "Taken" } },
        },
      },
      setError,
      setErrors,
    );
    expect(setErrors).toHaveBeenCalledWith({ email: "Taken" });
    expect(setError).not.toHaveBeenCalled();
  });

  it("uses the backend error message", () => {
    const { setError, setErrors } = setup();
    handleRequestError(
      {
        response: {
          status: 409,
          data: { success: false, error: "Already exists" },
        },
      },
      setError,
      setErrors,
    );
    expect(setError).toHaveBeenCalledWith("Already exists");
    expect(setErrors).not.toHaveBeenCalled();
  });

  it("explains 429s using Retry-After", () => {
    const { setError, setErrors } = setup();
    handleRequestError(
      {
        response: { status: 429, headers: { "retry-after": "120" }, data: {} },
      },
      setError,
      setErrors,
    );
    expect(setError).toHaveBeenCalledWith(
      "Too many attempts. Try again in 2 minute(s).",
    );
  });

  it("falls back to the axios message, then a generic one", () => {
    const a = setup();
    handleRequestError(
      { message: "timeout of 10000ms exceeded" },
      a.setError,
      a.setErrors,
    );
    expect(a.setError).toHaveBeenCalledWith("timeout of 10000ms exceeded");

    const b = setup();
    handleRequestError(undefined, b.setError, b.setErrors);
    expect(b.setError).toHaveBeenCalledWith("Network error");
  });
});
