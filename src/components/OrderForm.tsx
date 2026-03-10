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
  { value: "BRL", label: "BRL — Brazilian Real" },
];

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", CAD: "CA$", EUR: "€", BRL: "R$" };

const TERMS_OPTIONS = [
  { value: "Payment 100% before Shipping", label: "100% before Shipping" },
  { value: "Due in receipt", label: "Due in receipt" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
  { value: "custom", label: "Custom..." },
];

interface Client { id: string; name: string; company?: string | null }
interface Company { id: string; name: string; is_default?: boolean }

export default function OrderForm({
  mode,
  initialData,
  defaultOrderNumber,
}: {
  mode: "create" | "edit";
  initialData?: any;
  defaultOrderNumber?: string;
}) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customTerms, setCustomTerms] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const today = formatDateForInput(new Date());

  const [form, setForm] = useState({
    order_number: initialData?.order_number ?? defaultOrderNumber ?? "",
    client_id: initialData?.client_id ?? "",
    company_id: initialData?.company_id ?? "",
    invoice_id: initialData?.invoice_id ?? "",
    quote_id: initialData?.quote_id ?? "",
    date: initialData?.date ? formatDateForInput(new Date(initialData.date)) : today,
    delivery_date: initialData?.delivery_date ? formatDateForInput(new Date(initialData.delivery_date)) : "",
    currency: initialData?.currency ?? "USD",
    purchase_order: initialData?.purchase_order ?? "",
    payment_terms: initialData?.payment_terms ?? "",
    notes: initialData?.notes ?? "",
  });

  const normItems = (raw: any[]): LineItem[] =>
    raw.map((i, idx) => ({
      item_number: i.item_number ?? idx + 1,
      description: i.description || i.product_service || "",
      quantity: i.quantity ?? i.qty ?? 1,
      rate: i.rate ?? i.unit_price ?? 0,
      amount: i.amount ?? 0,
    }));

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.line_items
      ? normItems(initialData.line_items)
      : [{ item_number: 1, description: "", quantity: 1, rate: 0, amount: 0 }]
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([c, co, inv]) => {
      setClients(c);
      setCompanies(co);
      setInvoices(Array.isArray(inv) ? inv : []);
      if (!initialData?.company_id && co.length > 0) {
        const def = co.find((c: Company) => c.is_default) ?? co[0];
        setForm((f) => ({ ...f, company_id: def.id }));
      }
    });
  }, []);

  const handleInvoiceChange = async (invoiceId: string) => {
    setForm((f) => ({ ...f, invoice_id: invoiceId }));
    if (!invoiceId) return;
    const inv = await fetch(`/api/invoices/${invoiceId}`).then((r) => r.json());
    if (!inv?.id) return;
    setForm((f) => ({
      ...f,
      invoice_id: invoiceId,
      client_id: inv.client_id,
      company_id: inv.company_id ?? f.company_id,
      payment_terms: inv.payment_terms ?? f.payment_terms,
      notes: inv.notes ?? f.notes,
    }));
    const items = (inv.line_items as any[]) ?? [];
    setLineItems(items.map((item: any, idx: number) => ({
      item_number: item.item_number ?? idx + 1,
      description: item.description ?? item.product_service ?? "",
      quantity: item.quantity ?? item.qty ?? 1,
      rate: item.rate ?? item.unit_price ?? 0,
      amount: item.amount ?? 0,
    })));
  };

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round2(lineItems.reduce((s, i) => s + i.amount, 0));
  const sym = CURRENCY_SYMBOL[form.currency] ?? "$";
  const clientInvoices = invoices
    .filter((inv) => !form.client_id || inv.client_id === form.client_id)
    .filter((inv) => !invoiceSearch || inv.invoice_number?.toLowerCase().includes(invoiceSearch.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) { toast.error("Select a client"); return; }
    setLoading(true);
    const payload = {
      ...form,
      invoice_id: form.invoice_id || null,
      quote_id: form.quote_id || null,
      delivery_date: form.delivery_date || null,
      payment_terms: form.payment_terms || null,
      purchase_order: form.purchase_order || null,
      notes: form.notes || null,
      line_items: lineItems,
      subtotal,
      total: subtotal,
    };
    try {
      const res = await fetch(
        mode === "create" ? "/api/orders" : `/api/orders/${initialData.id}`,
        { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }
      const doc = await res.json();
      toast.success(mode === "create" ? "Order created!" : "Order updated!");
      router.push(`/orders/${doc.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Order Confirmation" : `Edit ${initialData?.order_number}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Create Order" : "Save Changes"}</Button>
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
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-[#2AABE2]">{sym}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
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
                placeholder="Optional notes..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Order Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Order #" value={form.order_number} onChange={(e) => setForm((f) => ({ ...f, order_number: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              <Input label="Delivery Date" type="date" value={form.delivery_date} onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))} />
              <Input label="Purchase Order (PO#)" value={form.purchase_order} onChange={(e) => setForm((f) => ({ ...f, purchase_order: e.target.value }))} />
              <Select
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                options={CURRENCY_OPTIONS}
              />
              <Select
                label="Company"
                value={form.company_id}
                onChange={(e) => setForm((f) => ({ ...f, company_id: e.target.value }))}
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Select company..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Invoice (optional)</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2] mb-1"
                  placeholder="Search by invoice #..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                />
                <select
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2] bg-white"
                  value={form.invoice_id}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                >
                  <option value="">Select invoice...</option>
                  {clientInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      #{inv.invoice_number} — {inv.client?.company ?? inv.client?.name ?? ""}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Payment Terms</h2></CardHeader>
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
                  rows={3}
                  placeholder="Enter terms..."
                  value={form.payment_terms}
                  onChange={(e) => setForm((f) => ({ ...f, payment_terms: e.target.value }))}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
