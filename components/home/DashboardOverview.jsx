"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Eye, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  Calendar,
  AlertCircle,
  Wrench,
  Bookmark,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("landlord");

  // Landlord Data
  const landlordStats = [
    { label: "Total Properties", value: "14", icon: Building2, color: "text-slate-400" },
    { label: "Active Listings", value: "9", icon: Eye, color: "text-green-500" },
    { label: "Occupancy Rate", value: "82%", icon: TrendingUp, color: "text-blue-500" },
    { label: "Open Inquiries", value: "27", icon: MessageSquare, color: "text-purple-500" },
  ];

  const landlordChartData = [
    { month: "Aug", val: 8 },
    { month: "Sep", val: 12 },
    { month: "Oct", val: 16 },
    { month: "Nov", val: 10 },
    { month: "Dec", val: 20 },
    { month: "Jan", val: 24 }, // active month
  ];

  const landlordPayments = [
    { name: "Chidi Okafor", desc: "Lekki Duplex · Jan 12, 2024", amount: "₦4,500,000", status: "Paid", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    { name: "Amaka Eze", desc: "Wuse Apartment · Feb 02, 2024", amount: "₦2,800,000", status: "Due", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400" },
    { name: "Tunde Bello", desc: "Gwarinpa House · Dec 28, 2023", amount: "₦3,200,000", status: "Overdue", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
    { name: "Ngozi Ali", desc: "Yaba Studio · Mar 15, 2024", amount: "₦850,000", status: "Due", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400" },
  ];

  // Tenant Data
  const tenantStats = [
    { label: "Active Leases", value: "1", icon: FileText, color: "text-green-500" },
    { label: "Rent Status", value: "Paid", icon: CheckCircle2, color: "text-blue-500" },
    { label: "Maintenance Requests", value: "0", icon: Wrench, color: "text-slate-400" },
    { label: "Saved Properties", value: "12", icon: Bookmark, color: "text-purple-500" },
  ];

  const tenantChartData = [
    { month: "Aug", val: 15 },
    { month: "Sep", val: 15 },
    { month: "Oct", val: 15 },
    { month: "Nov", val: 15 },
    { month: "Dec", val: 15 },
    { month: "Jan", val: 15 },
  ];

  const tenantPayments = [
    { name: "Rent Payment", desc: "Lekki Studio Rent · Jan 2024", amount: "₦1,200,000", status: "Paid", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    { name: "Security Deposit", desc: "Lekki Studio Deposit · Jan 2024", amount: "₦300,000", status: "Paid", color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    { name: "Utility Charge", desc: "Maintenance Levy · Feb 2024", amount: "₦50,000", status: "Due", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400" },
  ];

  const currentStats = activeTab === "landlord" ? landlordStats : tenantStats;
  const currentChart = activeTab === "landlord" ? landlordChartData : tenantChartData;
  const currentPayments = activeTab === "landlord" ? landlordPayments : tenantPayments;

  return (
    <section className="py-24 dark-section-bg text-white w-full">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Powerful Dashboards</p>
          <h2 className="text-4xl font-extrabold mb-4 text-white">Manage everything from one screen</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
            Real-time analytics, rent tracking and maintenance — purpose-built for landlords and tenants.
          </p>

          {/* Toggle pill selector */}
          <div className="mt-8 inline-flex bg-slate-800/80 rounded-full p-1 border border-slate-700/50 backdrop-blur-sm relative">
            <button 
              onClick={() => setActiveTab("landlord")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all relative z-10 ${
                activeTab === "landlord" ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              Landlord Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("tenant")}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all relative z-10 ${
                activeTab === "tenant" ? "bg-white text-slate-900 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              Tenant Dashboard
            </button>
          </div>
        </div>

        {/* Dashboard Grid Content */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-900">
          
          {/* Left Block (8 columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stats Subgrid */}
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence mode="wait">
                {currentStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={`${activeTab}-${idx}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"
                    >
                      <Icon className={`w-5 h-5 ${stat.color} mb-4`} />
                      <div>
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{stat.label}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Income/Activity Chart Card */}
            <motion.div 
              layout
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm text-left"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {activeTab === "landlord" ? "Rental Income" : "Annual Rent Expense"}
                  </div>
                  <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                    {activeTab === "landlord" ? "₦18,400,000" : "₦1,550,000"}
                  </div>
                </div>
                {activeTab === "landlord" ? (
                  <span className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +12.4%
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs font-bold">
                    Fixed Rate
                  </span>
                )}
              </div>

              {/* Animated Chart */}
              <div className="h-28 border-b border-slate-100 dark:border-slate-700 flex items-end gap-2 pb-2">
                {currentChart.map((d, i) => {
                  const maxVal = Math.max(...currentChart.map(x => x.val));
                  const percentage = (d.val / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <motion.div
                        className={`w-full rounded-t-md transition-colors cursor-pointer ${
                          i === currentChart.length - 1
                            ? "bg-green-500 dark:bg-green-600"
                            : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X Axis labels */}
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-2 px-1">
                {currentChart.map((d, i) => (
                  <span key={i} className="w-1/6 text-center">{d.month}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Block (4 columns) - Rent Tracking Card */}
          <div className="lg:col-span-5 h-full">
            <motion.div 
              layout
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col text-left"
            >
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {activeTab === "landlord" ? "Rent Tracking" : "Payment Ledger"}
                </h3>
              </div>

              <div className="space-y-4 flex-grow">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {currentPayments.map((p, idx) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0`}
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{p.amount}</p>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${p.color}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
