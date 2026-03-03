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

const TERMS_OPTIONS = [
  { value: "Payment 100% before Shipping", label: "100% before Shipping" },
  { value: "Due in receipt", label: "Due in receipt" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
  { value: "30% Due today, 70% when product is ready to ship", label: "30/70 split" },
  { value: "custom", label: "Custom..." },
];

interface Client { id: string; name: string; company?: string | null }
interface BankTemplate { id: string; name: string; currency: string; is_default?: boolean }

export default function InvoiceForm({
  mode,
  initialData,
  defaultInvoiceNumber,
}: {
  mode: "create" | "edit";
  initialData?: any;
  defaultInvoiceNumber?: string;
}) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [banks, setBanks] = useState<BankTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", company: "", phone: "", email: "", address: "" });

  const today = formatDateForInput(new Date());

  const [form, setForm] = useState({
    invoice_number: initialData?.invoice_number ?? defaultInvoiceNumber ?? "",
    client_id: initialData?.client_id ?? "",
    date: initialData ? formatDateForInput(new Date(initialData.date)) : today,
    due_date: initialData ? formatDateForInput(new Date(initialData.due_date)) : today,
    status: initialData?.status ?? "DRAFT",
    bank_template_id: initialData?.bank_template_id ?? "",
    payment_terms: initialData?.payment_terms ?? "",
    notes: initialData?.notes ?? "",
    tax: initialData?.tax ? String(initialData.tax) : "",
  });

  // Normalise legacy line items (product_service → description)
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

  const [customTerms, setCustomTerms] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/bank-templates").then((r) => r.json()),
    ]).then(([c, b]) => {
      setClients(c);
      setBanks(b);
      if (!form.bank_template_id && b.length > 0) {
        const def = b.find((t: BankTemplate) => t.is_default) ?? b[0];
        setForm((f) => ({ ...f, bank_template_id: def.id }));
      }
    });
  }, []);

  const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const tax = parseFloat(form.tax) || 0;
  const total = subtotal + tax;

  const addClient = async () => {
    const c = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    }).then((r) => r.json());
    setClients((prev) => [c, ...prev]);
    setForm((f) => ({ ...f, client_id: c.id }));
    setShowNewClient(false);
    setNewClient({ name: "", company: "", phone: "", email: "", address: "" });
    toast.success("Client added");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) { toast.error("Select a client"); return; }
    if (!form.bank_template_id) { toast.error("Select a bank template"); return; }
    if (lineItems.some((i) => !i.description)) { toast.error("Fill in all item descriptions"); return; }
    setLoading(true);
    const payload = { ...form, line_items: lineItems, subtotal, tax: tax || null, total };
    try {
      const res = await fetch(
        mode === "create" ? "/api/invoices" : `/api/invoices/${initialData.id}`,
        { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error(await res.text());
      const inv = await res.json();
      toast.success(mode === "create" ? "Invoice created!" : "Invoice updated!");
      router.push(`/invoices/${inv.id}`);
    } catch {
      toast.error("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "New Invoice" : `Edit Invoice #${initialData?.invoice_number}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {mode === "create" ? "Create Invoice" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — client + line items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Client</h2></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    label="Select client"
                    value={form.client_id}
                    onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                    options={clients.map((c) => ({
                      value: c.id,
                      label: `${c.company ?? c.name}${c.company ? ` (${c.name})` : ""}`,
                    }))}
                    placeholder="Choose a client..."
                  />
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowNewClient((v) => !v)}>
                  + New Client
                </Button>
              </div>
              {showNewClient && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">Quick-add client</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Contact Name" value={newClient.name} onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))} />
                    <Input label="Company" value={newClient.company} onChange={(e) => setNewClient((c) => ({ ...c, company: e.target.value }))} />
                    <Input label="Phone" value={newClient.phone} onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))} />
                    <Input label="Email" value={newClient.email} onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))} />
                    <div className="col-span-2">
                      <Input label="Address" value={newClient.address} onChange={(e) => setNewClient((c) => ({ ...c, address: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={addClient}>Add Client</Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowNewClient(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Line Items</h2></CardHeader>
            <CardContent>
              <LineItemsEditor items={lineItems} onChange={setLineItems} />
              <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
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
                  <span className="text-[#2AABE2]">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
            <CardContent>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                rows={3}
                placeholder="Optional notes shown on the document..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Invoice Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Invoice #" value={form.invoice_number} onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              <Input label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} required />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "SENT", label: "Sent" },
                  { value: "PARTIALLY_PAID", label: "Partially Paid" },
                  { value: "PAID", label: "Paid" },
                  { value: "OVERDUE", label: "Overdue" },
                ]}
              />
              <Select
                label="Bank Template"
                value={form.bank_template_id}
                onChange={(e) => setForm((f) => ({ ...f, bank_template_id: e.target.value }))}
                options={banks.map((t) => ({ value: t.id, label: `${t.name} (${t.currency})` }))}
                placeholder="Select bank..."
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
              <p className="text-xs text-gray-400">Tip: separate multiple terms with new lines</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
