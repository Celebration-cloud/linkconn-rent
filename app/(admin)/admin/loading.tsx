export default function AdminLoading() {
  return <div className="admin-canvas" aria-label="Loading administrator workspace" aria-busy="true">
    <div className="h-24 animate-pulse border-b border-[#d6ddd5] bg-[#e5eae4] motion-reduce:animate-none" />
    <div className="mt-4 grid border border-[#d6ddd5] bg-white sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse border-[#e1e6e0] bg-[#f1f4f0] motion-reduce:animate-none sm:border-l" />)}</div>
    <div className="mt-4 grid min-h-96 border border-[#d6ddd5] bg-white lg:grid-cols-[22rem_minmax(0,1fr)]"><div className="animate-pulse border-r border-[#d6ddd5] bg-[#eef2ed] motion-reduce:animate-none" /><div className="m-6 animate-pulse bg-[#f4f6f3] motion-reduce:animate-none" /></div>
  </div>;
}
