"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  FileText,
  Trash2,
  CheckCircle2,
  Truck,
  Ban,
  DollarSign,
  Check,
  Send,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMADO: "Confirmado",
  PAGO_PARCIAL: "Pago Parcial",
  PAGO: "Pago",
  ENTREGUE: "Entregue",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const METODO_LABELS: Record<string, string> = {
  PIX: "PIX",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
  TRANSFERENCIA: "Transferência",
};

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingSignature, setSendingSignature] = useState(false);
  const [checkingSignature, setCheckingSignature] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signEmail, setSignEmail] = useState("");
  const [signWhatsapp, setSignWhatsapp] = useState("");

  const loadOrder = () => {
    fetch(`/api/locacoes/pedidos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fmtCurrency = (v: number | string | null | undefined) => {
    const num = typeof v === "string" ? parseFloat(v) : v ?? 0;
    return `R$ ${(num || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const changeStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/locacoes/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...order, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setOrder(updated);
      toast.success(`Status alterado para ${STATUS_LABELS[newStatus] ?? newStatus}`);
    } catch {
      toast.error("Falha ao alterar status");
    } finally {
      setUpdating(false);
    }
  };

  const openSignModal = () => {
    setSignEmail(order?.client?.email || "");
    setSignWhatsapp(order?.client?.telefone || "");
    setShowSignModal(true);
  };

  const sendForSignature = async () => {
    if (!signEmail) {
      toast.error("E-mail é obrigatório para envio da assinatura");
      return;
    }
    setSendingSignature(true);
    setShowSignModal(false);
    try {
      const res = await fetch(`/api/locacoes/pedidos/${id}/assinar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar");
      toast.success(data.message || "Contrato enviado para assinatura!");
      // If whatsapp is filled, open whatsapp with the sign link
      if (signWhatsapp && data.sign_url) {
        const phone = signWhatsapp.replace(/\D/g, "");
        const whatsappPhone = phone.startsWith("55") ? phone : `55${phone}`;
        const msg = encodeURIComponent(
          `Olá ${order.client?.nome_completo}! Segue o link para assinatura digital do contrato de locação (${order.order_number}):\n\n${data.sign_url}\n\nKezpo Locações`
        );
        window.open(`https://wa.me/${whatsappPhone}?text=${msg}`, "_blank");
      }
      loadOrder();
    } catch (err: any) {
      toast.error(err.message || "Falha ao enviar para assinatura");
    } finally {
      setSendingSignature(false);
    }
  };

  const checkSignatureStatus = async () => {
    setCheckingSignature(true);
    try {
      const res = await fetch(`/api/locacoes/pedidos/${id}/assinar`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao verificar");
      const statusLabels: Record<string, string> = {
        PENDING: "Aguardando assinatura",
        SIGNED: "Assinado!",
        REFUSED: "Recusado pelo cliente",
      };
      toast.success(statusLabels[data.status] || data.status);
      loadOrder();
    } catch (err: any) {
      toast.error(err.message || "Falha ao verificar status");
    } finally {
      setCheckingSignature(false);
    }
  };

  const deleteOrder = async () => {
    if (!confirm("Deseja realmente excluir este pedido?")) return;
    try {
      await fetch(`/api/locacoes/pedidos/${id}`, { method: "DELETE" });
      toast.success("Pedido excluído");
      router.push("/locacoes/pedidos");
    } catch {
      toast.error("Falha ao excluir pedido");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!order || order.error) return <p className="text-gray-500">Pedido não encontrado.</p>;

  const items = order.items ?? [];
  const status = order.status as string;

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
              <h1 className="text-2xl font-bold">Pedido #{order.order_number}</h1>
              <StatusBadge status={order.status} />
              {order.contract_generated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <Check className="h-3 w-3" />
                  Contrato Gerado
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{order.client?.nome_completo ?? "-"}</p>
            {order.from_quote && (
              <Link
                href={`/locacoes/orcamentos/${order.from_quote.id}`}
                className="text-sm text-[#2AABE2] hover:underline"
              >
                Originado do Orçamento #{order.from_quote.quote_number}
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a
            href={`/api/locacoes/pedidos/${id}/contrato`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="secondary">
              <FileText className="h-4 w-4" />
              Gerar Contrato
            </Button>
          </a>
          {!order.autentique_doc_id && (
            <Button
              size="sm"
              onClick={openSignModal}
              loading={sendingSignature}
            >
              <Send className="h-4 w-4" />
              Enviar p/ Assinatura
            </Button>
          )}
          {order.autentique_doc_id && (
            <Button
              size="sm"
              variant="secondary"
              onClick={checkSignatureStatus}
              loading={checkingSignature}
            >
              <RefreshCw className="h-4 w-4" />
              Verificar Assinatura
            </Button>
          )}
          <Link href={`/locacoes/pedidos/${id}/edit`}>
            <Button size="sm" variant="secondary">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Button size="sm" variant="danger" onClick={deleteOrder}>
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
              <p className="font-semibold text-base">{order.client?.nome_completo ?? "-"}</p>
              {order.client?.cpf_cnpj && (
                <p className="text-gray-600">CPF/CNPJ: {order.client.cpf_cnpj}</p>
              )}
              {order.client?.telefone && (
                <p className="text-gray-600">Tel: {order.client.telefone}</p>
              )}
              {order.client?.email && (
                <p className="text-gray-600">E-mail: {order.client.email}</p>
              )}
              {order.client?.endereco && (
                <p className="text-gray-600">Endereço: {order.client.endereco}</p>
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
                  <p className="font-medium">
                    {order.data_evento
                      ? new Date(order.data_evento).toLocaleDateString("pt-BR")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Endereço de Entrega</span>
                  <p className="font-medium">{order.endereco_entrega || "-"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Horário</span>
                  <p className="font-medium">
                    {order.horario_inicio || "-"} - {order.horario_fim || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Horas Contratadas</span>
                  <p className="font-medium">{order.horas_contratadas ?? "-"}h</p>
                </div>
              </div>
              {(order.responsavel_nome || order.responsavel_telefone) && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Responsável no Local</span>
                  <p className="font-medium">
                    {order.responsavel_nome}
                    {order.responsavel_telefone ? ` - ${order.responsavel_telefone}` : ""}
                  </p>
                </div>
              )}
              {order.uso_monitor && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Monitores</span>
                  <p className="font-medium">{order.qtd_monitores} monitor(es)</p>
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
                    <th className="px-4 py-3 text-right">Preço Unit.</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item: any, i: number) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                      <td className="px-4 py-3">
                        {item.product_name || item.nome_produto || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantidade}</td>
                      <td className="px-4 py-3 text-right">
                        {fmtCurrency(item.preco_unit ?? item.preco_unitario ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {fmtCurrency(item.total ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-4 border-t space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmtCurrency(order.subtotal ?? 0)}</span>
                </div>
                {Number(order.desconto) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Desconto</span>
                    <span className="text-red-500">- {fmtCurrency(order.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-[#2AABE2]">{fmtCurrency(order.total ?? 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Observações</h2>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
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
              <div className="flex justify-between">
                <span className="text-gray-500">Pedido</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Criado em</span>
                <span className="font-medium">
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {order.from_quote && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Orçamento</span>
                  <Link
                    href={`/locacoes/orcamentos/${order.from_quote.id}`}
                    className="text-[#2AABE2] hover:underline text-sm"
                  >
                    {order.from_quote.quote_number}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold">Pagamento</h2>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Método</span>
                <span className="font-medium">
                  {order.pagamento_metodo
                    ? METODO_LABELS[order.pagamento_metodo] ?? order.pagamento_metodo
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sinal</span>
                <span className="font-semibold text-green-600">
                  {order.pagamento_sinal ? fmtCurrency(order.pagamento_sinal) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Saldo restante</span>
                <span className="font-semibold text-orange-600">
                  {fmtCurrency(
                    Number(order.total ?? 0) - Number(order.pagamento_sinal ?? 0)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assinatura Digital */}
          {order.autentique_doc_id && (
            <Card>
              <CardHeader>
                <h2 className="font-semibold">Assinatura Digital</h2>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      order.autentique_status === "SIGNED"
                        ? "bg-green-100 text-green-700"
                        : order.autentique_status === "REFUSED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.autentique_status === "SIGNED"
                      ? "Assinado"
                      : order.autentique_status === "REFUSED"
                      ? "Recusado"
                      : "Aguardando"}
                  </span>
                </div>
                {order.autentique_sign_url && (
                  <a
                    href={order.autentique_sign_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#2AABE2] hover:underline text-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Link de assinatura
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status actions */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Ações de Status</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {status === "CONFIRMADO" && (
                <>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => changeStatus("PAGO_PARCIAL")}
                    disabled={updating}
                  >
                    <DollarSign className="h-4 w-4" />
                    Marcar como Pago Parcial
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => changeStatus("PAGO")}
                    disabled={updating}
                  >
                    <DollarSign className="h-4 w-4" />
                    Marcar como Pago
                  </Button>
                </>
              )}
              {status === "PAGO_PARCIAL" && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => changeStatus("PAGO")}
                  disabled={updating}
                >
                  <DollarSign className="h-4 w-4" />
                  Marcar como Pago
                </Button>
              )}
              {(status === "PAGO" || status === "CONFIRMADO" || status === "PAGO_PARCIAL") && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() => changeStatus("ENTREGUE")}
                  disabled={updating}
                >
                  <Truck className="h-4 w-4" />
                  Marcar como Entregue
                </Button>
              )}
              {status === "ENTREGUE" && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => changeStatus("CONCLUIDO")}
                  disabled={updating}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Concluir
                </Button>
              )}
              {status !== "CANCELADO" && status !== "CONCLUIDO" && (
                <Button
                  size="sm"
                  variant="danger"
                  className="w-full"
                  onClick={() => changeStatus("CANCELADO")}
                  disabled={updating}
                >
                  <Ban className="h-4 w-4" />
                  Cancelar
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modal de Assinatura */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">Enviar Contrato para Assinatura</h2>
            <p className="text-sm text-gray-600">
              O contrato será enviado por e-mail via Autentique. Se preencher o WhatsApp,
              o link de assinatura também será enviado por lá.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail do cliente *
              </label>
              <input
                type="email"
                value={signEmail}
                onChange={(e) => setSignEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2AABE2] focus:border-transparent outline-none"
                placeholder="cliente@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                value={signWhatsapp}
                onChange={(e) => setSignWhatsapp(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2AABE2] focus:border-transparent outline-none"
                placeholder="(41) 99999-9999"
              />
              <p className="text-xs text-gray-400 mt-1">
                Se preenchido, abre o WhatsApp com o link de assinatura
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={() => setShowSignModal(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={sendForSignature}
                disabled={!signEmail}
              >
                <Send className="h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
