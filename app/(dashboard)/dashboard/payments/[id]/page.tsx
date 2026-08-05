import { Suspense } from "react";
import { ProtectedPayment } from "@/components/stitch/protected-payment";
export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <Suspense fallback={<div className="min-h-screen animate-pulse bg-sand-200" />}><ProtectedPayment paymentId={id} /></Suspense>; }
