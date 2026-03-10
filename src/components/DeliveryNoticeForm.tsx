"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDateForInput } from "@/lib/utils";

interface DeliveryLineItem {
  item_number: number;
  product: string;
  description: string;
  quantity: number;
  unit: string;
}

interface Client { id: string; name: string; company?: string | null }
interface Company { id: string; name: string; is_default?: boolean }

const SHIPMENT_TYPES = [
  { value: "Full Shipment", label: "Full Shipment" },
  { value: "Partial Shipment", label: "Partial Shipment" },
];

const INCOTERMS_OPTIONS = [
  { value: "EXW", label: "EXW — Ex Works" },
  { value: "FOB", label: "FOB — Free On Board" },
  { value: "CIF", label: "CIF — Cost, Insurance & Freight" },
  { value: "CFR", label: "CFR — Cost and Freight" },
  { value: "DAP", label: "DAP — Delivered at Place" },
  { value: "DDP", label: "DDP — Delivered Duty Paid" },
  { value: "FCA", label: "FCA — Free Carrier" },
];

export default function DeliveryNoticeForm({
  mode,
  initialData,
  defaultDeliveryNumber,
}: {
  mode: "create" | "edit";
  initialData?: any;
  defaultDeliveryNumber?: string;
}) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const today = formatDateForInput(new Date());

  const [form, setForm] = useState({
    delivery_number: initialData?.delivery_number ?? defaultDeliveryNumber ?? "",
    client_id: initialData?.client_id ?? "",
    company_id: initialData?.company_id ?? "",
    invoice_id: initialData?.invoice_id ?? "",
    date: initialData?.date ? formatDateForInput(new Date(initialData.date)) : today,
    purchase_order: initialData?.purchase_order ?? "",
    purchase_date: initialData?.purchase_date ? formatDateForInput(new Date(initialData.purchase_date)) : "",
    commercial_invoice: initialData?.commercial_invoice ?? "",
    shipment_type: initialData?.shipment_type ?? "",
    tracking_number: initialData?.tracking_number ?? "",
    incoterms: initialData?.incoterms ?? "",
    country_of_origin: initialData?.country_of_origin ?? "",
    notes: initialData?.notes ?? "",
  });

  const normItems = (raw: any[]): DeliveryLineItem[] =>
    raw.map((i, idx) => ({
      item_number: i.item_number ?? idx + 1,
      product: i.product ?? "",
      description: i.description ?? "",
      quantity: i.quantity ?? 1,
      unit: i.unit ?? "PCS",
    }));

  const [lineItems, setLineItems] = useState<DeliveryLineItem[]>(
    initialData?.line_items
      ? normItems(initialData.line_items)
      : [{ item_number: 1, product: "", description: "", quantity: 1, unit: "PCS" }]
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

  const updateItem = (index: number, field: keyof DeliveryLineItem, value: string | number) => {
    setLineItems(items => items.map((item, i) => i !== index ? item : { ...item, [field]: value }));
  };

  const addRow = () =>
    setLineItems(items => [...items, { item_number: items.length + 1, product: "", description: "", quantity: 1, unit: "PCS" }]);

  const removeRow = (index: number) =>
    setLineItems(items => items.filter((_, i) => i !== index).map((item, i) => ({ ...item, item_number: i + 1 })));

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
      commercial_invoice: inv.invoice_number ?? f.commercial_invoice,
    }));
    const items = (inv.line_items as any[]) ?? [];
    setLineItems(items.map((item: any, i: number) => ({
      item_number: item.item_number ?? i + 1,
      product: item.description ?? item.product_service ?? "",
      description: "",
      quantity: item.quantity ?? item.qty ?? 1,
      unit: "PCS",
    })));
  };

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
      purchase_date: form.purchase_date || null,
      commercial_invoice: form.commercial_invoice || null,
      shipment_type: form.shipment_type || null,
      tracking_number: form.tracking_number || null,
      incoterms: form.incoterms || null,
      country_of_origin: form.country_of_origin || null,
      purchase_order: form.purchase_order || null,
      notes: form.notes || null,
      line_items: lineItems,
    };
    try {
      const res = await fetch(
        mode === "create" ? "/api/deliveries" : `/api/deliveries/${initialData.id}`,
        { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }
      const doc = await res.json();
      toast.success(mode === "create" ? "Delivery notice created!" : "Delivery notice updated!");
      router.push(`/deliveries/${doc.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save delivery notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Delivery Notice" : `Edit ${initialData?.delivery_number}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Create Delivery Notice" : "Save Changes"}</Button>
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
            <CardHeader><h2 className="font-semibold">Items</h2></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2AABE2] text-white">
                      <th className="px-3 py-2 text-left w-8 font-semibold">#</th>
                      <th className="px-3 py-2 text-left font-semibold">Product</th>
                      <th className="px-3 py-2 text-left font-semibold">Description</th>
                      <th className="px-3 py-2 text-right w-20 font-semibold">Qty</th>
                      <th className="px-3 py-2 text-left w-24 font-semibold">Unit</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-gray-400 text-sm">{item.item_number}</td>
                        <td className="px-1 py-1">
                          <input
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                            value={item.product}
                            onChange={(e) => updateItem(i, "product", e.target.value)}
                            placeholder="Product name..."
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                            value={item.description}
                            onChange={(e) => updateItem(i, "description", e.target.value)}
                            placeholder="Description..."
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                            value={item.quantity}
                            onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                            value={item.unit}
                            onChange={(e) => updateItem(i, "unit", e.target.value)}
                            placeholder="PCS"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addRow} className="mt-3">
                <Plus className="h-4 w-4" /> Add Item
              </Button>
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
            <CardHeader><h2 className="font-semibold">Delivery Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Delivery #" value={form.delivery_number} onChange={(e) => setForm((f) => ({ ...f, delivery_number: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              <Input label="Purchase Order (PO#)" value={form.purchase_order} onChange={(e) => setForm((f) => ({ ...f, purchase_order: e.target.value }))} />
              <Input label="PO Date" type="date" value={form.purchase_date} onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value }))} />
              <Input label="Commercial Invoice" value={form.commercial_invoice} onChange={(e) => setForm((f) => ({ ...f, commercial_invoice: e.target.value }))} />
              <Select
                label="Shipment Type"
                value={form.shipment_type}
                onChange={(e) => setForm((f) => ({ ...f, shipment_type: e.target.value }))}
                options={SHIPMENT_TYPES}
                placeholder="Select type..."
              />
              <Input label="Tracking Number" value={form.tracking_number} onChange={(e) => setForm((f) => ({ ...f, tracking_number: e.target.value }))} />
              <Select
                label="Incoterms"
                value={form.incoterms}
                onChange={(e) => setForm((f) => ({ ...f, incoterms: e.target.value }))}
                options={INCOTERMS_OPTIONS}
                placeholder="Select incoterms..."
              />
              <Input label="Country of Origin" value={form.country_of_origin} onChange={(e) => setForm((f) => ({ ...f, country_of_origin: e.target.value }))} />
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
        </div>
      </div>
    </form>
  );
}
