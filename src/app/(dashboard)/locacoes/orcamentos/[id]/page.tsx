"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  ArrowRightCircle,
  Send,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";

export default function OrcamentoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = () => {
    fetch(`/api/locacoes/orcamentos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQuote(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const fmtCurrency = (v: any) => {
    const num = typeof v === "string" ? parseFloat(v) : Number(v) || 0;
    return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const fmtDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/locacoes/orcamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: quote.client_id,
          data_evento: quote.data_evento,
          endereco_entrega: quote.endereco_entrega,
          horario_inicio: quote.horario_inicio,
          horario_fim: quote.horario_fim,
          responsavel_nome: quote.responsavel_nome,
          responsavel_telefone: quote.responsavel_telefone,
          uso_monitor: quote.uso_monitor,
          qtd_monitores: quote.qtd_monitores,
          subtotal: quote.subtotal,
          desconto: quote.desconto,
          total: quote.total,
          horas_contratadas: quote.horas_contratadas,
          status: newStatus,
          notes: quote.notes,
          items: (quote.items ?? []).map((item: any) => ({
            product_id: item.product_id,
            quantidade: item.quantidade,
            preco_unit: item.preco_unit,
            total: item.total,
          })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setQuote(updated);

      const statusLabels: Record<string, string> = {
        ENVIADO: "Orcamento enviado!",
        APROVADO: "Orcamento aprovado!",
        REJEITADO: "Orcamento rejeitado.",
      };
      toast.success(statusLabels[newStatus] || "Status atualizado!");
    } catch {
      toast.error("Falha ao atualizar status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const convertToOrder = async () => {
    setConverting(true);
    try {
      const res = await fetch(`/api/locacoes/orcamentos/${id}/convert`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const order = await res.json();
      toast.success("Orcamento convertido em pedido!");
      router.push(`/locacoes/pedidos/${order.id}`);
    } catch {
      toast.error("Falha ao converter orcamento");
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este orcamento?")) return;
    try {
      await fetch(`/api/locacoes/orcamentos/${id}`, { method: "DELETE" });
      toast.success("Orcamento excluido");
      router.push("/locacoes/orcamentos");
    } catch {
      toast.error("Falha ao excluir orcamento");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!quote || quote.error)
    return <p className="text-gray-500">Orcamento nao encontrado.</p>;

  const items = quote.items ?? [];
  const descontoVal = typeof quote.desconto === "string" ? parseFloat(quote.desconto) : Number(quote.desconto) || 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">Orcamento {quote.quote_number}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <p className="text-sm text-gray-500">{quote.client?.nome_completo ?? "-"}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href={`/api/locacoes/orcamentos/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="secondary">
              <FileText className="h-4 w-4" />
              Gerar PDF
            </Button>
          </a>
          {/* Status action buttons */}
          {quote.status === "RASCUNHO" && (
            <Button
              size="sm"
              onClick={() => updateStatus("ENVIADO")}
              loading={updatingStatus}
            >
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          )}
          {quote.status === "ENVIADO" && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatus("APROVADO")}
                loading={updatingStatus}
              >
                <CheckCircle className="h-4 w-4" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => updateStatus("REJEITADO")}
                loading={updatingStatus}
              >
                <XCircle className="h-4 w-4" />
                Rejeitar
              </Button>
            </>
          )}
          {quote.status === "APROVADO" && (
            <Button size="sm" onClick={convertToOrder} loading={converting}>
              <ArrowRightCircle className="h-4 w-4" />
              Converter em Pedido
            </Button>
          )}
          <Link href={`/locacoes/orcamentos/${id}/edit`}>
            <Button size="sm" variant="secondary">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Cliente</h2>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold text-base">{quote.client?.nome_completo ?? "-"}</p>
              {quote.client?.cpf_cnpj && (
                <p className="text-gray-600">CPF/CNPJ: {quote.client.cpf_cnpj}</p>
              )}
              {quote.client?.telefone && (
                <p className="text-gray-600">Tel: {quote.client.telefone}</p>
              )}
              {quote.client?.email && (
                <p className="text-gray-600">E-mail: {quote.client.email}</p>
              )}
              {quote.client?.endereco && (
                <p className="text-gray-600">Endereco: {quote.client.endereco}</p>
              )}
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Evento</h2>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Data</span>
                  <p className="font-medium">{fmtDate(quote.data_evento)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Endereco de Entrega</span>
                  <p className="font-medium">{quote.endereco_entrega || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Horario</span>
                  <p className="font-medium">
                    {quote.horario_inicio || "-"} - {quote.horario_fim || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Horas Contratadas</span>
                  <p className="font-medium">{quote.horas_contratadas ?? "-"}h</p>
                </div>
              </div>
              {(quote.responsavel_nome || quote.responsavel_telefone) && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Responsavel no Local</span>
                  <p className="font-medium">
                    {quote.responsavel_nome}
                    {quote.responsavel_telefone ? ` - ${quote.responsavel_telefone}` : ""}
                  </p>
                </div>
              )}
              {quote.uso_monitor && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Monitores</span>
                  <p className="font-medium">{quote.qtd_monitores} monitor(es)</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Produtos</h2>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-[#2AABE2] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Produto</th>
                    <th className="px-4 py-3 text-right">Qtd</th>
                    <th className="px-4 py-3 text-right">Preco Unit.</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item: any, i: number) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                      <td className="px-4 py-3">{item.product?.name || "-"}</td>
                      <td className="px-4 py-3 text-right">{item.quantidade}</td>
                      <td className="px-4 py-3 text-right">{fmtCurrency(item.preco_unit)}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {fmtCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-4 border-t space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmtCurrency(quote.subtotal)}</span>
                </div>
                {descontoVal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Desconto</span>
                    <span className="text-red-500">- {fmtCurrency(quote.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-[#2AABE2]">{fmtCurrency(quote.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Observacoes</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Detalhes</h2>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              {[
                ["Orcamento", quote.quote_number],
                ["Criado em", fmtDate(quote.created_at)],
                ["Horas Contratadas", `${quote.horas_contratadas ?? 4}h`],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              {quote.converted_to_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pedido</span>
                  <Link
                    href={`/locacoes/pedidos/${quote.converted_to_id}`}
                    className="text-[#2AABE2] hover:underline text-sm"
                  >
                    Ver pedido
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
