import { ArrowLeft } from "lucide-react";

export default function ChatHeader({ conversation, onBack }) {
  return (
    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
      <button onClick={onBack} className="md:hidden">
        <ArrowLeft />
      </button>
      <div className="w-10 h-10 rounded-full bg-zinc-400 text-white flex items-center justify-center">
        {conversation.avatar}
      </div>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {conversation.contact}
      </p>
    </div>
  );
}
