"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Plus, Trash2 } from "lucide-react";

interface RentalClient {
  id: string;
  nome_completo: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  product_id: string;
  product_name: string;
  quantidade: number;
  preco_unit: number;
  total: number;
}

export default function NewPedidoPage() {
  const router = useRouter();
  const [clients, setClients] = useState<RentalClient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    data_evento: "",
    endereco_entrega: "",
    horario_inicio: "",
    horario_fim: "",
    responsavel_nome: "",
    responsavel_telefone: "",
    uso_monitor: false,
    qtd_monitores: "0",
    horas_contratadas: "4",
    pagamento_sinal: "",
    pagamento_metodo: "PIX",
    desconto: "0",
    notes: "",
    status: "CONFIRMADO",
  });

  const [items, setItems] = useState<OrderItem[]>([
    { product_id: "", product_name: "", quantidade: 1, preco_unit: 0, total: 0 },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("/api/locacoes/clientes").then((r) => r.json()).catch(() => []),
      fetch("/api/locacoes/produtos").then((r) => r.json()).catch(() => []),
    ]).then(([c, p]) => {
      setClients(Array.isArray(c) ? c : []);
      setProducts(
        Array.isArray(p)
          ? p.map((pr: any) => ({
              id: pr.id,
              name: pr.nome ?? pr.name,
              price: Number(pr.preco ?? pr.price ?? 0),
            }))
          : []
      );
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const desconto = parseFloat(form.desconto) || 0;
  const total = subtotal - desconto;

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === "product_id") {
        const product = products.find((p) => p.id === value);
        if (product) {
          updated[index].product_name = product.name;
          updated[index].preco_unit = product.price;
          updated[index].total = product.price * updated[index].quantidade;
        }
      }

      if (field === "quantidade" || field === "preco_unit") {
        updated[index].total = updated[index].quantidade * updated[index].preco_unit;
      }

      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product_id: "", product_name: "", quantidade: 1, preco_unit: 0, total: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) {
      toast.error("Selecione um cliente");
      return;
    }
    if (items.some((i) => !i.product_id)) {
      toast.error("Selecione um produto para cada item");
      return;
    }

    setLoading(true);
    const payload = {
      client_id: form.client_id,
      data_evento: form.data_evento,
      endereco_entrega: form.endereco_entrega,
      horario_inicio: form.horario_inicio,
      horario_fim: form.horario_fim,
      responsavel_nome: form.responsavel_nome || null,
      responsavel_telefone: form.responsavel_telefone || null,
      uso_monitor: form.uso_monitor,
      qtd_monitores: parseInt(form.qtd_monitores) || 0,
      horas_contratadas: parseInt(form.horas_contratadas) || 4,
      pagamento_sinal: parseFloat(form.pagamento_sinal) || null,
      pagamento_metodo: form.pagamento_metodo || null,
      desconto: parseFloat(form.desconto) || 0,
      notes: form.notes || null,
      status: form.status,
      items,
      subtotal,
      total,
    };

    try {
      const res = await fetch("/api/locacoes/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const ped = await res.json();
      toast.success("Pedido criado!");
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
        <h1 className="text-2xl font-bold text-gray-900">Novo Pedido</h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Criar Pedido
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Cliente</h2>
            </CardHeader>
            <CardContent>
              <Select
                label="Selecionar cliente"
                value={form.client_id}
                onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                options={clients.map((c) => ({ value: c.id, label: c.nome_completo }))}
                placeholder="Escolha um cliente..."
              />
            </CardContent>
          </Card>

          {/* Event */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Evento</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Data do Evento"
                type="date"
                value={form.data_evento}
                onChange={(e) => setForm((f) => ({ ...f, data_evento: e.target.value }))}
              />
              <Input
                label="Endereço de Entrega"
                value={form.endereco_entrega}
                onChange={(e) => setForm((f) => ({ ...f, endereco_entrega: e.target.value }))}
                placeholder="Local do evento / endereço de entrega"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Horário Início"
                  type="time"
                  value={form.horario_inicio}
                  onChange={(e) => setForm((f) => ({ ...f, horario_inicio: e.target.value }))}
                />
                <Input
                  label="Horário Fim"
                  type="time"
                  value={form.horario_fim}
                  onChange={(e) => setForm((f) => ({ ...f, horario_fim: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Responsável no Local</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={form.responsavel_nome}
                  onChange={(e) => setForm((f) => ({ ...f, responsavel_nome: e.target.value }))}
                  placeholder="Nome do responsável"
                />
                <Input
                  label="Telefone"
                  value={form.responsavel_telefone}
                  onChange={(e) => setForm((f) => ({ ...f, responsavel_telefone: e.target.value }))}
                  placeholder="(41) 99999-9999"
                />
              </div>
            </CardContent>
          </Card>

          {/* Monitor */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Monitores</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.uso_monitor}
                  onChange={(e) => setForm((f) => ({ ...f, uso_monitor: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-[#2AABE2] focus:ring-[#2AABE2]"
                />
                <span className="text-sm font-medium text-gray-700">Utilizar monitores</span>
              </label>
              {form.uso_monitor && (
                <Input
                  label="Quantidade de Monitores"
                  type="number"
                  min="0"
                  value={form.qtd_monitores}
                  onChange={(e) => setForm((f) => ({ ...f, qtd_monitores: e.target.value }))}
                />
              )}
            </CardContent>
          </Card>

          {/* Products table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Produtos</h2>
                <Button type="button" size="sm" variant="secondary" onClick={addItem}>
                  <Plus className="h-4 w-4" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Produto</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600 w-24">Qtd</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600 w-32">Preço Unit.</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600 w-32">Total</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                            value={item.product_id}
                            onChange={(e) => updateItem(index, "product_id", e.target.value)}
                          >
                            <option value="">Selecionar produto...</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                            value={item.quantidade}
                            onChange={(e) => updateItem(index, "quantidade", parseInt(e.target.value) || 1)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                            value={item.preco_unit}
                            onChange={(e) => updateItem(index, "preco_unit", parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-700">
                          R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            disabled={items.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-4 border-t space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Desconto</span>
                  <input
                    type="number"
                    className="w-32 border border-gray-200 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                    placeholder="0.00"
                    value={form.desconto}
                    onChange={(e) => setForm((f) => ({ ...f, desconto: e.target.value }))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-[#2AABE2]">
                    R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Observações</h2>
            </CardHeader>
            <CardContent>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                rows={3}
                placeholder="Observações sobre o pedido..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Detalhes do Pedido</h2>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  { value: "CONCLUIDO", label: "Concluído" },
                  { value: "CANCELADO", label: "Cancelado" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold">Pagamento</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Sinal (R$)"
                type="number"
                min="0"
                step="0.01"
                value={form.pagamento_sinal}
                onChange={(e) => setForm((f) => ({ ...f, pagamento_sinal: e.target.value }))}
                placeholder={`R$ ${(total * 0.5).toFixed(2)}`}
              />
              <Select
                label="Método de Pagamento"
                value={form.pagamento_metodo}
                onChange={(e) => setForm((f) => ({ ...f, pagamento_metodo: e.target.value }))}
                options={[
                  { value: "PIX", label: "PIX" },
                  { value: "DINHEIRO", label: "Dinheiro" },
                  { value: "CARTAO", label: "Cartão" },
                  { value: "TRANSFERENCIA", label: "Transferência" },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
