"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Download, Edit, ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [convertingToOrder, setConvertingToOrder] = useState(false);

  useEffect(() => {
    fetch(`/api/quotes/${id}`).then((r) => r.json()).then((d) => { setQuote(d); setLoading(false); });
  }, [id]);

  const convertToInvoice = async () => {
    setConverting(true);
    try {
      const banks = await fetch("/api/bank-templates").then((r) => r.json());
      const def = banks.find((t: any) => t.is_default) ?? banks[0];
      const res = await fetch(`/api/quotes/${id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bank_template_id: def.id, due_date: new Date().toISOString() }),
      });
      const invoice = await res.json();
      if (!res.ok) { toast.error(invoice.error ?? "Conversion failed"); return; }
      toast.success("Converted to invoice!");
      router.push(`/invoices/${invoice.id}`);
    } catch {
      toast.error("Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  const convertToOrder = async () => {
    setConvertingToOrder(true);
    try {
      const res = await fetch(`/api/quotes/${id}/convert-order`, {
        method: "POST",
      });
      const order = await res.json();
      if (!res.ok) { toast.error(order.error ?? "Conversion failed"); return; }
      toast.success("Converted to order confirmation!");
      router.push(`/orders/${order.id}`);
    } catch {
      toast.error("Conversion to order failed");
    } finally {
      setConvertingToOrder(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!quote || quote.error) return <p className="text-gray-500">Quote not found.</p>;

  const lineItems = quote.line_items as any[];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{quote.quote_number}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <p className="text-sm text-gray-500">{quote.client?.company ?? quote.client?.name}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {quote.converted_to ? (
            <Link href={`/invoices/${quote.converted_to.id}`}>
              <Button variant="secondary" size="sm">
                <ArrowRight className="h-4 w-4" />View Invoice #{quote.converted_to.invoice_number}
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="secondary" onClick={convertToInvoice} loading={converting}>
              <ArrowRight className="h-4 w-4" />Convert to Invoice
            </Button>
          )}
          {quote.status === "ACCEPTED" && (
            <Button variant="secondary" size="sm" onClick={convertToOrder} loading={convertingToOrder}>
              <ClipboardCheck className="h-4 w-4" />Convert to Order
            </Button>
          )}
          <a href={`/api/quotes/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download PDF</Button>
          </a>
          <Link href={`/quotes/${id}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4" />Edit</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Bill To</h2></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-semibold text-base">{quote.client?.company ?? quote.client?.name}</p>
          {quote.client?.company && <p className="text-gray-600">{quote.client?.name}</p>}
          {quote.client?.address && <p className="text-gray-600">{quote.client?.address}</p>}
          {quote.client?.phone && <p className="text-gray-600">{quote.client?.phone}</p>}
        </CardContent>
      </Card>

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
            {quote.tax && parseFloat(quote.tax) > 0 && (
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatCurrency(quote.tax)}</span></div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-[#2AABE2]">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quote.notes && (
          <Card>
            <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
            <CardContent><p className="text-sm text-gray-700">{quote.notes}</p></CardContent>
          </Card>
        )}
        {quote.payment_terms && (
          <Card>
            <CardHeader><h2 className="font-semibold">Terms &amp; Conditions</h2></CardHeader>
            <CardContent>
              {quote.payment_terms.split(/\n|;/).filter(Boolean).map((line: string, i: number) => (
                <p key={i} className="text-sm text-gray-700">- {line.trim()}</p>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
