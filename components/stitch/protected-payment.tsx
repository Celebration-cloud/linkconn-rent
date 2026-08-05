"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, Landmark, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { Logo } from "@/components/shared/icons";
import { formatNaira, getMoveInTotal } from "@/utils/map-property";

interface PaymentDetails {
  id: string; amount: number; status: string; reference?: string | null;
  property: { title: string; cautionFee: number; legalFee: number; agencyFee: number; serviceCharge: number };
}

export function ProtectedPayment({ paymentId }: { paymentId: string }) {
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<PaymentDetails>();
  const [channel, setChannel] = useState<"bank" | "card" | "ussd">("bank");
  const [busy, setBusy] = useState(false);
  const [callbackChecked, setCallbackChecked] = useState(false);
  const load = useCallback(async () => {
    const response = await fetch(`/api/payments/${paymentId}/initialize`, { cache: "no-store" });
    const result = (await response.json()) as { success: boolean; data?: PaymentDetails; message: string };
    result.success && result.data ? setPayment(result.data) : toastError("Payment unavailable", result.message);
  }, [paymentId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference || !payment || payment.status === "Paid" || callbackChecked) return;
    setCallbackChecked(true);
    setBusy(true);
    void fetch(`/api/payments/${paymentId}/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }) })
      .then((response) => response.json())
      .then((result: { success: boolean; message: string }) => result.success ? toastSuccess("Payment protected", result.message) : toastError("Verification failed", result.message))
      .finally(() => { setBusy(false); void load(); });
  }, [callbackChecked, load, paymentId, payment, searchParams]);
  async function pay() {
    setBusy(true);
    const response = await fetch(`/api/payments/${paymentId}/initialize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel }) });
    const result = (await response.json()) as { success: boolean; data?: { authorizationUrl?: string }; message: string };
    setBusy(false);
    if (!result.success || !result.data?.authorizationUrl) { toastError("Payment not started", result.message); return; }
    window.location.assign(result.data.authorizationUrl);
  }
  const feeTotal = payment
    ? payment.property.cautionFee + payment.property.legalFee + payment.property.agencyFee + payment.property.serviceCharge
    : 0;
  const feeValues = payment ? { price: Math.max(0, payment.amount - feeTotal), cautionFee: payment.property.cautionFee, legalFee: payment.property.legalFee, agencyFee: payment.property.agencyFee, serviceCharge: payment.property.serviceCharge } : { price: 0, cautionFee: 0, legalFee: 0, agencyFee: 0, serviceCharge: 0 };
  const total = getMoveInTotal(feeValues);
  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 pb-28">
      <header className="flex h-16 items-center border-b border-line px-4"><Link href="/dashboard?tab=payments" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand-200" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link><h1 className="mx-auto text-lg font-extrabold">Protected payment</h1><Link href="/" className="grid size-11 place-items-center rounded-lg hover:bg-sand-100" aria-label="LinkConn Rent home"><Logo variant="mark" priority className="size-9" sizes="36px" /></Link></header>
      <div className="mx-auto max-w-lg p-4">
        <section className="flex gap-3 rounded-xl border border-forest-100 bg-forest-50 p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-forest-700" /><div><p className="text-sm font-extrabold text-forest-900">Funds protected</p><p className="mt-1 text-xs leading-5 text-forest-800">Paystack verifies the transaction reference and exact amount before LinkConn Rent marks your payment paid.</p></div></section>
        <section className="mt-4 overflow-hidden rounded-xl border border-line bg-white"><div className="bg-sand-100 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Move-in breakdown</p><h2 className="mt-1 text-sm font-extrabold">{payment?.property.title || "Loading property..."}</h2></div><dl className="divide-y divide-line">{[["Rent", feeValues.price], ["Caution fee", feeValues.cautionFee], ["Legal fee", feeValues.legalFee], ["Agency fee", feeValues.agencyFee], ["Service charge", feeValues.serviceCharge]].map(([label, amount]) => <div key={label} className="flex justify-between p-4 text-sm"><dt className="text-muted">{label}</dt><dd className="font-bold">{formatNaira(Number(amount))}</dd></div>)}</dl><div className="flex items-center justify-between bg-forest-800 p-4 text-white"><span className="text-xs font-bold uppercase">Total to pay</span><strong className="text-lg">{formatNaira(total)}</strong></div></section>
        <fieldset className="mt-6 space-y-2"><legend className="mb-3 text-xs font-bold uppercase tracking-wider">Select payment method</legend>{([{ value: "bank", label: "Bank transfer", description: "Generate a virtual account", icon: Landmark }, { value: "card", label: "Debit / credit card", description: "Visa, Mastercard, Verve", icon: CreditCard }, { value: "ussd", label: "USSD", description: "Pay via mobile shortcode", icon: Smartphone }] as const).map((option) => <button key={option.value} type="button" onClick={() => setChannel(option.value)} className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 text-left ${channel === option.value ? "border-forest-700 bg-forest-50" : "border-line bg-white"}`}><option.icon className="h-5 w-5 text-forest-700" /><span className="flex-1"><strong className="block text-sm">{option.label}</strong><span className="text-xs text-muted">{option.description}</span></span><span className={`h-4 w-4 rounded-full border-4 ${channel === option.value ? "border-forest-700" : "border-line"}`} /></button>)}</fieldset>
        {payment?.status === "Paid" && <p className="mt-5 rounded-lg bg-forest-100 p-4 text-center text-sm font-bold text-forest-900">This payment has been verified and paid.</p>}
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white p-4"><button disabled={busy || !payment || payment.status === "Paid"} onClick={() => void pay()} className="stitch-button mx-auto w-full max-w-lg disabled:opacity-50"><LockKeyhole className="h-4 w-4" /> {busy ? "Processing securely..." : `Pay ${formatNaira(total)} securely`}</button></div>
    </main>
  );
}
