"use client"

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Bell,
  User,
  Wrench,
  Plus,
  Image,
  MessageSquare,
  CheckCircle,
  Clock,
  X,
  Send,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";

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



// Mock API functions
const fetchMaintenanceRequests = async () => {
  await new Promise((r) => setTimeout(r, 300));
  return [
    {
      id: 1,
      title: "Leaky kitchen faucet",
      category: "Plumbing",
      priority: "medium",
      status: "in_progress",
      date: "2024-12-28",
      description:
        "The kitchen faucet has been dripping constantly for the past few days. Water is pooling under the sink.",
      photos: [
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=200",
      ],
      comments: [
        {
          id: 1,
          author: "Property Manager",
          text: "We've scheduled a plumber for tomorrow between 9-11am.",
          date: "2024-12-29 10:30",
          isStaff: true,
        },
        {
          id: 2,
          author: "Alex Johnson",
          text: "Thank you! I'll make sure someone is home.",
          date: "2024-12-29 11:15",
          isStaff: false,
        },
        {
          id: 3,
          author: "Property Manager",
          text: "The plumber is on their way now.",
          date: "2024-12-30 09:00",
          isStaff: true,
        },
      ],
    },
    {
      id: 2,
      title: "Heater not working properly",
      category: "HVAC",
      priority: "high",
      status: "open",
      date: "2024-12-30",
      description:
        "The central heating is blowing cold air. Temperature in the apartment drops significantly at night.",
      photos: [],
      comments: [
        {
          id: 1,
          author: "Property Manager",
          text: "We're looking into this urgently. An HVAC technician will contact you shortly.",
          date: "2024-12-30 14:00",
          isStaff: true,
        },
      ],
    },
    {
      id: 3,
      title: "Broken window latch",
      category: "General",
      priority: "low",
      status: "resolved",
      date: "2024-12-15",
      description:
        "The latch on the bedroom window is broken and won't lock properly.",
      photos: [],
      comments: [
        {
          id: 1,
          author: "Property Manager",
          text: "Maintenance has been scheduled for Monday.",
          date: "2024-12-16 09:00",
          isStaff: true,
        },
        {
          id: 2,
          author: "Property Manager",
          text: "The latch has been replaced. Please confirm everything is working.",
          date: "2024-12-18 15:30",
          isStaff: true,
        },
        {
          id: 3,
          author: "Alex Johnson",
          text: "All fixed! Thanks!",
          date: "2024-12-18 18:00",
          isStaff: false,
        },
      ],
    },
  ];
};

export default function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("all");
  const [newComment, setNewComment] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    priority: "medium",
    description: "",
    photos: [],
  });
  const messagesEndRef = useRef(null);


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMaintenanceRequests();
        setRequests(data);
      } catch (error) {
        console.error("Failed to load maintenance requests:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedRequest?.comments]);

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    const newRequest = {
      id: Date.now(),
      ...formData,
      status: "open",
      date: new Date().toISOString().split("T")[0],
      comments: [],
    };

    setRequests([newRequest, ...requests]);
    setFormData({
      title: "",
      category: "General",
      priority: "medium",
      description: "",
      photos: [],
    });
    setShowNewForm(false);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const updatedRequests = requests.map((req) => {
      if (req.id === selectedRequest.id) {
        return {
          ...req,
          comments: [
            ...req.comments,
            {
              id: Date.now(),
              author: "Alex Johnson",
              text: newComment,
              date: new Date().toLocaleString(),
              isStaff: false,
            },
          ],
        };
      }
      return req;
    });

    setRequests(updatedRequests);
    setSelectedRequest(
      updatedRequests.find((r) => r.id === selectedRequest.id)
    );
    setNewComment("");
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const photoUrls = files.map((file) => URL.createObjectURL(file));
    setFormData({ ...formData, photos: [...formData.photos, ...photoUrls] });
  };

  const removePhoto = (index) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const priorityColors = {
    low: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    medium:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Maintenance Requests
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Submit and track maintenance issues
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewForm(true)}
            className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap border-b border-gray-200 dark:border-gray-700 pb-4">
        {["all", "open", "in_progress", "resolved"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? "bg-gray-900 text-white dark:bg-gray-700 dark:text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {status === "all"
              ? "All"
              : status
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            onClick={() => setSelectedRequest(request)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {request.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[request.priority]}`}
                  >
                    {request.priority.charAt(0).toUpperCase() +
                      request.priority.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {request.category} •{" "}
                  {new Date(request.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {request.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={request.status} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {request.comments.length} comments
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              No maintenance requests found
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-4 bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Create Your First Request
            </button>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                New Maintenance Request
              </h3>
              <button
                onClick={() => setShowNewForm(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of the issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option>General</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>HVAC</option>
                    <option>Appliance</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Provide details about the issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photos (Optional)
                </label>
                <div className="flex flex-wrap gap-3">
                  {formData.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="w-20 h-20 rounded-xl overflow-hidden relative"
                    >
                      <img
                        src={photo}
                        alt={`Issue photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 dark:hover:border-gray-500">
                    <Image className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Add
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  You can upload multiple photos to help us understand the issue
                  better
                </p>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRequest.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedRequest.category} •{" "}
                  {new Date(selectedRequest.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedRequest.status} />
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.photos.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Photos
                  </h4>
                  <div className="flex gap-3 flex-wrap">
                    {selectedRequest.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`Issue ${i + 1}`}
                        className="w-24 h-24 rounded-xl object-cover border border-gray-100 dark:border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Comments ({selectedRequest.comments.length})
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {selectedRequest.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`flex gap-3 ${comment.isStaff ? "" : "flex-row-reverse"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          comment.isStaff
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {comment.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div
                        className={`flex-1 max-w-[80%] ${comment.isStaff ? "" : "text-right"}`}
                      >
                        <div
                          className={`inline-block px-4 py-3 rounded-2xl ${
                            comment.isStaff
                              ? "bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                              : "bg-blue-600 dark:bg-blue-800 text-white"
                          }`}
                        >
                          <p className="text-sm">{comment.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {comment.author} •{" "}
                          {new Date(comment.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            <form
              onSubmit={handleAddComment}
              className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-800"
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`px-4 py-2.5 rounded-xl transition-colors ${
                  newComment.trim()
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
