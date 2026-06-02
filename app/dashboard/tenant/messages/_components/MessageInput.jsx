import { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSend }) {
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <form
      onSubmit={submit}
      className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-xl px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        placeholder="Type a message"
      />
      <button className="bg-blue-600 text-white px-4 rounded-xl">
        <Send size={18} />
      </button>
    </form>
  );
}
