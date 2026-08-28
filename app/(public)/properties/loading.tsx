export default function PropertiesLoading() {
  return (
    <main className="min-h-screen bg-sand-50 pb-28 pt-16" aria-busy="true" aria-label="Loading properties">
      <section className="border-b border-line bg-sand-100">
        <div className="stitch-container grid animate-pulse gap-7 py-9 sm:py-11 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end xl:grid-cols-[minmax(0,1fr)_17rem] xl:py-14">
          <div className="space-y-3">
            <div className="h-3 w-44 rounded bg-sand-300" />
            <div className="h-10 w-full max-w-xl rounded-lg bg-sand-200" />
            <div className="h-5 w-full max-w-lg rounded bg-sand-200" />
          </div>
          <div className="hidden space-y-2 border-l border-line pl-6 md:block">
            <div className="h-9 w-20 rounded bg-sand-300" />
            <div className="h-4 w-36 rounded bg-sand-200" />
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-line bg-sand-50/95 backdrop-blur-xl">
        <div className="stitch-container animate-pulse py-3 xl:grid xl:grid-cols-[minmax(22rem,1fr)_auto] xl:gap-3 xl:py-4">
          <div className="h-14 rounded-lg bg-white shadow-[0_8px_24px_rgba(18,55,42,0.07)]" />
          <div className="mt-2 hidden h-11 w-96 rounded-lg bg-sand-200 md:block xl:mt-0" />
        </div>
      </div>

      <div className="stitch-container grid animate-pulse gap-7 py-7 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden space-y-5 border-r border-line pr-6 xl:block" aria-hidden="true">
          <div className="h-5 w-24 rounded bg-sand-300" />
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="h-11 rounded-lg bg-sand-200" />
          ))}
        </aside>

        <section>
          <div className="h-16 rounded-xl border border-line bg-white" />
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-line bg-white">
                <div className="aspect-[16/10] bg-sand-200" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-2/5 rounded bg-sand-300" />
                  <div className="h-4 w-4/5 rounded bg-sand-200" />
                  <div className="h-11 rounded-lg bg-sand-200" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="h-11 rounded-lg bg-sand-200" />
                    <div className="h-11 rounded-lg bg-forest-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
