"use client";

import { Card, CardBody } from "@heroui/react";
import { ListFilter, Users, ShieldAlert, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AgentDashboardPage() {
  return (
    <div className="max-w-6xl space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Agent Dashboard
          </h1>
          <p className="text-default-500 text-sm">
            Manage rental listings, verify tenant details, and support clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <ListFilter className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Active Listings
                </p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Total Clients
                </p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-danger/10 text-danger">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Pending Verifications
                </p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-card/70 border border-default-200/50 shadow-md">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-success" />
            Verification Requests
          </h2>
          <div className="text-center py-8 text-default-400">
            <p className="text-sm">
              No pending verification requests assigned to you.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
