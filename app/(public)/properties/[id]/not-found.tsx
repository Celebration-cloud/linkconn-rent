import { EmptyState } from "@/components/ui/surface-primitives";
import { House } from "lucide-react";
export default function PropertyNotFound() { return <main className="bg-sand-50 px-4 pb-24 pt-28"><div className="mx-auto max-w-3xl"><EmptyState icon={House} title="This property is not available" description="It may have been removed, unpublished, or replaced. Continue with the current verified catalogue." actionHref="/properties" actionLabel="Find another home" /></div></main>; }
