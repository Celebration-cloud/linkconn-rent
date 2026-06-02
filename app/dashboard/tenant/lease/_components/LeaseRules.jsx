export const LeaseRules = ({ rules }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {rules.map((r) => (
      <div
        key={r.id}
        className="rounded-2xl bg-white dark:bg-gray-900/70 p-6 shadow-sm"
      >
        <h3 className="font-medium text-gray-900 dark:text-white">{r.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{r.description}</p>
      </div>
    ))}
  </div>
);
