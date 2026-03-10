"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDateForInput } from "@/lib/utils";

interface ContractLineItem {
  service: string;
  description: string;
  qty: number;
  unit: string;
  unit_price: number;
  amount: number;
}

export default function ContractForm({
  mode,
  initialData,
  defaultContractNumber,
}: {
  mode: "create" | "edit";
  initialData?: any;
  defaultContractNumber?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [companyId, setCompanyId] = useState("");

  const today = formatDateForInput(new Date());

  const [form, setForm] = useState({
    contract_number: initialData?.contract_number ?? defaultContractNumber ?? "",
    date: initialData?.date ? formatDateForInput(new Date(initialData.date)) : today,
  });

  const normItems = (raw: any[]): ContractLineItem[] =>
    raw.map((i) => ({
      service: i.service ?? "",
      description: i.description ?? "",
      qty: i.qty ?? 1,
      unit: i.unit ?? "Batch",
      unit_price: i.unit_price ?? 0,
      amount: i.amount ?? 0,
    }));

  const [lineItems, setLineItems] = useState<ContractLineItem[]>(
    initialData?.line_items
      ? normItems(initialData.line_items)
      : [{ service: "General Development", description: "Mr Vittorio Design (P00526)", qty: 1, unit: "Batch", unit_price: 0, amount: 0 }]
  );

  // Auto-select Mouette client and default company (hidden from UI)
  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(([clients, companies]) => {
      // Find Mouette client or use first client
      const mouette = clients.find((c: any) => c.company?.toLowerCase().includes("mouette")) ?? clients[0];
      if (mouette) setClientId(mouette.id);
      // Find default company
      const defCo = companies.find((c: any) => c.is_default) ?? companies[0];
      if (defCo) setCompanyId(defCo.id);
    });
  }, []);

  const updateItem = (index: number, field: keyof ContractLineItem, value: string | number) => {
    setLineItems(items => items.map((item, i) => {
      if (i !== index) return item;
      const next = { ...item, [field]: value };
      if (field === "qty" || field === "unit_price") {
        next.amount = Math.round(Number(next.qty) * Number(next.unit_price) * 100) / 100;
      }
      return next;
    }));
  };

  const addRow = () =>
    setLineItems(items => [...items, { service: "", description: "", qty: 1, unit: "Batch", unit_price: 0, amount: 0 }]);

  const removeRow = (index: number) =>
    setLineItems(items => items.filter((_, i) => i !== index));

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const total = round2(lineItems.reduce((s, i) => s + i.amount, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { toast.error("Mouette client not found"); return; }
    setLoading(true);
    const payload = {
      contract_number: form.contract_number,
      date: form.date,
      client_id: clientId,
      company_id: companyId || null,
      currency: "EUR",
      line_items: lineItems,
      total,
    };
    try {
      const res = await fetch(
        mode === "create" ? "/api/contracts" : `/api/contracts/${initialData.id}`,
        { method: mode === "create" ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }
      const doc = await res.json();
      toast.success(mode === "create" ? "Contract created!" : "Contract updated!");
      router.push(`/contracts/${doc.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "New Sales Contract (Mouette)" : `Edit ${initialData?.contract_number}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>{mode === "create" ? "Create Contract" : "Save Changes"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Line Items</h2></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2AABE2] text-white">
                      <th className="px-3 py-2 text-left w-28 font-semibold">Service</th>
                      <th className="px-3 py-2 text-left font-semibold">Description</th>
                      <th className="px-3 py-2 text-right w-16 font-semibold">Qty</th>
                      <th className="px-3 py-2 text-left w-20 font-semibold">Unit</th>
                      <th className="px-3 py-2 text-right w-28 font-semibold">Unit Price</th>
                      <th className="px-3 py-2 text-right w-28 font-semibold">Amount</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-1 py-1">
                          <input
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                            value={item.service}
                            onChange={(e) => updateItem(i, "service", e.target.value)}
                            placeholder="Service..."
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
                            value={item.qty}
                            onChange={(e) => updateItem(i, "qty", parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm"
                            value={item.unit}
                            onChange={(e) => updateItem(i, "unit", e.target.value)}
                            placeholder="Batch"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            className="w-full border-0 border-b border-gray-200 focus:border-[#2AABE2] outline-none px-1 py-1 text-sm text-right"
                            value={item.unit_price}
                            onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-sm">
                          {"\u20AC"}{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
              <div className="flex items-center justify-between mt-3">
                <Button type="button" variant="secondary" size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4" /> Add Line Item
                </Button>
                <div className="text-sm font-bold">
                  Total: <span className="text-[#2AABE2]">{"\u20AC"}{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Contract Details</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Contract #" value={form.contract_number} onChange={(e) => setForm((f) => ({ ...f, contract_number: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              <p className="text-xs text-gray-400 border-t pt-3 mt-2">Mouette template — all other fields (parties, bank, notes, signature) are hardcoded in the PDF.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
