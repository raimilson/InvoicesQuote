"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Download, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function PackingListsPage() {
  const [packingLists, setPackingLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    const data = await fetch(`/api/packing-lists?${p}`).then((r) => r.json());
    setPackingLists(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const del = async (id: string) => {
    if (!confirm("Delete this packing list?")) return;
    await fetch(`/api/packing-lists/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Packing Lists</h1>
        <Link href="/packing-lists/new"><Button><Plus className="h-4 w-4" />New Packing List</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
          placeholder="Search by packing list # or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Packing List #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : packingLists.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No packing lists found.</td></tr>
              ) : packingLists.map((pl) => (
                <tr key={pl.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/packing-lists/${pl.id}`} className="text-[#2AABE2] hover:underline">{pl.packing_number}</Link>
                  </td>
                  <td className="px-4 py-3">{pl.client?.company ?? pl.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(pl.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Link href={`/packing-lists/${pl.id}/edit`}>
                        <Button size="sm" variant="ghost" className="text-xs">Edit</Button>
                      </Link>
                      <a href={`/api/packing-lists/${pl.id}/pdf`} target="_blank" rel="noopener">
                        <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                      </a>
                      <Button size="sm" variant="ghost" className="text-xs text-red-500" onClick={() => del(pl.id)}>Del</Button>
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
