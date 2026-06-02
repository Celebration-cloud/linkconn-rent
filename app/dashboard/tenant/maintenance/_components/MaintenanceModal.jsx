"use client";
import { X, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const MaintenanceModal = ({ request, onClose }) => {
  const [comments, setComments] = useState(request.comments || []);
  const [newComment, setNewComment] = useState("");
  const [preview, setPreview] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const optimistic = {
      id: crypto.randomUUID(),
      author: "You",
      text: newComment,
      date: new Date().toISOString(),
      isStaff: false,
    };

    setComments((prev) => [...prev, optimistic]);
    setNewComment("");

    // fire real request here
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
          <div className="p-6 flex justify-between border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {request.title}
            </h3>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`flex gap-3 ${
                  c.isStaff ? "" : "flex-row-reverse text-right"
                }`}
              >
                <div className="flex-1 max-w-[80%]">
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl text-sm ${
                      c.isStaff
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {c.text}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{c.author}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3"
            onSubmit={handleSubmit}
          >
            <input
              className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 outline-none dark:bg-white/5 dark:text-white"
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="rounded-xl bg-gray-900 text-white px-4 dark:bg-white dark:text-gray-900">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <img className="max-h-[90vh] rounded-2xl" src={preview} />
        </div>
      )}
    </>
  );
};
