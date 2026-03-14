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

interface CartonInfo {
  carton_number: number;
  gross_weight_kg: number | null;
  size_cm: string | null;
  ctns: number | null;
}

interface PackingLineItem {
  product: string;
  carton_number: number;
  qty_per_carton: number;
  total_pcs: number;
}

interface Client { id: string; name: string; company?: string | null }
interface Company { id: string; name: string; is_default?: boolean }
interface Delivery { id: string; delivery_number: string; client_id: string; client?: Client | null }

export default function PackingListForm({
  mode,
  initialData,
  defaultPackingNumber,
}: {
  mode: "create" | "edit";
  initialData?: any;
  defaultPackingNumber?: string;
}) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [deliverySearch, setDeliverySearch] = useState("");

  const today = formatDateForInput(new Date());

  const [form, setForm] = useState({
    packing_number: initialData?.packing_number ?? defaultPackingNumber ?? "",
    client_id: initialData?.client_id ?? "",
    company_id: initialData?.company_id ?? "",
    invoice_id: initialData?.invoice_id ?? "",
    delivery_id: initialData?.delivery_id ?? "",
    date: initialData?.date ? formatDateForInput(new Date(initialData.date)) : today,
    notes: initialData?.notes ?? "",
  });

  const [cartons, setCartons] = useState<CartonInfo[]>(
    initialData?.cartons && Array.isArray(initialData.cartons) && initialData.cartons.length > 0
      ? initialData.cartons
      : [{ carton_number: 1, gross_weight_kg: null, size_cm: null, ctns: null }]
  );

  const [lineItems, setLineItems] = useState<PackingLineItem[]>(
    initialData?.line_items && Array.isArray(initialData.line_items) && initialData.line_items.length > 0
      ? initialData.line_items
      : [{ product: "", carton_number: 1, qty_per_carton: 1, total_pcs: 1 }]
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/deliveries").then((r) => r.json()),
    ]).then(([c, co, inv, del]) => {
      setClients(c);
      setCompanies(co);
      setInvoices(Array.isArray(inv) ? inv : []);
      setDeliveries(Array.isArray(del) ? del : []);
      if (!initialData?.company_id && co.length > 0) {
        const def = co.find((c: Company) => c.is_default) ?? co[0];
        setForm((f) => ({ ...f, company_id: def.id }));
      }
    });
  }, []);

  // Carton management
  const updateCarton = (index: number, field: keyof CartonInfo, value: string | number | null) => {
    setCartons(c => c.map((row, i) => i !== index ? row : { ...row, [field]: value }));
  };
  const addCarton = () =>
    setCartons(c => [...c, { carton_number: c.length + 1, gross_weight_kg: null, size_cm: null, ctns: null }]);
  const removeCarton = (index: number) =>
    setCartons(c => c.filter((_, i) => i !== index).map((row, i) => ({ ...row, carton_number: i + 1 })));

  // Line item management
  const updateItem = (index: number, field: keyof PackingLineItem, value: string | number) => {
    setLineItems(items => items.map((item, i) => i !== index ? item : { ...item, [field]: value }));
  };
  const addItem = () =>
    setLineItems(items => [...items, { product: "", carton_number: cartons[0]?.carton_number ?? 1, qty_per_carton: 1, total_pcs: 1 }]);
  const removeItem = (index: number) =>
    setLineItems(items => items.filter((_, i) => i !== index));

  const handleInvoiceChange = async (invoiceId: string) => {
    setForm((f) => ({ ...f, invoice_id: invoiceId }));
    if (!invoiceId) return;
    const inv = await fetch(`/api/invoices/${invoiceId}`).then((r) => r.json());
    if (!inv?.id) return;
    setForm((f) => ({ ...f, invoice_id: invoiceId, client_id: inv.client_id, company_id: inv.company_id ?? f.company_id }));
    const items = (inv.line_items as any[]) ?? [];
    setLineItems(items.map((item: any) => ({
      product: item.description ?? item.product_service ?? "",
      carton_number: cartons[0]?.carton_number ?? 1,
      qty_per_carton: item.quantity ?? item.qty ?? 1,
      total_pcs: item.quantity ?? item.qty ?? 1,
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
      delivery_id: form.delivery_id || null,
      notes: form.notes || null,
      line_items: lineItems,
      cartons,
    };
    try {
      const res = await fetch(
        mode === "create" ? "/api/packing-lists" : `/api/packing-lists/${initialData.id}`,
        { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }
      const doc = await res.json();
      toast.success(mode === "create" ? "Packing list created!" : "Packing list updated!");
      router.push(`/packing-lists/${doc.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save packing list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Packing List" : `Edit ${initialData?.packing_number}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Create Packing List" : "Save Changes"}</Button>
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
            <CardHeader><h2 className="font-semibold">Cartons</h2></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2AABE2] text-white">
                      <th className="px-3 py-2 text-center w-16 font-semibold">Carton #</th>
                      <th className="px-3 py-2 text-right w-28 font-semibold">G.W (KGS)</th>
                      <th className="px-3 py-2 text-left font-semibold">Size (CM)</th>
                      <th className="px-3 py-2 text-right w-20 font-semibold">CTNS</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartons.map((carton, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-center text-gray-500">{carton.carton_number}</td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                            value={carton.gross_weight_kg ?? ""}
                            onChange={(e) => updateCarton(i, "gross_weight_kg", e.target.value ? parseFloat(e.target.value) : null)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                            value={carton.size_cm ?? ""}
                            onChange={(e) => updateCarton(i, "size_cm", e.target.value || null)}
                            placeholder="e.g. 60x40x30"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                            value={carton.ctns ?? ""}
                            onChange={(e) => updateCarton(i, "ctns", e.target.value ? parseInt(e.target.value) : null)}
                            min="0"
                            placeholder="1"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => removeCarton(i)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                            disabled={cartons.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addCarton} className="mt-3">
                <Plus className="h-4 w-4" /> Add Carton
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Products</h2></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2AABE2] text-white">
                      <th className="px-3 py-2 text-left font-semibold">Product</th>
                      <th className="px-3 py-2 text-center w-24 font-semibold">Carton #</th>
                      <th className="px-3 py-2 text-right w-28 font-semibold">Qty/Carton</th>
                      <th className="px-3 py-2 text-right w-24 font-semibold">Total PCS</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-1 py-1">
                          <input
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                            value={item.product}
                            onChange={(e) => updateItem(i, "product", e.target.value)}
                            placeholder="Product name..."
                          />
                        </td>
                        <td className="px-1 py-1">
                          <select
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-center bg-transparent"
                            value={item.carton_number}
                            onChange={(e) => updateItem(i, "carton_number", parseInt(e.target.value))}
                          >
                            {cartons.map((c) => (
                              <option key={c.carton_number} value={c.carton_number}>{c.carton_number}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                            value={item.qty_per_carton}
                            onChange={(e) => updateItem(i, "qty_per_carton", parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                            value={item.total_pcs}
                            onChange={(e) => updateItem(i, "total_pcs", parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
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
              <Button type="button" variant="secondary" size="sm" onClick={addItem} className="mt-3">
                <Plus className="h-4 w-4" /> Add Product
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
            <CardHeader><h2 className="font-semibold">Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Packing List #" value={form.packing_number} onChange={(e) => setForm((f) => ({ ...f, packing_number: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Delivery (optional)</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2] mb-1"
                  placeholder="Search by delivery #..."
                  value={deliverySearch}
                  onChange={(e) => setDeliverySearch(e.target.value)}
                />
                <select
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2] bg-white"
                  value={form.delivery_id}
                  onChange={(e) => setForm((f) => ({ ...f, delivery_id: e.target.value }))}
                >
                  <option value="">Select delivery...</option>
                  {deliveries
                    .filter((d) => !form.client_id || d.client_id === form.client_id)
                    .filter((d) => !deliverySearch || d.delivery_number?.toLowerCase().includes(deliverySearch.toLowerCase()))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        #{d.delivery_number} — {d.client?.company ?? d.client?.name ?? ""}
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
