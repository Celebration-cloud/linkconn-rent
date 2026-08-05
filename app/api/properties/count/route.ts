import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { propertySearchSchema } from "@/schemas/operating-system";

export async function GET(request: Request) {
  try {
    const input = propertySearchSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const totalItems = await OperatingSystemRepository.countProperties(input);
    return apiSuccess({ totalItems }, "Property count loaded");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    console.error("[GET /api/properties/count]", error);
    return apiError("Unable to count properties", 500);
  }
}
