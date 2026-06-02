"use client";

import ActionButton from "./_components/ActionButton";
import LeaseCard from "./_components/LeaseCard";
import MaintenanceCard from "./_components/MaintenanceCard";
import MessagesCard from "./_components/MessagesCard";
import RentStatusCard from "./_components/RentStatusCard";
import TopBar from "./_components/TopBar";


export default function TenantDashboardPage() {
  return (
    <div className="max-w-6xl space-y-6">
      {/* Alerts */}
      <TopBar
        user={{
          id: 2,
          name: "Alex Johnson",
          email: "alex@email.com",
          avatar: null,
          unit: "Apt 4B",
        }}
        alerts={[
          { id: 1, type: "warning", text: "Rent due in 5 days" },
          { id: 2, type: "info", text: "Building maintenance: Jan 10th" },
        ]}
      />
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RentStatusCard />
        <LeaseCard />
        <MaintenanceCard />
        <MessagesCard />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <p className="text-sm font-medium mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <ActionButton label="Pay rent" />
          <ActionButton label="Submit request" />
          <ActionButton label="View lease" />
          <ActionButton label="Contact manager" />
        </div>
      </div>
    </div>
  );
}

