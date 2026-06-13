"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { Home, Users, DollarSign, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function LandlordDashboardPage() {
  return (
    <div className="max-w-6xl space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Landlord Dashboard
          </h1>
          <p className="text-default-500 text-sm">
            Manage your properties, tenants, and rental income.
          </p>
        </div>
        <Button
          color="primary"
          endContent={<Plus className="w-4 h-4" />}
          variant="shadow"
        >
          Add Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Total Properties
                </p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-success/10 text-success">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Monthly Revenue
                </p>
                <p className="text-2xl font-bold">$18,450</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -4 }}>
          <Card className="bg-card/70 border border-default-200/50 shadow-md">
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-default-500 text-xs font-semibold">
                  Active Tenants
                </p>
                <p className="text-2xl font-bold">9</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <Card className="bg-card/70 border border-default-200/50 shadow-md">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold mb-4">Properties Overview</h2>
          <div className="text-center py-8 text-default-400">
            <p className="text-sm">No properties listed yet.</p>
            <Button className="mt-3" size="sm" variant="flat">
              Create Your First Listing
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
