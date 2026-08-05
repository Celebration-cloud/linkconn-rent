import { useAuth } from "@/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";

export function useRequireAuth() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  return {
    requireAuth: (action?: () => void) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return false;
      }
      action?.();
      return true;
    },
    user,
  };
}
