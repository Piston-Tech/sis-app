import apiServer, {
  type AuthAudience,
  type HttpMethod,
  type JsonObject,
  type ServerResponse,
} from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse, withErrorHandling } from "./respond";

/**
 * Safe same-origin → backend forwarding for the generic /api catch-alls.
 *
 *   /api/<resource>/...          → public   → BACKEND/<resource>/...          (no token)
 *   /api/students/<resource>/... → student  → BACKEND/students/<resource>/... (user token)
 *   /api/admin/<resource>/...    → admin    → BACKEND/admin/<resource>/...    (admin token)
 *
 * Only allowlisted resources and methods are forwarded; everything else is a
 * 404/405 without touching the backend. Auth endpoints (which return tokens in
 * the body) are never reachable through here — they have explicit routes.
 */

export type Audience = "public" | "student" | "admin";

interface ResourceRule {
  methods: readonly HttpMethod[];
  /**
   * Number of path segments that address the collection. A PUT to the
   * collection path with `{ id, ...body }` is sent to `<collection>/<id>`
   * (the admin forms PUT to e.g. /api/admin/classes with the id in the body).
   */
  collectionDepth?: number;
}

interface AudienceRule {
  backendPrefix: "" | "/students" | "/admin";
  token: AuthAudience | null;
  maxSegments: number;
  resources: Readonly<Record<string, ResourceRule>>;
}

const READ: readonly HttpMethod[] = ["GET"];
const CRUD: readonly HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

export const FORWARD_RULES: Readonly<Record<Audience, AudienceRule>> = {
  public: {
    backendPrefix: "",
    token: null,
    maxSegments: 2,
    resources: {
      // /courses, /courses/search, /courses/:id
      courses: { methods: READ },
      // /foundation/programs, /foundation/cohorts, POST /foundation/applications
      foundation: { methods: ["GET", "POST"] },
    },
  },
  student: {
    backendPrefix: "/students",
    token: "user",
    maxSegments: 2,
    resources: {
      enrollments: { methods: READ },
      // /:id?type=PDF|PNG downloads are passed through as binary
      certificates: { methods: READ },
      badges: { methods: READ },
      "profession-categories": { methods: READ },
      referrals: { methods: READ },
      // /recommendations, /recommendations/auto
      recommendations: { methods: ["POST"] },
      // PUT /students/me is served by /api/user
    },
  },
  admin: {
    backendPrefix: "/admin",
    token: "admin",
    maxSegments: 3,
    resources: {
      students: { methods: CRUD },
      companies: { methods: CRUD },
      courses: { methods: CRUD },
      classes: { methods: CRUD },
      tiers: { methods: CRUD },
      transactions: { methods: CRUD },
      enrollments: { methods: CRUD },
      // PATCH /admin/payments/:id/status
      payments: { methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
      // /foundation/{programs,cohorts,applications}[/:id]
      foundation: {
        methods: ["GET", "POST", "PUT", "PATCH"],
        collectionDepth: 2,
      },
    },
  },
};

export const SAFE_SEGMENT = /^[A-Za-z0-9_-]+$/;

export const isSafeSegment = (segment: unknown): segment is string =>
  typeof segment === "string" && SAFE_SEGMENT.test(segment);

export const tokenFor = (audience: Audience): AuthAudience | null =>
  FORWARD_RULES[audience].token;

export type ForwardPlan =
  | {
      ok: true;
      url: string;
      method: HttpMethod;
      authenticateAs: AuthAudience | null;
      body?: unknown;
    }
  | { ok: false; status: 400 | 404 | 405; error: string; allow?: string };

const isPlainObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Pure: validates the request against the allowlist and builds the backend
 * call. `segments` are the already-decoded catch-all params; `search` is
 * `request.nextUrl.search` (including the leading "?", or "").
 */
export const planForward = ({
  audience,
  segments,
  method,
  search = "",
  body,
}: {
  audience: Audience;
  segments: readonly string[];
  method: HttpMethod;
  search?: string;
  body?: unknown;
}): ForwardPlan => {
  const rule = FORWARD_RULES[audience];
  const notFound = { ok: false, status: 404, error: "Not found" } as const;

  if (
    !segments.length ||
    segments.length > rule.maxSegments ||
    !segments.every(isSafeSegment)
  ) {
    return notFound;
  }

  const resource = rule.resources[segments[0]];
  // Own-property check so "constructor"/"__proto__" etc. never match
  if (!resource || !Object.hasOwn(rule.resources, segments[0])) return notFound;

  if (!resource.methods.includes(method)) {
    return {
      ok: false,
      status: 405,
      error: "Method not allowed",
      allow: resource.methods.join(", "),
    };
  }

  const path = [...segments];
  let forwardBody = body;

  if (
    method === "PUT" &&
    path.length === (resource.collectionDepth ?? 1) &&
    isPlainObject(body) &&
    body.id !== undefined &&
    body.id !== null
  ) {
    const id = String(body.id);
    if (!isSafeSegment(id)) {
      return { ok: false, status: 400, error: "Invalid id" };
    }
    const { id: _id, ...rest } = body;
    path.push(id);
    forwardBody = rest;
  }

  return {
    ok: true,
    url:
      rule.backendPrefix +
      "/" +
      path.map(encodeURIComponent).join("/") +
      normaliseSearch(search),
    method,
    authenticateAs: rule.token,
    body: forwardBody,
  };
};

// Only forward a well-formed query string ("?a=b&c=d"); drop fragments.
const normaliseSearch = (search: string) => {
  if (!search || search === "?") return "";
  const query = search.startsWith("?") ? search.slice(1) : search;
  return "?" + new URLSearchParams(query).toString();
};

// Headers copied from the backend response to the browser
const PASSTHROUGH_HEADERS = [
  "content-disposition",
  "retry-after",
  "ratelimit-limit",
  "ratelimit-remaining",
  "ratelimit-reset",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
];

// Never hand tokens to browser JS: apiServer already stored them in
// httpOnly cookies.
const TOKEN_KEYS = ["accessToken", "refreshToken"];

export const stripTokens = <T>(data: T): T => {
  if (!isPlainObject(data)) return data;
  if (!TOKEN_KEYS.some((key) => key in data)) return data;
  const copy: JsonObject = { ...data };
  TOKEN_KEYS.forEach((key) => delete copy[key]);
  return copy as T;
};

/** Backend response → browser response, keeping status, JSON keys and binaries. */
export const toNextResponse = ({ data, blob, response }: ServerResponse) => {
  const headers = new Headers({ "Cache-Control": "no-store" });
  PASSTHROUGH_HEADERS.forEach((name) => {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  });

  if (response.status === 204 || response.status === 304) {
    return new NextResponse(null, { status: response.status, headers });
  }

  if (blob) {
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "application/octet-stream",
    );
    // Downloads come from our own origin; don't let the browser sniff them
    headers.set("X-Content-Type-Options", "nosniff");
    return new NextResponse(blob, { status: response.status, headers });
  }

  return NextResponse.json(stripTokens(data), {
    status: response.status,
    headers,
  });
};

const METHODS_WITH_BODY: readonly HttpMethod[] = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];

export class InvalidJsonBodyError extends Error {}

/** Reads an optional JSON body; throws InvalidJsonBodyError on bad JSON. */
export const readJsonBody = async (
  request: Request,
): Promise<unknown | undefined> => {
  const text = await request.text();
  if (!text.trim()) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new InvalidJsonBodyError("Invalid JSON body");
  }
};

type Send = (props: {
  url: string;
  method: HttpMethod;
  body?: unknown;
  authenticateAs: AuthAudience | null;
}) => Promise<ServerResponse>;

/**
 * Forwards `request` to the backend according to FORWARD_RULES.
 * `send` is injectable for tests.
 */
export const forwardRequest = async (
  request: NextRequest,
  audience: Audience,
  segments: readonly string[],
  send: Send = apiServer,
): Promise<NextResponse> => {
  const method = request.method.toUpperCase() as HttpMethod;

  let body: unknown;
  if (METHODS_WITH_BODY.includes(method)) {
    try {
      body = await readJsonBody(request);
    } catch (error) {
      if (error instanceof InvalidJsonBodyError) {
        return errorResponse(400, error.message);
      }
      throw error;
    }
  }

  const plan = planForward({
    audience,
    segments,
    method,
    search: request.nextUrl.search,
    body,
  });

  if (!plan.ok) {
    const response = errorResponse(plan.status, plan.error);
    if (plan.allow) response.headers.set("Allow", plan.allow);
    return response;
  }

  const result = await send({
    url: plan.url,
    method: plan.method,
    body: plan.body,
    authenticateAs: plan.authenticateAs,
  });

  return toNextResponse(result);
};

/**
 * Forwards to one fixed backend endpoint (explicit routes such as /api/auth/*).
 * The JSON body is passed through with tokens stripped.
 */
export const forwardTo = async (
  request: NextRequest,
  {
    url,
    method = request.method.toUpperCase() as HttpMethod,
    authenticateAs,
    transformBody,
  }: {
    url: string;
    method?: HttpMethod;
    authenticateAs: AuthAudience | null;
    transformBody?: (body: unknown) => unknown;
  },
  send: Send = apiServer,
): Promise<NextResponse> => {
  let body: unknown;
  if (METHODS_WITH_BODY.includes(method)) {
    try {
      body = await readJsonBody(request);
    } catch (error) {
      if (error instanceof InvalidJsonBodyError) {
        return errorResponse(400, error.message);
      }
      throw error;
    }
    if (transformBody) body = transformBody(body);
  }

  return toNextResponse(await send({ url, method, body, authenticateAs }));
};

type CatchAllContext = { params: Promise<{ path?: string[] }> };

/** Route handlers for an `app/api/.../[...path]/route.ts` catch-all. */
export const createForwardHandlers = (audience: Audience) => {
  const handler = withErrorHandling(
    `forward:${audience}`,
    async (request: NextRequest, { params }: CatchAllContext) => {
      const { path = [] } = await params;
      return forwardRequest(request, audience, path);
    },
  );

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    PATCH: handler,
    DELETE: handler,
  };
};
