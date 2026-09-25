import * as z from "zod";

// Server-side environment. Import only from server code (route handlers,
// services/apiServer.ts): BACKEND_URL is not exposed to the browser.
//
// NEXT_PUBLIC_* values are inlined into client bundles at build time, so
// client components keep reading them from process.env directly; they are
// validated here so a misconfigured deployment shows up in the server logs.

// `KEY=` in a .env file yields "", which should count as "not set".
const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  blankToUndefined,
  z.string().trim().optional(),
);

const serverEnvSchema = z.object({
  BACKEND_URL: z.preprocess(
    blankToUndefined,
    z
      .url({
        protocol: /^https?$/,
        error: (issue) =>
          issue.input === undefined
            ? "BACKEND_URL is required (base URL of sis-backend, e.g. http://localhost:5000)"
            : "BACKEND_URL must be an http(s) URL",
      })
      // Paths are appended as `${BACKEND_URL}/admin/...`
      .transform((url) => url.replace(/\/+$/, "")),
  ),
  NEXT_PUBLIC_DOMAIN_NAME: optionalString,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: optionalString,
  NEXT_PUBLIC_LINKEDIN_CLIENT_ID: optionalString,
  NEXT_PUBLIC_LINKEDIN_REDIRECT_URI: z.preprocess(
    blankToUndefined,
    z
      .url({ error: "NEXT_PUBLIC_LINKEDIN_REDIRECT_URI must be a URL" })
      .optional(),
  ),
  // Bank transfer details on the student payments page (all three or none)
  NEXT_PUBLIC_BANK_NAME: optionalString,
  NEXT_PUBLIC_BANK_ACCOUNT_NAME: optionalString,
  NEXT_PUBLIC_BANK_ACCOUNT_NUMBER: optionalString,
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

// Not required to boot, but features break without them.
const EXPECTED_PUBLIC_VARS = [
  "NEXT_PUBLIC_DOMAIN_NAME",
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "NEXT_PUBLIC_LINKEDIN_CLIENT_ID",
  "NEXT_PUBLIC_LINKEDIN_REDIRECT_URI",
] as const;

const BANK_VARS = [
  "NEXT_PUBLIC_BANK_NAME",
  "NEXT_PUBLIC_BANK_ACCOUNT_NAME",
  "NEXT_PUBLIC_BANK_ACCOUNT_NUMBER",
] as const;

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid server environment:\n  - ${issues.join("\n  - ")}`);
    this.name = "EnvValidationError";
  }
}

/**
 * Validates an environment object. Throws EnvValidationError listing every
 * problem (never the values). Returns the parsed env plus non-fatal warnings.
 */
export const parseServerEnv = (
  source: Record<string, string | undefined>,
): { env: ServerEnv; warnings: string[] } => {
  const result = serverEnvSchema.safeParse(source);

  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "env"}: ${issue.message}`,
      ),
    );
  }

  const env = result.data;
  const warnings: string[] = [];

  const missing = EXPECTED_PUBLIC_VARS.filter((key) => !env[key]);
  if (missing.length) {
    warnings.push(
      `Missing ${missing.join(", ")}; related features will not work.`,
    );
  }

  const bankSet = BANK_VARS.filter((key) => env[key]);
  if (bankSet.length && bankSet.length !== BANK_VARS.length) {
    warnings.push(
      `Only some of ${BANK_VARS.join(", ")} are set; the bank-transfer section stays hidden until all are.`,
    );
  }

  return { env, warnings };
};

let cached: ServerEnv | undefined;

/**
 * The validated server environment. Throws (loudly, on every call until
 * fixed) when BACKEND_URL is missing or invalid.
 */
export const getServerEnv = (): ServerEnv => {
  if (cached) return cached;

  try {
    const { env, warnings } = parseServerEnv(process.env);
    warnings.forEach((warning) => console.warn(`[env] ${warning}`));
    cached = env;
    return env;
  } catch (error) {
    console.error(`[env] ${(error as Error).message}`);
    throw error;
  }
};

/** Test helper: forget the cached env. */
export const resetServerEnvCache = () => {
  cached = undefined;
};
