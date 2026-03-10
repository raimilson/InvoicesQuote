"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Download, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    const data = await fetch(`/api/orders?${p}`).then((r) => r.json());
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const del = async (id: string) => {
    if (!confirm("Delete this order confirmation?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order Confirmations</h1>
        <Link href="/orders/new"><Button><Plus className="h-4 w-4" />New Order</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
          placeholder="Search by order # or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Order #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">PO #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Delivery Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Currency</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No orders found.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/orders/${o.id}`} className="text-[#2AABE2] hover:underline">{o.order_number}</Link>
                  </td>
                  <td className="px-4 py-3">{o.client?.company ?? o.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{o.purchase_order ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(o.date)}</td>
                  <td className="px-4 py-3 text-gray-600">{o.delivery_date ? formatDate(o.delivery_date) : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{o.currency}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Link href={`/orders/${o.id}/edit`}>
                        <Button size="sm" variant="ghost" className="text-xs">Edit</Button>
                      </Link>
                      <a href={`/api/orders/${o.id}/pdf`} target="_blank" rel="noopener">
                        <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                      </a>
                      <Button size="sm" variant="ghost" className="text-xs text-red-500" onClick={() => del(o.id)}>Del</Button>
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
