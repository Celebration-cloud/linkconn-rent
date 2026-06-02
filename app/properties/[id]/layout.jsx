export default function PropertyLayout({ children }) {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Subtle ambient tone */}
      <div className="absolute inset-0 -z-10 bg-blue-900/5 dark:bg-blue-900/15" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
