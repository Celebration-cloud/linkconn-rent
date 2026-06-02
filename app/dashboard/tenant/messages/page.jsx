"use client";
import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Sun, Moon, MessageCircleMore } from "lucide-react";

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
    paid: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "✓",
      label: "Paid",
    },
    pending: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      icon: "◷",
      label: "Pending",
    },
    failed: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      icon: "✕",
      label: "Failed",
    },
    due: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-300",
      icon: "!",
      label: "Due",
    },
    in_progress: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      icon: "⟳",
      label: "In Progress",
    },
    open: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      icon: "○",
      label: "Open",
    },
    resolved: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      icon: "✓",
      label: "Resolved",
    },
  };
  const config = statusConfig[status] || statusConfig.pending;

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
  <div className="animate-pulse max-w-6xl">
    <div className="mb-6 h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-[calc(100vh-10rem)]">
      <div className="flex">
        <div className="w-80 border-r border-gray-100 dark:border-gray-700 p-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Mock API - simulates data fetch
const fetchMessages = async () => {
  await new Promise((r) => setTimeout(r, 300));

  return {
    conversations: [
      {
        id: 1,
        contact: "Property Manager",
        avatar: "PM",
        lastMessage:
          "Your maintenance request has been scheduled for tomorrow.",
        lastMessageTime: "2h ago",
        unreadCount: 2,
        messages: [
          {
            id: 1,
            text: "Hi Alex, hope you're doing well!",
            sender: "them",
            time: "Dec 28, 9:00 AM",
            read: true,
          },
          {
            id: 2,
            text: "I wanted to follow up on your maintenance request about the kitchen faucet.",
            sender: "them",
            time: "Dec 28, 9:01 AM",
            read: true,
          },
          {
            id: 3,
            text: "Thanks for reaching out! Yes, it's been dripping constantly.",
            sender: "me",
            time: "Dec 28, 10:30 AM",
            read: true,
          },
          {
            id: 4,
            text: "I've scheduled a plumber to come by tomorrow between 9-11 AM. Will someone be home?",
            sender: "them",
            time: "Dec 28, 11:00 AM",
            read: true,
          },
          {
            id: 5,
            text: "Yes, I'll make sure to be here. Thank you!",
            sender: "me",
            time: "Dec 28, 11:15 AM",
            read: true,
          },
          {
            id: 6,
            text: "Your maintenance request has been scheduled for tomorrow.",
            sender: "them",
            time: "Dec 29, 2:00 PM",
            read: false,
          },
          {
            id: 7,
            text: "The plumber confirmed they'll arrive around 9:30 AM.",
            sender: "them",
            time: "Dec 29, 4:30 PM",
            read: false,
          },
        ],
      },
      {
        id: 2,
        contact: "Leasing Office",
        avatar: "LO",
        lastMessage: "Your lease renewal documents are ready for review.",
        lastMessageTime: "1d ago",
        unreadCount: 1,
        messages: [
          {
            id: 1,
            text: "Hello Alex! Your lease is coming up for renewal next month.",
            sender: "them",
            time: "Dec 27, 10:00 AM",
            read: true,
          },
          {
            id: 2,
            text: "Thanks for the reminder. What are my options?",
            sender: "me",
            time: "Dec 27, 2:00 PM",
            read: true,
          },
          {
            id: 3,
            text: "You can renew for 12 months at $1,900/mo or month-to-month at $2,100/mo.",
            sender: "them",
            time: "Dec 27, 2:30 PM",
            read: true,
          },
          {
            id: 4,
            text: "Your lease renewal documents are ready for review.",
            sender: "them",
            time: "Dec 28, 9:00 AM",
            read: false,
          },
        ],
      },
      {
        id: 3,
        contact: "Maintenance Team",
        avatar: "MT",
        lastMessage:
          "The repair has been completed. Please let us know if you have any issues.",
        lastMessageTime: "3d ago",
        unreadCount: 0,
        messages: [
          {
            id: 1,
            text: "Hi, we'll be stopping by today to fix the window latch.",
            sender: "them",
            time: "Dec 18, 9:00 AM",
            read: true,
          },
          {
            id: 2,
            text: "Great, I'll leave the key with the front desk.",
            sender: "me",
            time: "Dec 18, 9:30 AM",
            read: true,
          },
          {
            id: 3,
            text: "The repair has been completed. Please let us know if you have any issues.",
            sender: "them",
            time: "Dec 18, 3:30 PM",
            read: true,
          },
          {
            id: 4,
            text: "Everything looks great! Thanks so much.",
            sender: "me",
            time: "Dec 18, 6:00 PM",
            read: true,
          },
        ],
      },
    ],
  };
};

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMessages();

        setConversations(data.conversations);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [
            ...conv.messages,
            {
              id: Date.now(),
              text: newMessage,
              sender: "me",
              time: new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              read: true,
            },
          ],
          lastMessage: newMessage,
          lastMessageTime: "Just now",
          unreadCount: 0,
        };
      }

      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation(
      updatedConversations.find((c) => c.id === selectedConversation.id),
    );
    setNewMessage("");
  };

  const markAsRead = (convId) => {
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === convId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map((msg) => ({ ...msg, read: true })),
        };
      }

      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation(updatedConversations.find((c) => c.id === convId));
  };

  if (loading) return <Skeleton />;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Messages
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Communicate with property management
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-[calc(100vh-15rem)] flex overflow-hidden">
        {/* Conversation List */}
        <div
          className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-700 flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Inbox
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedConversation?.id === conv.id ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
                onClick={() => {
                  setSelectedConversation(conv);
                  markAsRead(conv.id);
                }}
              >
                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {conv.contact}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat View */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <button
                className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {selectedConversation.avatar}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedConversation.contact}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Property Management
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${msg.sender === "me" ? "order-1" : ""}`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        msg.sender === "me"
                          ? "bg-blue-600 dark:bg-blue-700 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <div
                      className={`flex items-center gap-2 mt-1 ${msg.sender === "me" ? "justify-end" : ""}`}
                    >
                      <p
                        className={`text-xs ${msg.sender === "me" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
                      >
                        {msg.time}
                      </p>
                      {msg.sender === "me" && (
                        <span
                          className={`text-xs ${msg.read ? "text-blue-200" : "text-blue-300"}`}
                        >
                          {msg.read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-800"
              onSubmit={handleSendMessage}
            >
              <input
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Type a message..."
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-colors"
                type="submit"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircleMore className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
