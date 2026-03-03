"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, AlertCircle, Clock, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashData {
  totalRevenue: number;
  outstanding: number;
  overdueCount: number;
  quotesPending: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentInvoices: any[];
  recentQuotes: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />)}
      </div>
    </div>
  );

  const stats = [
    { label: "Total Revenue", value: formatCurrency(data.totalRevenue), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Outstanding", value: formatCurrency(data.outstanding), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Overdue", value: String(data.overdueCount), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Quotes Pending", value: String(data.quotesPending), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/invoices/new"><Button size="sm"><Plus className="h-4 w-4" />New Invoice</Button></Link>
          <Link href="/quotes/new"><Button size="sm" variant="secondary"><Plus className="h-4 w-4" />New Quote</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`p-2.5 rounded-lg ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Monthly Revenue (Last 6 Months)</h2></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [formatCurrency(v), "Revenue"]} />
              <Bar dataKey="revenue" fill="#2AABE2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold">Recent Invoices</h2>
            <Link href="/invoices" className="text-sm text-[#2AABE2] hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 px-6 py-4">No invoices yet.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.recentInvoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-3">
                        <Link href={`/invoices/${inv.id}`} className="font-medium text-[#2AABE2] hover:underline">#{inv.invoice_number}</Link>
                        <p className="text-xs text-gray-500">{inv.client?.company ?? inv.client?.name}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-700 font-medium">{formatCurrency(inv.total)}</td>
                      <td className="px-3 py-3"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold">Recent Quotes</h2>
            <Link href="/quotes" className="text-sm text-[#2AABE2] hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentQuotes.length === 0 ? (
              <p className="text-sm text-gray-500 px-6 py-4">No quotes yet.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.recentQuotes.map((q: any) => (
                    <tr key={q.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-3">
                        <Link href={`/quotes/${q.id}`} className="font-medium text-[#2AABE2] hover:underline">{q.quote_number}</Link>
                        <p className="text-xs text-gray-500">{q.client?.company ?? q.client?.name}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-700 font-medium">{formatCurrency(q.total)}</td>
                      <td className="px-3 py-3"><StatusBadge status={q.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
