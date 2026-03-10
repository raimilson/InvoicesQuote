"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Edit, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function PackingListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pl, setPl] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/packing-lists/${id}`).then((r) => r.json()).then((d) => { setPl(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!pl || pl.error) return <p className="text-gray-500">Packing list not found.</p>;

  const lineItems = pl.line_items as any[];
  const cartons = pl.cartons as any[];
  const totalPcs = lineItems.reduce((s: number, i: any) => s + (i.total_pcs ?? 0), 0);
  const totalGW = cartons.reduce((s: number, c: any) => s + (c.gross_weight_kg ?? 0), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{pl.packing_number}</h1>
            <p className="text-sm text-gray-500">{pl.client?.company ?? pl.client?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/packing-lists/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download PDF</Button>
          </a>
          <Link href={`/packing-lists/${id}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold">Client (Buyer)</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold text-base">{pl.client?.company ?? pl.client?.name}</p>
            {pl.client?.company && <p className="text-gray-600">{pl.client?.name}</p>}
            {pl.client?.address && <p className="text-gray-600">{pl.client?.address}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Details</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{formatDate(pl.date)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total PCS:</span><span className="font-semibold">{totalPcs}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total G.W:</span><span className="font-semibold">{totalGW.toFixed(2)} KGS</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Cartons</h2></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#2AABE2] text-white">
              <tr>
                <th className="px-4 py-3 text-center">Carton #</th>
                <th className="px-4 py-3 text-right">G.W (KGS)</th>
                <th className="px-4 py-3 text-left">Size (CM)</th>
                <th className="px-4 py-3 text-right">CTNS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cartons.map((c: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 text-center">{c.carton_number}</td>
                  <td className="px-4 py-3 text-right">{c.gross_weight_kg ?? "—"}</td>
                  <td className="px-4 py-3">{c.size_cm ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{c.ctns ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">Products</h2></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#2AABE2] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-center">Carton #</th>
                <th className="px-4 py-3 text-right">Qty/Carton</th>
                <th className="px-4 py-3 text-right">Total PCS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 font-medium">{item.product}</td>
                  <td className="px-4 py-3 text-center">{item.carton_number}</td>
                  <td className="px-4 py-3 text-right">{item.qty_per_carton}</td>
                  <td className="px-4 py-3 text-right font-semibold">{item.total_pcs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {pl.notes && (
        <Card>
          <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
          <CardContent><p className="text-sm text-gray-700">{pl.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
