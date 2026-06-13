"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { Settings, Users, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Control Panel
          </h1>
          <p className="text-default-500 text-sm">
            System administration, role management, and global oversight.
          </p>
        </div>
        <Button
          color="secondary"
          endContent={<Settings className="w-4 h-4" />}
          variant="flat"
        >
          System Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Total Users
                </p>
                <p className="text-2xl font-bold">142</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-success/10 text-success">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  System Status
                </p>
                <p className="text-2xl font-bold">Online</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-danger/10 text-danger">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Unresolved Flags
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-card/70 border border-default-200/50 shadow-md">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold mb-4">Admin Audit Log</h2>
          <div className="text-center py-8 text-default-400 text-sm">
            <p>No security flags or system issues recorded.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
