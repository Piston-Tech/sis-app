import { createForwardHandlers } from "@/lib/api/forward";

// Allowlisted forwarding to the backend; see FORWARD_RULES.public in lib/api/forward.ts
export const dynamic = "force-dynamic";

const handlers = createForwardHandlers("public");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
