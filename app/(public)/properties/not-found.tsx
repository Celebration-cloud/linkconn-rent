import { EmptyState } from "@/components/ui/surface-primitives";
import { SearchX } from "lucide-react";
export default function PropertyNotFound() { return <main className="bg-sand-50 px-4 pb-24 pt-28"><div className="mx-auto max-w-3xl"><EmptyState icon={SearchX} title="No homes match this route" description="The listing may have moved or the current filters may be too narrow. Return to the catalogue to continue with available homes." actionHref="/properties" actionLabel="Browse available homes" /></div></main>; }
