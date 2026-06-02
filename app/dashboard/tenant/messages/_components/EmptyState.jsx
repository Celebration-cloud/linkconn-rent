import { ChartArea } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex-1 hidden md:flex items-center justify-center text-zinc-500">
      <ChartArea />
      <p className="ml-2">Select a conversation</p>
    </div>
  );
}
