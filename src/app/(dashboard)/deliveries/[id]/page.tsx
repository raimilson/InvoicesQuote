"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Edit, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/deliveries/${id}`).then((r) => r.json()).then((d) => { setDelivery(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!delivery || delivery.error) return <p className="text-gray-500">Delivery notice not found.</p>;

  const lineItems = delivery.line_items as any[];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{delivery.delivery_number}</h1>
            <p className="text-sm text-gray-500">{delivery.client?.company ?? delivery.client?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/deliveries/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download PDF</Button>
          </a>
          <Link href={`/deliveries/${id}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold">Client</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold text-base">{delivery.client?.company ?? delivery.client?.name}</p>
            {delivery.client?.company && <p className="text-gray-600">{delivery.client?.name}</p>}
            {delivery.client?.address && <p className="text-gray-600">{delivery.client?.address}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Delivery Details</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{formatDate(delivery.date)}</span></div>
            {delivery.purchase_order && <div className="flex justify-between"><span className="text-gray-500">PO #:</span><span>{delivery.purchase_order}</span></div>}
            {delivery.purchase_date && <div className="flex justify-between"><span className="text-gray-500">PO Date:</span><span>{formatDate(delivery.purchase_date)}</span></div>}
            {delivery.commercial_invoice && <div className="flex justify-between"><span className="text-gray-500">Commercial Invoice:</span><span>{delivery.commercial_invoice}</span></div>}
            {delivery.shipment_type && <div className="flex justify-between"><span className="text-gray-500">Shipment:</span><span>{delivery.shipment_type}</span></div>}
            {delivery.tracking_number && <div className="flex justify-between"><span className="text-gray-500">Tracking:</span><span>{delivery.tracking_number}</span></div>}
            {delivery.incoterms && <div className="flex justify-between"><span className="text-gray-500">Incoterms:</span><span>{delivery.incoterms}</span></div>}
            {delivery.country_of_origin && <div className="flex justify-between"><span className="text-gray-500">Origin:</span><span>{delivery.country_of_origin}</span></div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Items</h2></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#2AABE2] text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-left">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 text-gray-500">{item.item_number ?? i + 1}</td>
                  <td className="px-4 py-3 font-medium">{item.product}</td>
                  <td className="px-4 py-3 text-gray-600">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {delivery.notes && (
        <Card>
          <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
          <CardContent><p className="text-sm text-gray-700">{delivery.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
