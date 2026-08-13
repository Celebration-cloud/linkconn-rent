import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { NotificationRepository } from "@/repositories/notification.repository";
import { notificationMutationSchema } from "@/features/notifications/contracts";

function privateNoStore(response: Response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    return privateNoStore(apiSuccess(await NotificationRepository.list(profile.id), "Notifications loaded"));
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return apiError("Unable to load notifications", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const input = notificationMutationSchema.parse(await request.json());
    const result = input.action === "mark_read"
      ? await NotificationRepository.markRead(profile.id, input.notificationId)
      : await NotificationRepository.markAllRead(profile.id);
    const unreadCount = await NotificationRepository.unreadCount(profile.id);
    return privateNoStore(apiSuccess({ result, unreadCount }, input.action === "mark_read" ? "Notification marked read" : "Notifications marked read"));
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid notification action", 400);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Notification not found", 404);
    console.error("[PATCH /api/notifications]", error);
    return apiError("Unable to update notifications", 500);
  }
}
