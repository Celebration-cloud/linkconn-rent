import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations,
  selected,
  onSelect,
}) {
  return (
    <div
      className={`w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 ${selected ? "hidden md:block" : ""}`}
    >
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          active={selected?.id === conv.id}
          onClick={() => onSelect(conv)}
        />
      ))}
    </div>
  );
}
