import { apiError, apiSuccess } from "@/lib/api-response";
import { unstable_rethrow } from "next/navigation";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { LeaseRepository } from "@/repositories/lease.repository";
const privateResponse=(response:Response)=>{response.headers.set("Cache-Control","private, no-store, max-age=0");return response;};
export async function GET(){try{const profile=await getCurrentProfile();if(!profile)return apiError("Authentication required",401);if(!isAccountOperational(profile))return apiError("Account access unavailable",403);return privateResponse(apiSuccess(await LeaseRepository.list(profile),"Leases loaded"));}catch(error){unstable_rethrow(error);console.error("[GET /api/leases]",error);return apiError("Unable to load leases",500);}}
