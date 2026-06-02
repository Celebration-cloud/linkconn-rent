"use client";

import { MessageSquare } from "lucide-react";
import Card from "./Card";

export default function MessagesCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-700/20 rounded-lg">
            <MessageSquare
              size={18}
              className="text-green-600 dark:text-green-300"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Messages</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              3 unread
            </p>
          </div>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400">
          View all
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-200">
        Your maintenance request has been scheduled for tomorrow.
      </div>

      <button className="mt-4 w-full bg-gray-900 dark:bg-gray-200 dark:text-gray-900 text-white font-medium py-2.5 rounded-xl transition-colors">
        Reply
      </button>
    </Card>
  );
}
