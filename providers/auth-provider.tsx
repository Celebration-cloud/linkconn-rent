"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  Role,
  Permission,
  AuthUser,
  AuthView,
  SignupData,
  NotificationItem,
  SessionDevice,
} from "@/domain/types/auth";
import { hasPermission } from "@/domain/constants/permissions";
import { authClient } from "@/lib/neon-auth-client";
import { mapSessionToAuthUser } from "@/lib/auth-mappers";
import { performLogout } from "@/lib/auth/logout";
import { getCheckoutAmount, getPlanMeta } from "@/domain/billing";
import { useAuthFlowStore } from "@/stores/auth-flow-store";
import { toastError, toastInfo, toastSuccess } from "@/stores/toast-store";
import { isAdminReviewExemptRole } from "@/lib/auth/review-access";

// ─────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────

/* eslint-disable no-unused-vars -- parameter labels document the context contract */
type AuthCtx = {
  user: AuthUser | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  isLoggingOut: boolean;
  modalView: AuthView;
  signupDraft: Partial<SignupData>;
  pendingEmail: string | null;
  notifications: NotificationItem[];
  devices: SessionDevice[];
  activeAccountTab: string;
  hasPermission: (p: Permission) => boolean;
  openAuth: (v: AuthView) => void;
  closeAuth: () => void;
  setSignupDraft: (d: Partial<SignupData>) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; require2fa?: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (password: string) => Promise<boolean>;
  requestReset: (email: string) => Promise<boolean>;
  completeOnboarding: (payload: unknown) => Promise<{ ok: boolean; error?: string }>;
  toggle2fa: (on: boolean) => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<NotificationItem, "id" | "read" | "time">) => void;
  setActiveAccountTab: (t: string) => void;
  refreshProfile: () => Promise<void>;
};
/* eslint-enable no-unused-vars */

const Ctx = createContext<AuthCtx>({
  user: null,
  isLoadingProfile: true,
  profileError: null,
  isLoggingOut: false,
  modalView: "closed",
  signupDraft: {},
  pendingEmail: null,
  notifications: [],
  devices: [],
  activeAccountTab: "overview",
  hasPermission: () => false,
  openAuth: () => undefined,
  closeAuth: () => undefined,
  setSignupDraft: () => undefined,
  login: async () => ({ ok: false }),
  logout: async () => undefined,
  resetPassword: async () => false,
  requestReset: async () => false,
  completeOnboarding: async () => ({ ok: false }),
  toggle2fa: () => undefined,
  updateProfile: () => undefined,
  markNotificationRead: () => undefined,
  markAllNotificationsRead: () => undefined,
  addNotification: () => undefined,
  setActiveAccountTab: () => undefined,
  refreshProfile: async () => undefined,
});

export const useAuth = () => {
  return useContext(Ctx);
};

// ─────────────────────────────────────────────────────────────
// Static helpers / defaults
// ─────────────────────────────────────────────────────────────

const NOTIF_KEY = "linkconn.notifs";

const defaultNotifs: NotificationItem[] = [
  {
    id: "n1",
    title: "Welcome to LinkConn Rent",
    body: "Complete your profile to get personalised recommendations.",
    type: "info",
    time: "Just now",
    read: false,
  },
  {
    id: "n2",
    title: "New listing matches your search",
    body: "3 new homes in Lekki Phase 1 match your criteria.",
    type: "info",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n3",
    title: "Rent reminder",
    body: "Your next rent payment is due in 14 days.",
    type: "payment",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n4",
    title: "Maintenance request updated",
    body: "Leaking kitchen tap — status changed to 'In Progress'.",
    type: "maintenance",
    time: "2 days ago",
    read: true,
  },
];

const defaultDevices: SessionDevice[] = [
  {
    id: "d1",
    device: "MacBook Pro · Chrome",
    location: "Lagos, Nigeria",
    ip: "197.210.xx.xx",
    lastActive: "Just now",
    current: true,
  },
  {
    id: "d2",
    device: "iPhone 15 · Safari",
    location: "Lagos, Nigeria",
    ip: "197.210.xx.xx",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "d3",
    device: "Android · Chrome",
    location: "Abuja, Nigeria",
    ip: "102.89.xx.xx",
    lastActive: "3 days ago",
    current: false,
  },
];

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Neon Auth session (identity)
  const session = authClient.useSession();
  const sessionUser = useMemo(
    () => mapSessionToAuthUser(session.data ?? null),
    [session.data]
  );

  // DB profile overlay (role, onboardingComplete, sub-profiles)
  const [dbProfile, setDbProfile] = useState<Partial<AuthUser> | null>(null);
  const [dbProfileOwnerId, setDbProfileOwnerId] = useState<string | null>(null);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Merged user — database product profile overlays the identity session.
  const user: AuthUser | null = useMemo(() => {
    if (!sessionUser) return null;
    const matchingProfile =
      dbProfileOwnerId === sessionUser.id ? dbProfile : null;
    return { ...sessionUser, ...matchingProfile };
  }, [dbProfile, dbProfileOwnerId, sessionUser]);
  const isProfileReady = Boolean(
    sessionUser && dbProfileOwnerId === sessionUser.id,
  );
  const isLoadingProfile =
    session.isPending ||
    Boolean(
      sessionUser &&
        !profileError &&
        (!isProfileReady || isRefreshingProfile),
    );

  const [modalView, setModalView] = useState<AuthView>("closed");
  const [signupDraft, setDraft] = useState<Partial<SignupData>>({});
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(defaultNotifs);
  const [devices] = useState<SessionDevice[]>(defaultDevices);
  const [activeAccountTab, setActiveAccountTab] = useState("overview");

  // ── Hydrate notifications from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) setNotifications(JSON.parse(raw) as NotificationItem[]);
    } catch {
      // Fail-safe
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // ── Fetch DB profile whenever session user changes ──
  const refreshProfile = useCallback(async () => {
    const sessionAccount = session.data?.user;
    if (!sessionAccount) return;
    try {
      setIsRefreshingProfile(true);
      setProfileError(null);
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("We could not load your account profile.");
      }
      const json = await res.json() as { success: boolean; data: Record<string, unknown> };
      if (!json.success || !json.data) {
        throw new Error("We could not load your account profile.");
      }

      const p = json.data;
      setDbProfile({
        role: (p.role as Role) || "Tenant",
        onboardingComplete: Boolean(p.onboardingComplete),
        accountReviewStatus:
          (p.accountReviewStatus as AuthUser["accountReviewStatus"]) ||
          "NotSubmitted",
        accountReviewReason:
          (p.accountReviewReason as string) || undefined,
        phone: (p.phone as string) || undefined,
        avatar: (p.avatar as string) || undefined,
        bio: (p.bio as string) || undefined,
        location: (p.location as string) || "Nigeria",
        firstName: (p.firstName as string) || sessionUser?.firstName,
        lastName: (p.lastName as string) || sessionUser?.lastName,
        verificationLevel: (p.verificationLevel as AuthUser["verificationLevel"]) || "Unverified",
      });
      setDbProfileOwnerId(sessionAccount.id);
    } catch (err) {
      console.error("[AuthProvider] refreshProfile failed:", err);
      setProfileError(
        err instanceof Error
          ? err.message
          : "We could not load your account profile.",
      );
    } finally {
      setIsRefreshingProfile(false);
    }
  }, [session.data?.user, sessionUser?.firstName, sessionUser?.lastName]);

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data?.user) {
      setDbProfile(null);
      setDbProfileOwnerId(null);
      setProfileError(null);
      setIsRefreshingProfile(false);
      return;
    }
    void refreshProfile();
  }, [refreshProfile, session.data?.user, session.isPending]);

  // ── Email verification redirect ──
  useEffect(() => {
    if (session.isPending) return;
    const sessionData = session.data;
    if (!sessionData || sessionData.user.emailVerified) return;
    if (pathname === "/verify-email") return;

    router.replace(
      `/verify-email?email=${encodeURIComponent(sessionData.user.email)}&next=${encodeURIComponent(pathname || "/dashboard")}`
    );
  }, [pathname, router, session.data, session.isPending]);

  // ── Onboarding redirect (client-side guard) ──
  useEffect(() => {
    if (
      session.isPending ||
      isLoadingProfile ||
      !isProfileReady ||
      profileError
    ) return;
    if (!user) return;
    if (!user.emailVerified) return;
    if (user.onboardingComplete) return;
    if (isAdminReviewExemptRole(user.role)) return;
    const requiresCompletedProfile =
      pathname === "/account-review" ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/verification");
    if (!requiresCompletedProfile || pathname === "/onboarding") return;

    router.replace("/onboarding");
  }, [
    isLoadingProfile,
    isProfileReady,
    pathname,
    profileError,
    router,
    session.isPending,
    user,
  ]);

  // Keep unapproved accounts out of protected workspaces while still allowing
  // them to browse public listings and return to the review-status screen.
  useEffect(() => {
    if (
      session.isPending ||
      isLoadingProfile ||
      !isProfileReady ||
      profileError ||
      !user
    ) return;
    if (!user.emailVerified || !user.onboardingComplete) return;
    if (isAdminReviewExemptRole(user.role)) {
      if (pathname === "/account-review" || pathname === "/onboarding") {
        router.replace("/admin");
      }
      return;
    }

    if (user.accountReviewStatus === "Approved") {
      if (pathname === "/account-review" || pathname === "/onboarding") {
        router.replace("/dashboard");
      }
      return;
    }
    if (
      user.accountReviewStatus === "Rejected" &&
      pathname === "/onboarding"
    ) return;

    if (
      pathname === "/onboarding" ||
      pathname === "/account-review" ||
      pathname.startsWith("/dashboard")
    ) {
      if (pathname !== "/account-review") router.replace("/account-review");
    }
  }, [
    isLoadingProfile,
    isProfileReady,
    pathname,
    profileError,
    router,
    session.isPending,
    user,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────

  const openAuth = (v: AuthView) => {
    const next =
      pathname &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/signup")
        ? pathname
        : "/";
    const nextQuery =
      next && v !== "account" ? `?next=${encodeURIComponent(next)}` : "";

    switch (v) {
      case "login":
        router.push(`/login${nextQuery}`);
        return;
      case "signup":
      case "pick":
      case "role":
        router.push(`/signup${nextQuery}`);
        return;
      case "verify":
        router.push(`/verify-email${nextQuery}`);
        return;
      case "forgot":
        router.push(`/forgot-password${nextQuery}`);
        return;
      case "onboarding":
        router.push(`/onboarding`);
        return;
      case "account":
      case "success":
        router.push("/dashboard");
        return;
      default:
        router.push("/");
    }
  };

  const closeAuth = () => setModalView("closed");
  const setSignupDraft = (d: Partial<SignupData>) =>
    setDraft((p) => ({ ...p, ...d }));

  const login: AuthCtx["login"] = async (email, password) => {
    try {
      const res = await fetch("/api/auth/custom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, callbackURL: "/dashboard" }),
      });
      const resData = await res.json() as { success: boolean; data: { user: { emailVerified: boolean }; url?: string }; message?: string };

      if (!resData.success) {
        toastError("Sign in failed", resData.message || "Unable to sign in");
        return { ok: false, error: resData.message || "Unable to sign in" };
      }
      if (!resData.data.user.emailVerified) {
        toastInfo("Verify your email", "We sent you to the verification screen.");
        router.replace(
          `/verify-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent("/dashboard")}`
        );
        return { ok: true };
      }
      toastSuccess("Welcome back", "You are signed in.");
      router.push(resData.data.url || "/dashboard");
      router.refresh();
      return { ok: true };
    } catch (error) {
      toastError("Sign in failed", error instanceof Error ? error.message : "Unable to sign in");
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to sign in",
      };
    }
  };

  const logout: AuthCtx["logout"] = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await performLogout({
        signOut: () => authClient.signOut(),
        afterSessionCleared: () => {
          setDbProfile(null);
          setDbProfileOwnerId(null);
          setProfileError(null);
          useAuthFlowStore.getState().clearFlow();
          toastSuccess("Signed out", "Your session has been closed.");
        },
        // A full navigation clears cached protected RSC responses after the
        // server has removed the auth cookie.
        navigateHome: () => window.location.replace("/login"),
      });
    } catch (error) {
      toastError(
        "Sign out failed",
        error instanceof Error
          ? error.message
          : "Your session could not be closed. Please try again.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const requestReset: AuthCtx["requestReset"] = async (email) => {
    try {
      const res = await fetch("/api/auth/custom/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/reset-password" }),
      });
      const resData = await res.json() as { success: boolean };
      if (!resData.success) {
        toastError("Reset link failed", "We could not send the reset email.");
        return false;
      }
      setPendingEmail(email);
      toastSuccess("Reset link sent", "Check your inbox for the next step.");
      return true;
    } catch {
      toastError("Reset link failed", "We could not send the reset email.");
      return false;
    }
  };

  const resetPassword = async (newPassword: string) => {
    let token = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      token = params.get("token") || "";
    }
    try {
      const res = await fetch("/api/auth/custom/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, token }),
      });
      const resData = await res.json() as { success: boolean };
      if (!resData.success) {
        toastError("Password update failed", "We could not update your password.");
        return false;
      }
      toastSuccess("Password updated", "You can now sign in with the new password.");
      router.push("/login");
      return true;
    } catch {
      toastError("Password update failed", "We could not update your password.");
      return false;
    }
  };

  /**
   * Persists role-specific onboarding data to the DB via API, then
   * updates local state and redirects to the review-status screen.
   */
  const completeOnboarding: AuthCtx["completeOnboarding"] = async (payload) => {
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json() as { success: boolean; message?: string };
      if (!resData.success) {
        toastError("Onboarding failed", resData.message || "Unable to save onboarding data.");
        return { ok: false, error: resData.message || "Onboarding failed" };
      }
      const flow = useAuthFlowStore.getState();
      const plan = getPlanMeta(flow.role, flow.planKey);
      const checkoutAmount = getCheckoutAmount(plan, flow.billingPeriod);

      setDbProfile((p) => ({
        ...p,
        onboardingComplete: true,
        accountReviewStatus: "Pending",
        accountReviewReason: undefined,
      }));
      if (checkoutAmount > 0) {
        const checkoutRes = await fetch("/api/billing/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: flow.role,
            planKey: flow.planKey,
            billingPeriod: flow.billingPeriod,
            email: session.data?.user.email,
          }),
        });
        const checkoutData = await checkoutRes.json() as {
          success: boolean;
          message?: string;
          data?: { authorizationUrl?: string };
        };

        if (!checkoutData.success || !checkoutData.data?.authorizationUrl) {
          toastError("Checkout unavailable", checkoutData.message || "We could not start payment.");
          return { ok: false, error: checkoutData.message || "Unable to start checkout" };
        }

        toastInfo("Redirecting to payment", `Opening ${plan.name} checkout.`);
        useAuthFlowStore.getState().clearFlow();
        window.location.assign(checkoutData.data.authorizationUrl);
        return { ok: true };
      }

      toastSuccess(
        "Submitted for review",
        "We will notify you after an administrator checks your account.",
      );
      useAuthFlowStore.getState().clearFlow();
      router.push("/account-review");
      return { ok: true };
    } catch (err) {
      toastError("Onboarding failed", err instanceof Error ? err.message : "Unable to save onboarding data.");
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Onboarding failed",
      };
    }
  };

  const toggle2fa = (on: boolean) =>
    setDbProfile((p) => ({ ...p, twoFactorEnabled: on }));

  const updateProfile = (patch: Partial<AuthUser>) =>
    setDbProfile((p) => ({ ...p, ...patch }));

  const markNotificationRead = (id: string) =>
    setNotifications((n) =>
      n.map((x) => (x.id === id ? { ...x, read: true } : x))
    );

  const markAllNotificationsRead = () =>
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const addNotification: AuthCtx["addNotification"] = (n) =>
    setNotifications((list) => [
      {
        id: "n_" + Math.random().toString(36).slice(2, 8),
        ...n,
        read: false,
        time: "Just now",
      },
      ...list,
    ]);

  const checkPerm = (p: Permission) =>
    user ? hasPermission(user.role, p) : false;

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      isLoadingProfile,
      profileError,
      isLoggingOut,
      modalView,
      signupDraft,
      pendingEmail,
      notifications,
      devices,
      activeAccountTab,
      hasPermission: checkPerm,
      openAuth,
      closeAuth,
      setSignupDraft,
      login,
      logout,
      resetPassword,
      requestReset,
      completeOnboarding,
      toggle2fa,
      updateProfile,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      setActiveAccountTab,
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isLoadingProfile, profileError, isLoggingOut, modalView, signupDraft, pendingEmail, notifications, activeAccountTab]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
