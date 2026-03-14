"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface RentalClient {
  id: string;
  nome_completo: string;
}

interface RentalOrderFormProps {
  mode: "create" | "edit";
  defaultOrderNumber?: string;
  initialData?: any;
}

export default function RentalOrderForm({ mode, defaultOrderNumber, initialData }: RentalOrderFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<RentalClient[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    numero_pedido: initialData?.numero_pedido ?? defaultOrderNumber ?? "",
    cliente_id: initialData?.cliente_id ?? "",
    data_evento: initialData?.data_evento ? initialData.data_evento.split("T")[0] : "",
    endereco_entrega: initialData?.endereco_entrega ?? "",
    horario_inicio: initialData?.horario_inicio ?? "",
    horario_fim: initialData?.horario_fim ?? "",
    responsavel_nome: initialData?.responsavel_nome ?? "",
    responsavel_telefone: initialData?.responsavel_telefone ?? "",
    uso_monitor: initialData?.uso_monitor ?? false,
    qtd_monitores: initialData?.qtd_monitores ? String(initialData.qtd_monitores) : "0",
    horas_contratadas: initialData?.horas_contratadas ? String(initialData.horas_contratadas) : "4",
    pagamento_sinal: initialData?.pagamento_sinal ? String(initialData.pagamento_sinal) : "",
    pagamento_metodo: initialData?.pagamento_metodo ?? "PIX",
    observacoes: initialData?.observacoes ?? "",
    status: initialData?.status ?? "CONFIRMADO",
  });

  const itens = initialData?.itens ?? [];
  const subtotal = initialData?.subtotal ?? itens.reduce((s: number, i: any) => s + (i.total ?? 0), 0);
  const desconto = initialData?.desconto ?? 0;
  const total = initialData?.total ?? subtotal - desconto;

  useEffect(() => {
    fetch("/api/locacoes/clientes")
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cliente_id) { toast.error("Selecione um cliente"); return; }

    setLoading(true);
    const payload = {
      ...form,
      qtd_monitores: parseInt(form.qtd_monitores) || 0,
      horas_contratadas: parseInt(form.horas_contratadas) || 4,
      pagamento_sinal: parseFloat(form.pagamento_sinal) || 0,
      itens,
      subtotal,
      desconto,
      total,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/locacoes/pedidos" : `/api/locacoes/pedidos/${initialData.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const ped = await res.json();
      toast.success(mode === "create" ? "Pedido criado!" : "Pedido atualizado!");
      router.push(`/locacoes/pedidos/${ped.id}`);
    } catch {
      toast.error("Falha ao salvar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Novo Pedido" : `Editar Pedido ${initialData?.numero_pedido}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {mode === "create" ? "Criar Pedido" : "Salvar Alteracoes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader><h2 className="font-semibold">Cliente</h2></CardHeader>
            <CardContent>
              <Select
                label="Selecionar cliente"
                value={form.cliente_id}
                onChange={(e) => setForm((f) => ({ ...f, cliente_id: e.target.value }))}
                options={clients.map((c) => ({ value: c.id, label: c.nome_completo }))}
                placeholder="Escolha um cliente..."
              />
            </CardContent>
          </Card>

          {/* Event */}
          <Card>
            <CardHeader><h2 className="font-semibold">Evento</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Data do Evento"
                type="date"
                value={form.data_evento}
                onChange={(e) => setForm((f) => ({ ...f, data_evento: e.target.value }))}
              />
              <Input
                label="Endereco de Entrega"
                value={form.endereco_entrega}
                onChange={(e) => setForm((f) => ({ ...f, endereco_entrega: e.target.value }))}
                placeholder="Local do evento / endereco de entrega"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Horario Inicio"
                  type="time"
                  value={form.horario_inicio}
                  onChange={(e) => setForm((f) => ({ ...f, horario_inicio: e.target.value }))}
                />
                <Input
                  label="Horario Fim"
                  type="time"
                  value={form.horario_fim}
                  onChange={(e) => setForm((f) => ({ ...f, horario_fim: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsavel */}
          <Card>
            <CardHeader><h2 className="font-semibold">Responsavel no Local</h2></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={form.responsavel_nome}
                  onChange={(e) => setForm((f) => ({ ...f, responsavel_nome: e.target.value }))}
                />
                <Input
                  label="Telefone"
                  value={form.responsavel_telefone}
                  onChange={(e) => setForm((f) => ({ ...f, responsavel_telefone: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items (read-only from snapshot) */}
          <Card>
            <CardHeader><h2 className="font-semibold">Produtos (do orcamento)</h2></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Produto</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Qtd</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Preco Unit.</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {itens.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                        Nenhum item. Pedidos geralmente sao criados a partir de orcamentos.
                      </td>
                    </tr>
                  ) : (
                    itens.map((item: any, i: number) => (
                      <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                        <td className="px-4 py-3">{item.nome_produto || "-"}</td>
                        <td className="px-4 py-3 text-right">{item.quantidade}</td>
                        <td className="px-4 py-3 text-right">
                          R$ {(item.preco_unitario ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          R$ {(item.total ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="px-4 py-4 border-t space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Desconto</span>
                    <span className="text-red-500">- R$ {desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-[#2AABE2]">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><h2 className="font-semibold">Observacoes</h2></CardHeader>
            <CardContent>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                rows={3}
                placeholder="Observacoes sobre o pedido..."
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Detalhes do Pedido</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Numero do Pedido"
                value={form.numero_pedido}
                onChange={(e) => setForm((f) => ({ ...f, numero_pedido: e.target.value }))}
                readOnly={mode === "create"}
              />
              <Input
                label="Horas Contratadas"
                type="number"
                min="1"
                value={form.horas_contratadas}
                onChange={(e) => setForm((f) => ({ ...f, horas_contratadas: e.target.value }))}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                options={[
                  { value: "CONFIRMADO", label: "Confirmado" },
                  { value: "PAGO_PARCIAL", label: "Pago Parcial" },
                  { value: "PAGO", label: "Pago" },
                  { value: "ENTREGUE", label: "Entregue" },
                  { value: "CONCLUIDO", label: "Concluido" },
                  { value: "CANCELADO", label: "Cancelado" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">Pagamento</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Sinal (50% antecipado)"
                type="number"
                min="0"
                step="0.01"
                value={form.pagamento_sinal}
                onChange={(e) => setForm((f) => ({ ...f, pagamento_sinal: e.target.value }))}
                placeholder={`R$ ${(total * 0.5).toFixed(2)}`}
              />
              <Select
                label="Metodo de Pagamento"
                value={form.pagamento_metodo}
                onChange={(e) => setForm((f) => ({ ...f, pagamento_metodo: e.target.value }))}
                options={[
                  { value: "PIX", label: "PIX" },
                  { value: "DINHEIRO", label: "Dinheiro" },
                  { value: "CARTAO", label: "Cartao" },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
