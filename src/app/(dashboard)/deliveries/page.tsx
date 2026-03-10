"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Download, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    const data = await fetch(`/api/deliveries?${p}`).then((r) => r.json());
    setDeliveries(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const del = async (id: string) => {
    if (!confirm("Delete this delivery notice?")) return;
    await fetch(`/api/deliveries/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery Notices</h1>
        <Link href="/deliveries/new"><Button><Plus className="h-4 w-4" />New Delivery Notice</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
          placeholder="Search by delivery #, PO or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Delivery #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">PO #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tracking</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Shipment</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : deliveries.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No delivery notices found.</td></tr>
              ) : deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/deliveries/${d.id}`} className="text-[#2AABE2] hover:underline">{d.delivery_number}</Link>
                  </td>
                  <td className="px-4 py-3">{d.client?.company ?? d.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{d.purchase_order ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{d.tracking_number ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{d.shipment_type ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(d.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Link href={`/deliveries/${d.id}/edit`}>
                        <Button size="sm" variant="ghost" className="text-xs">Edit</Button>
                      </Link>
                      <a href={`/api/deliveries/${d.id}/pdf`} target="_blank" rel="noopener">
                        <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                      </a>
                      <Button size="sm" variant="ghost" className="text-xs text-red-500" onClick={() => del(d.id)}>Del</Button>
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
