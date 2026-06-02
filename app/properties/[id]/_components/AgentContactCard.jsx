"use client";

import { Phone, Mail, Clock } from "lucide-react";

export default function AgentContactCard({ agent }) {
  return (
    <div className="bg-white dark:bg-black backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-white/10">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Contact Agent
      </h3>

      {/* Agent Info */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-semibold mr-3">
          {agent.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {agent.name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Verified Real Estate Agent
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Phone className="mr-2 text-blue-800 dark:text-blue-500" size={16} />
          <span className="text-sm">{agent.phone}</span>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Mail className="mr-2 text-blue-800 dark:text-blue-500" size={16} />
          <span className="text-sm">{agent.email}</span>
        </div>

        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Clock className="mr-2 text-yellow-700" size={16} />
          <span className="text-sm">Response time: {agent.responseTime}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-lg transition flex items-center justify-center">
          <Phone className="mr-2" size={16} />
          Call Agent
        </button>

        <button className="flex-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 px-4 rounded-lg transition flex items-center justify-center">
          <Mail className="mr-2" size={16} />
          Email Agent
        </button>
      </div>
    </div>
  );
}
