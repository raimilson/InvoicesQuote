"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then((r) => r.json()).then((d) => { setClient(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!client || client.error) return <p>Client not found.</p>;

  const totalInvoiced = client.invoices?.reduce((s: number, i: any) => s + parseFloat(i.total), 0) ?? 0;
  const totalPaid = client.invoices?.reduce((s: number, i: any) =>
    s + (i.payments ?? []).reduce((ps: number, p: any) => ps + parseFloat(p.amount), 0), 0) ?? 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{client.company ?? client.name}</h1>
            {client.company && <p className="text-sm text-gray-500">{client.name}</p>}
          </div>
        </div>
        <Link href={`/clients/${id}/edit`}>
          <Button size="sm"><Edit className="h-4 w-4" />Edit</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Invoiced", value: formatCurrency(totalInvoiced) },
          { label: "Total Paid", value: formatCurrency(totalPaid), green: true },
          { label: "Outstanding", value: formatCurrency(totalInvoiced - totalPaid), orange: true },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="py-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.green ? "text-green-600" : s.orange ? "text-orange-600" : ""}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact */}
      <Card>
        <CardHeader><h2 className="font-semibold">Contact Information</h2></CardHeader>
        <CardContent className="text-sm grid grid-cols-2 gap-3">
          <div><span className="text-gray-500">Name:</span> {client.name}</div>
          {client.company && <div><span className="text-gray-500">Company:</span> {client.company}</div>}
          {client.address && <div className="col-span-2"><span className="text-gray-500">Address:</span> {client.address}</div>}
          {client.phone && <div><span className="text-gray-500">Phone:</span> {client.phone}</div>}
          {client.email && <div><span className="text-gray-500">Email:</span> {client.email}</div>}
          {client.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> {client.notes}</div>}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Invoices</h2>
          <Link href={`/invoices/new`}><Button size="sm" variant="secondary" className="text-xs">+ New Invoice</Button></Link>
        </CardHeader>
        <CardContent className="p-0">
          {!client.invoices?.length ? (
            <p className="px-6 py-4 text-sm text-gray-400">No invoices.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Invoice #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {client.invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/invoices/${inv.id}`} className="text-[#2AABE2] hover:underline font-medium">#{inv.invoice_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Quotes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold">Quotes</h2>
          <Link href="/quotes/new"><Button size="sm" variant="secondary" className="text-xs">+ New Quote</Button></Link>
        </CardHeader>
        <CardContent className="p-0">
          {!client.quotes?.length ? (
            <p className="px-6 py-4 text-sm text-gray-400">No quotes.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Quote #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {client.quotes.map((q: any) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/quotes/${q.id}`} className="text-[#2AABE2] hover:underline font-medium">{q.quote_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(q.date)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(q.total)}</td>
                    <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
