"use client";

import { useState, useEffect } from "react";
import { Download, Sun, Moon, Home } from "lucide-react";

// Theme Toggle Component
const ThemeToggle = ({ darkMode, setDarkMode }) => (
  <button
    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    onClick={() => setDarkMode(!darkMode)}
  >
    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
);

// Status Badge Component with dark mode support
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      icon: "✓",
      label: "Active",
    },
    expiring: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      icon: "!",
      label: "Expiring Soon",
    },
    pending: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      icon: "⋯",
      label: "Pending",
    },
  };
  const config = statusConfig[status] || statusConfig.active;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]">
        {config.icon}
      </span>
      {config.label}
    </span>
  );
};

// Loading Skeleton
const Skeleton = () => (
  <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"
        />
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Mock API - simulates data fetch
const fetchLeaseData = async () => {
  await new Promise((r) => setTimeout(r, 300));

  return {
    details: {
      property: "Sunset Gardens",
      unit: "Apt 4B",
      address: "1234 Sunset Boulevard, Los Angeles, CA 90028",
      startDate: "2024-01-15",
      endDate: "2025-01-14",
      monthlyRent: 1850,
      securityDeposit: 1850,
      landlord: "Pacific Property Management",
      landlordPhone: "(555) 123-4567",
      landlordEmail: "contact@pacificpm.com",
      status: "active",
    },
    houseRules: [
      {
        id: 1,
        title: "Quiet Hours",
        description:
          "Quiet hours are from 10:00 PM to 8:00 AM daily. Please keep noise to a minimum during these hours.",
      },
      {
        id: 2,
        title: "Pets",
        description:
          "Pets are allowed with prior approval and a $500 pet deposit. Maximum of 2 pets per unit.",
      },
      {
        id: 3,
        title: "Parking",
        description:
          "Each unit is assigned one parking spot. Guest parking is available in the visitor lot.",
      },
      {
        id: 4,
        title: "Trash & Recycling",
        description:
          "Trash pickup is on Tuesdays and Fridays. Recycling bins are located in the back parking lot.",
      },
      {
        id: 5,
        title: "Common Areas",
        description:
          "Pool hours are 8 AM - 10 PM. Gym is accessible 24/7 with key fob. BBQ area requires reservation.",
      },
      {
        id: 6,
        title: "Modifications",
        description:
          "No permanent modifications without written approval. Minor decorations (nails, hooks) are permitted.",
      },
    ],
    documents: [
      {
        id: 1,
        name: "Lease Agreement",
        type: "pdf",
        signedDate: "2024-01-10",
        size: "2.4 MB",
      },
      {
        id: 2,
        name: "Move-in Checklist",
        type: "pdf",
        signedDate: "2024-01-15",
        size: "856 KB",
      },
      {
        id: 3,
        name: "Pet Addendum",
        type: "pdf",
        signedDate: "2024-01-10",
        size: "124 KB",
      },
      {
        id: 4,
        name: "Parking Agreement",
        type: "pdf",
        signedDate: "2024-01-10",
        size: "98 KB",
      },
      {
        id: 5,
        name: "Renter's Insurance Certificate",
        type: "pdf",
        signedDate: "2024-01-12",
        size: "312 KB",
      },
    ],
  };
};

const LeasePage = () => {
  const [leaseData, setLeaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchLeaseData();

        setLeaseData(data);
      } catch (error) {
        console.error("Failed to load lease data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const downloadDocument = (doc) => {
    const content = `Document: ${doc.name}
Type: ${doc.type.toUpperCase()}
Signed: ${doc.signedDate}
Size: ${doc.size}
[This is a placeholder for the actual document content]`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${doc.name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Skeleton />;

  const { details, houseRules, documents } = leaseData;
  const endDate = new Date(details.endDate);
  const today = new Date();
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil(
    (endDate - new Date(details.startDate)) / (1000 * 60 * 60 * 24),
  );
  const progress = Math.max(
    0,
    Math.min(100, ((totalDays - daysLeft) / totalDays) * 100),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Lease Information
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View your lease details, rules, and documents
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {["details", "rules", "documents"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Property Information
              </h3>
              <StatusBadge status={details.status} />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Property
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {details.property}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {details.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {details.address}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Lease Terms
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Start Date
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(details.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  End Date
                </span>
                <span
                  className={`font-medium ${daysLeft < 60 ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}
                >
                  {endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Monthly Rent
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${details.monthlyRent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Security Deposit
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${details.securityDeposit.toLocaleString()}
                </span>
              </div>
              <div className="pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    Lease Progress
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {daysLeft} days remaining
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Property Management
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Company
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {details.landlord}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {details.landlordPhone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {details.landlordEmail}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "rules" && (
        <div className="grid gap-4 md:grid-cols-2">
          {houseRules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                {rule.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-xs font-bold uppercase">
                      PDF
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {doc.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Signed {new Date(doc.signedDate).toLocaleDateString()} •{" "}
                      {doc.size}
                    </p>
                  </div>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  onClick={() => downloadDocument(doc)}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeasePage;
