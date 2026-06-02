export default function MessageBubble({ message }) {
  const mine = message.sender === "me";

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
          mine
            ? "bg-blue-600 text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
