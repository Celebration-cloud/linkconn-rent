"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, Users, Building2, Settings, LogOut } from "lucide-react";
import { Button } from "@heroui/react";

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Tenants", href: "/dashboard/tenants", icon: Users },
    { label: "Properties", href: "/dashboard/properties", icon: Building2 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside
      className={`h-screen border-r bg-white transition-all ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full justify-between p-4">
        <div>
          <Button
            size="sm"
            variant="light"
            onPress={() => setCollapsed(!collapsed)}
            className="mb-4"
          >
            {collapsed ? "→" : "←"}
          </Button>

          <nav className="space-y-2">
            {links.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-2 rounded-md text-default-700 hover:bg-default-100 transition"
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <Button
          color="danger"
          variant="light"
          startContent={<LogOut size={16} />}
        >
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
};
