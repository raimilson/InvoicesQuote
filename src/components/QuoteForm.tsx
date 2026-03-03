"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import LineItemsEditor, { LineItem } from "@/components/LineItemsEditor";
import { formatDateForInput } from "@/lib/utils";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "EUR", label: "EUR — Euro" },
];

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", CAD: "CA$", EUR: "€" };

const TERMS_OPTIONS = [
  { value: "Payment 100% before Shipping", label: "100% before Shipping" },
  { value: "Due in receipt", label: "Due in receipt" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
  { value: "custom", label: "Custom..." },
];

interface Client { id: string; name: string; company?: string | null }

export default function QuoteForm({
  mode,
  initialData,
  defaultQuoteNumber,
}: {
  mode: "create" | "edit";
  initialData?: any;
  defaultQuoteNumber?: string;
}) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [customTerms, setCustomTerms] = useState(false);

  const today = formatDateForInput(new Date());
  const thirtyDays = formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const [form, setForm] = useState({
    quote_number: initialData?.quote_number ?? defaultQuoteNumber ?? "",
    client_id: initialData?.client_id ?? "",
    date: initialData ? formatDateForInput(new Date(initialData.date)) : today,
    valid_until: initialData ? formatDateForInput(new Date(initialData.valid_until)) : thirtyDays,
    status: initialData?.status ?? "DRAFT",
    currency: initialData?.currency ?? "USD",
    payment_terms: initialData?.payment_terms ?? "",
    notes: initialData?.notes ?? "",
    tax: initialData?.tax ? String(initialData.tax) : "",
  });

  const normItems = (raw: any[]): LineItem[] =>
    raw.map((i) => ({
      item_number: i.item_number,
      description: i.description || i.product_service || "",
      quantity: i.quantity,
      rate: i.rate,
      amount: i.amount,
    }));

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.line_items
      ? normItems(initialData.line_items)
      : [{ item_number: 1, description: "", quantity: 1, rate: 0, amount: 0 }]
  );

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round2(lineItems.reduce((s, i) => s + i.amount, 0));
  const tax = round2(parseFloat(form.tax) || 0);
  const total = round2(subtotal + tax);
  const sym = CURRENCY_SYMBOL[form.currency] ?? "$";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) { toast.error("Select a client"); return; }
    if (lineItems.some((i) => !i.description)) { toast.error("Fill in all item descriptions"); return; }
    setLoading(true);
    const payload = { ...form, line_items: lineItems, subtotal, tax: tax || null, total };
    try {
      const res = await fetch(
        mode === "create" ? "/api/quotes" : `/api/quotes/${initialData.id}`,
        { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }
      const q = await res.json();
      toast.success(mode === "create" ? "Quote created!" : "Quote updated!");
      router.push(`/quotes/${q.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save quote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Quote" : `Edit ${initialData?.quote_number}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Create Quote" : "Save Changes"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Client</h2></CardHeader>
            <CardContent>
              <Select
                label="Select client"
                value={form.client_id}
                onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                options={clients.map((c) => ({ value: c.id, label: `${c.company ?? c.name}${c.company ? ` (${c.name})` : ""}` }))}
                placeholder="Choose a client..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Line Items</h2></CardHeader>
            <CardContent>
              <LineItemsEditor items={lineItems} onChange={setLineItems} />
              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{sym}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tax</span>
                  <input
                    type="number"
                    className="w-32 border border-gray-200 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                    placeholder="0.00"
                    value={form.tax}
                    onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-[#2AABE2]">{sym}{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
            <CardContent>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                rows={3}
                placeholder="Optional notes shown on the quote..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Quote Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Quote #" value={form.quote_number} onChange={(e) => setForm((f) => ({ ...f, quote_number: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              <Input label="Valid Until" type="date" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} required />
              <Select
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                options={CURRENCY_OPTIONS}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "SENT", label: "Sent" },
                  { value: "ACCEPTED", label: "Accepted" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Terms &amp; Conditions</h2></CardHeader>
            <CardContent className="space-y-3">
              <select
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2] bg-white"
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setCustomTerms(true);
                    setForm((f) => ({ ...f, payment_terms: "" }));
                  } else {
                    setCustomTerms(false);
                    setForm((f) => ({ ...f, payment_terms: e.target.value }));
                  }
                }}
                value={TERMS_OPTIONS.some((o) => o.value === form.payment_terms) ? form.payment_terms : (form.payment_terms ? "custom" : "")}
              >
                <option value="">Select terms...</option>
                {TERMS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {(customTerms || (form.payment_terms && !TERMS_OPTIONS.some((o) => o.value === form.payment_terms))) && (
                <textarea
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                  rows={4}
                  placeholder="Enter terms (one per line)..."
                  value={form.payment_terms}
                  onChange={(e) => setForm((f) => ({ ...f, payment_terms: e.target.value }))}
                />
              )}
              <p className="text-xs text-gray-400">Separate multiple terms with new lines</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
