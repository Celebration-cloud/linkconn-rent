import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import {
  messageCreateSchema,
  messageCursorSchema,
} from "@/schemas/operating-system";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const query = messageCursorSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const { id } = await context.params;
    const messages = await OperatingSystemRepository.listMessages(
      profile.id,
      id,
      query.cursor ? new Date(query.cursor) : undefined,
      query.limit,
    );
    const nextCursor =
      messages.length === query.limit ? messages[0]?.createdAt.toISOString() : null;
    return apiSuccess({ messages, nextCursor }, "Messages loaded");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Conversation not found", 404);
    }
    console.error("[GET /api/conversations/:id/messages]", error);
    return apiError("Unable to load messages", 500);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const input = messageCreateSchema.parse(await request.json());
    const { id } = await context.params;
    const message = await OperatingSystemRepository.sendMessage(
      profile.id,
      id,
      input.body,
    );
    return apiSuccess(
      { ...message, clientId: input.clientId },
      "Message sent",
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Conversation not found", 404);
    }
    console.error("[POST /api/conversations/:id/messages]", error);
    return apiError("Unable to send message", 500);
  }
}
