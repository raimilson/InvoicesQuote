"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Edit, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch(`/api/invoices/${id}`).then((r) => r.json()).then((d) => { setInvoice(d); setLoading(false); });

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!invoice || invoice.error) return <p className="text-gray-500">Invoice not found.</p>;

  const totalPaid = invoice.payments?.reduce((s: number, p: any) => s + parseFloat(p.amount), 0) ?? 0;
  const lineItems = invoice.line_items as any[];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-gray-500">{invoice.client?.company ?? invoice.client?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download PDF</Button>
          </a>
          <Link href={`/invoices/${id}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill To */}
          <Card>
            <CardHeader><h2 className="font-semibold">Bill To</h2></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold text-base">{invoice.client?.company ?? invoice.client?.name}</p>
              {invoice.client?.company && <p className="text-gray-600">{invoice.client?.name}</p>}
              {invoice.client?.address && <p className="text-gray-600">{invoice.client?.address}</p>}
              {invoice.client?.phone && <p className="text-gray-600">{invoice.client?.phone}</p>}
              {invoice.client?.email && <p className="text-gray-600">{invoice.client?.email}</p>}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader><h2 className="font-semibold">Line Items</h2></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-[#2AABE2] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Item &amp; Description</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lineItems.map((item: any, i: number) => {
                    const text = item.description || item.product_service || "";
                    return (
                      <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                        <td className="px-4 py-3 text-gray-500">{item.item_number}</td>
                        <td className="px-4 py-3">{text}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(item.rate)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-4 py-4 border-t space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.tax && parseFloat(invoice.tax) > 0 && (
                  <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatCurrency(invoice.tax)}</span></div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-[#2AABE2]">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader><h2 className="font-semibold">Payment History</h2></CardHeader>
            <CardContent className="space-y-4">
              <ProgressBar
                value={totalPaid}
                max={parseFloat(invoice.total)}
                label={`${formatCurrency(totalPaid)} of ${formatCurrency(invoice.total)} paid`}
              />
              {invoice.payments?.length === 0 ? (
                <p className="text-sm text-gray-400">No payments recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="pb-2 text-left font-medium">Date</th>
                      <th className="pb-2 text-left font-medium">Method</th>
                      <th className="pb-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoice.payments?.map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-2">{formatDate(p.date)}</td>
                        <td className="py-2 text-gray-600">{p.method}</td>
                        <td className="py-2 text-right font-semibold text-green-600">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Invoice Details</h2></CardHeader>
            <CardContent className="text-sm space-y-3">
              {[
                ["Invoice #", `#${invoice.invoice_number}`],
                ["Date", formatDate(invoice.date)],
                ["Due Date", formatDate(invoice.due_date)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              {invoice.from_quote && (
                <div className="flex justify-between">
                  <span className="text-gray-500">From Quote</span>
                  <Link href={`/quotes/${invoice.from_quote.id}`} className="text-[#2AABE2] hover:underline text-sm">View quote</Link>
                </div>
              )}
            </CardContent>
          </Card>

          {invoice.payment_terms && (
            <Card>
              <CardHeader><h2 className="font-semibold">Terms &amp; Conditions</h2></CardHeader>
              <CardContent>
                {invoice.payment_terms.split(/\n|;/).filter(Boolean).map((line: string, i: number) => (
                  <p key={i} className="text-sm text-gray-700">- {line.trim()}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {invoice.notes && (
            <Card>
              <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
              <CardContent><p className="text-sm text-gray-700">{invoice.notes}</p></CardContent>
            </Card>
          )}

          {invoice.bank_template && (
            <Card>
              <CardHeader><h2 className="font-semibold">Bank Info</h2></CardHeader>
              <CardContent className="text-xs space-y-1.5">
                <p className="font-semibold text-sm text-[#2AABE2]">{invoice.bank_template.name}</p>
                <p><span className="text-gray-500">Bank:</span> {invoice.bank_template.bank_name}</p>
                <p><span className="text-gray-500">Account:</span> {invoice.bank_template.account_number}</p>
                {invoice.bank_template.institution_no && <p><span className="text-gray-500">Institution:</span> {invoice.bank_template.institution_no}</p>}
                {invoice.bank_template.transit_no && <p><span className="text-gray-500">Transit:</span> {invoice.bank_template.transit_no}</p>}
                {invoice.bank_template.swift_bic && <p><span className="text-gray-500">SWIFT/BIC:</span> {invoice.bank_template.swift_bic}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
