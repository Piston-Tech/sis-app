import {
  InvalidJsonBodyError,
  readJsonBody,
  toNextResponse,
} from "@/lib/api/forward";
import { errorResponse, withErrorHandling } from "@/lib/api/respond";
import apiServer from "@/services/apiServer";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Current student (apiServer refreshes the userDetails cookie on success)
export const GET = withErrorHandling("user/me", async () =>
  toNextResponse(await apiServer({ url: "/auth/me", method: "GET" })),
);

export const PUT = withErrorHandling(
  "user/update",
  async (request: NextRequest) => {
    let body: unknown;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      if (error instanceof InvalidJsonBodyError) {
        return errorResponse(400, error.message);
      }
      throw error;
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return errorResponse(400, "Expected a JSON object");
    }

    // The backend identifies the student from the access token, so never
    // forward a client-supplied id.
    const { id: _ignoredId, ...profile } = body as Record<string, unknown>;

    const result = await apiServer({
      url: "/students/me",
      method: "PUT",
      body: profile,
    });

    // Callers read `user`; the backend returns the profile as `student`.
    // Every other key is passed through.
    if (result.response.ok && !result.blob && result.data.student) {
      result.data = { ...result.data, user: result.data.student };
    }

    return toNextResponse(result);
  },
);
