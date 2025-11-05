import UserAccessGuard from "@/components/shared/auth/UserAccessGuard";

export default function DashboardEntry() {
  return (
    <UserAccessGuard>
      <div className="p-6">
        <h1 className="text-xl font-semibold">Welcome to your dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Redirecting if access is restricted...
        </p>
      </div>
    </UserAccessGuard>
  );
}
