export default function ConversationItem({ conversation, active, onClick }) {
  return (
    <div
      className={`p-4 cursor-pointer ${
        active
          ? "bg-blue-50 dark:bg-zinc-800"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-400 text-white flex items-center justify-center">
          {conversation.avatar}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {conversation.contact}
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {conversation.lastMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
