"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Download, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payPopover, setPayPopover] = useState<string | null>(null);
  const [partialForm, setPartialForm] = useState({ amount: "", date: "", method: "Wire Transfer" });
  const [paying, setPaying] = useState(false);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    const data = await fetch(`/api/invoices?${p}`).then((r) => r.json());
    setInvoices(data);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Keyboard shortcut: P to quick-pay selected row
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "p" || e.key === "P") && selectedRow && !(e.target instanceof HTMLInputElement)) {
        setPayPopover((prev) => (prev === selectedRow ? null : selectedRow));
      }
      if (e.key === "Escape") setPayPopover(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedRow]);

  const markPaid = async (invoiceId: string, markFullyPaid: boolean) => {
    setPaying(true);
    try {
      const payload = markFullyPaid
        ? { markFullyPaid: true, method: "Wire Transfer" }
        : { ...partialForm, amount: parseFloat(partialForm.amount) };
      const res = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(markFullyPaid ? "Marked as fully paid!" : "Payment recorded!");
      setPayPopover(null);
      setPartialForm({ amount: "", date: "", method: "Wire Transfer" });
      load();
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setPaying(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    toast.success("Invoice deleted");
    load();
  };

  return (
    <div className="space-y-6" onClick={() => setPayPopover(null)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/new"><Button><Plus className="h-4 w-4" />New Invoice</Button></Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
            placeholder="Search by invoice # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {["DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Invoice #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No invoices found.</td></tr>
              ) : invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selectedRow === inv.id ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedRow(inv.id)}
                >
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/invoices/${inv.id}`} className="text-[#2AABE2] hover:underline" onClick={(e) => e.stopPropagation()}>
                      #{inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inv.client?.company ?? inv.client?.name}</p>
                    {inv.client?.company && <p className="text-xs text-gray-500">{inv.client.name}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3">
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPayPopover((p) => p === inv.id ? null : inv.id)}
                        disabled={inv.status === "PAID" || inv.status === "DRAFT"}
                        title={inv.status === "PAID" ? "Already paid" : "Click to record payment"}
                      >
                        <StatusBadge status={inv.status} />
                      </button>

                      {payPopover === inv.id && (
                        <div className="absolute left-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-72 space-y-3">
                          <p className="font-semibold text-sm">Record Payment</p>
                          <Button size="sm" className="w-full" onClick={() => markPaid(inv.id, true)} loading={paying}>
                            ✓ Mark as Fully Paid
                          </Button>
                          <div className="border-t pt-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600">Record Partial Payment</p>
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                              placeholder="Amount"
                              value={partialForm.amount}
                              onChange={(e) => setPartialForm((f) => ({ ...f, amount: e.target.value }))}
                            />
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                              value={partialForm.date}
                              onChange={(e) => setPartialForm((f) => ({ ...f, date: e.target.value }))}
                            />
                            <select
                              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                              value={partialForm.method}
                              onChange={(e) => setPartialForm((f) => ({ ...f, method: e.target.value }))}
                            >
                              {["Wire Transfer", "Credit Card", "PayPal", "Check", "Cash"].map((m) => <option key={m}>{m}</option>)}
                            </select>
                            <Button size="sm" variant="secondary" className="w-full" onClick={() => markPaid(inv.id, false)} loading={paying} disabled={!partialForm.amount}>
                              Record Partial
                            </Button>
                          </div>
                          <button className="text-xs text-gray-400 hover:text-gray-600 w-full text-center" onClick={() => setPayPopover(null)}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Link href={`/invoices/${inv.id}/edit`}><Button size="sm" variant="ghost" className="text-xs">Edit</Button></Link>
                      <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noopener">
                        <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                      </a>
                      <Button size="sm" variant="ghost" className="text-xs text-red-500 hover:text-red-700" onClick={() => del(inv.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-gray-400">
        Tip: click a row to select it, then press <kbd className="bg-gray-100 border border-gray-300 px-1 rounded text-xs">P</kbd> to quick-record a payment.
      </p>
    </div>
  );
}
