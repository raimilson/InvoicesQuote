"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Download, Search, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [converting, setConverting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    const data = await fetch(`/api/quotes?${p}`).then((r) => r.json());
    setQuotes(data);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const convertToInvoice = async (quoteId: string) => {
    setConverting(quoteId);
    try {
      const banks = await fetch("/api/bank-templates").then((r) => r.json());
      const def = banks.find((t: any) => t.is_default) ?? banks[0];
      if (!def) { toast.error("No bank template found"); return; }
      const res = await fetch(`/api/quotes/${quoteId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bank_template_id: def.id, due_date: new Date().toISOString() }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Conversion failed");
        return;
      }
      toast.success("Converted to invoice!");
      load();
    } catch {
      toast.error("Conversion failed");
    } finally {
      setConverting(null);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this quote?")) return;
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Link href="/quotes/new"><Button><Plus className="h-4 w-4" />New Quote</Button></Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
            placeholder="Search by quote # or client..."
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
          {["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CONVERTED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Quote #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Valid Until</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : quotes.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No quotes found.</td></tr>
              ) : quotes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/quotes/${q.id}`} className="text-[#2AABE2] hover:underline">{q.quote_number}</Link>
                    {q.converted_to && (
                      <Link href={`/invoices/${q.converted_to.id}`} className="ml-2 text-xs text-purple-600 hover:underline">
                        → Inv #{q.converted_to.invoice_number}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">{q.client?.company ?? q.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(q.date)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(q.valid_until)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(q.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Link href={`/quotes/${q.id}/edit`}>
                        <Button size="sm" variant="ghost" className="text-xs">Edit</Button>
                      </Link>
                      <a href={`/api/quotes/${q.id}/pdf`} target="_blank" rel="noopener">
                        <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                      </a>
                      {q.status !== "CONVERTED" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                          onClick={() => convertToInvoice(q.id)}
                          loading={converting === q.id}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />Convert
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-xs text-red-500" onClick={() => del(q.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
