"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Edit, ArrowLeft, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

const CURRENCY_SYM: Record<string, string> = { USD: "$", CAD: "CA$", EUR: "€", BRL: "R$" };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => { setOrder(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!order || order.error) return <p className="text-gray-500">Order not found.</p>;

  const lineItems = order.line_items as any[];
  const sym = CURRENCY_SYM[order.currency] ?? "$";
  const total = lineItems.reduce((s: number, i: any) => s + (i.amount ?? 0), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <p className="text-sm text-gray-500">{order.client?.company ?? order.client?.name}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/invoices/new?from_order=${id}`}>
            <Button variant="secondary" size="sm"><FileText className="h-4 w-4" />Create Invoice</Button>
          </Link>
          <a href={`/api/orders/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download PDF</Button>
          </a>
          <Link href={`/orders/${id}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold">Bill To</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold text-base">{order.client?.company ?? order.client?.name}</p>
            {order.client?.company && <p className="text-gray-600">{order.client?.name}</p>}
            {order.client?.address && <p className="text-gray-600">{order.client?.address}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Order Details</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{formatDate(order.date)}</span></div>
            {order.delivery_date && <div className="flex justify-between"><span className="text-gray-500">Delivery Date:</span><span>{formatDate(order.delivery_date)}</span></div>}
            {order.purchase_order && <div className="flex justify-between"><span className="text-gray-500">PO #:</span><span>{order.purchase_order}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Currency:</span><span>{order.currency}</span></div>
            {order.payment_terms && <div className="flex justify-between"><span className="text-gray-500">Terms:</span><span>{order.payment_terms}</span></div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Line Items</h2></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#2AABE2] text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 text-gray-500">{item.item_number ?? i + 1}</td>
                  <td className="px-4 py-3">{item.description || item.product_service}</td>
                  <td className="px-4 py-3 text-right">{item.quantity ?? item.qty}</td>
                  <td className="px-4 py-3 text-right">{sym}{(item.rate ?? item.unit_price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-semibold">{sym}{(item.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-4 border-t">
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-[#2AABE2]">{sym}{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
          <CardContent><p className="text-sm text-gray-700">{order.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
