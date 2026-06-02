import { Download } from "lucide-react";

export const LeaseDocuments = ({ docs }) => {
  const download = (doc) => {
    const blob = new Blob([doc.name], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${doc.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900/70 shadow-sm divide-y divide-gray-100 dark:divide-white/5">
      {docs.map((d) => (
        <div key={d.id} className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {d.name}
            </p>
            <p className="text-sm text-gray-500">
              Signed {new Date(d.signedDate).toLocaleDateString()} • {d.size}
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition"
            onClick={() => download(d)}
          >
            <Download size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
