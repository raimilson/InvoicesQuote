"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Edit, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

const CURRENCY_SYM: Record<string, string> = { USD: "$", CAD: "CA$", EUR: "€", BRL: "R$" };

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contracts/${id}`).then((r) => r.json()).then((d) => { setContract(d); setLoading(false); });
  }, [id]);

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!contract || contract.error) return <p className="text-gray-500">Contract not found.</p>;

  const lineItems = contract.line_items as any[];
  const sym = CURRENCY_SYM[contract.currency] ?? "$";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{contract.contract_number}</h1>
            <p className="text-sm text-gray-500">{contract.client?.company ?? contract.client?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/contracts/${id}/pdf`} target="_blank" rel="noopener">
            <Button variant="secondary" size="sm"><Download className="h-4 w-4" />Download PDF</Button>
          </a>
          <Link href={`/contracts/${id}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4" />Edit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold">Party B (Client)</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-semibold text-base">{contract.client?.company ?? contract.client?.name}</p>
            {contract.client?.company && <p className="text-gray-600">{contract.client?.name}</p>}
            {contract.client?.address && <p className="text-gray-600">{contract.client?.address}</p>}
            {contract.client_vat_id && <p className="text-gray-600">VAT: {contract.client_vat_id}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Contract Details</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{formatDate(contract.date)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Currency:</span><span>{contract.currency}</span></div>
            <div className="flex justify-between font-bold text-base mt-2">
              <span>Total:</span>
              <span className="text-[#2AABE2]">{sym}{parseFloat(contract.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Line Items</h2></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#2AABE2] text-white">
              <tr>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-left">Unit</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lineItems.map((item: any, i: number) => (
                <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-3 font-medium">{item.service}</td>
                  <td className="px-4 py-3 text-gray-600">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.qty}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3 text-right">{sym}{(item.unit_price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right font-semibold">{sym}{(item.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {(contract.client_bank_name || contract.client_account || contract.client_swift) && (
        <Card>
          <CardHeader><h2 className="font-semibold">Client Bank Details</h2></CardHeader>
          <CardContent className="text-sm space-y-1">
            {contract.client_bank_name && <p><span className="text-gray-500">Bank:</span> {contract.client_bank_name}</p>}
            {contract.client_bank_address && <p><span className="text-gray-500">Address:</span> {contract.client_bank_address}</p>}
            {contract.client_account && <p><span className="text-gray-500">Account:</span> {contract.client_account}</p>}
            {contract.client_swift && <p><span className="text-gray-500">SWIFT:</span> {contract.client_swift}</p>}
          </CardContent>
        </Card>
      )}

      {contract.notes && (
        <Card>
          <CardHeader><h2 className="font-semibold">Notes</h2></CardHeader>
          <CardContent>
            {contract.notes.split("\n").filter(Boolean).map((line: string, i: number) => (
              <p key={i} className="text-sm text-gray-700">{i + 1}. {line}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
