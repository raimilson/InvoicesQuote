"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

interface RentalClient {
  id: string;
  nome_completo: string;
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  image_url?: string;
  active: boolean;
}

interface QuoteItem {
  product_id: string;
  product_name: string;
  quantidade: number;
  preco_unit: number;
  total: number;
}

const STATUS_OPTIONS = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REJEITADO", label: "Rejeitado" },
  { value: "CONVERTIDO", label: "Convertido" },
];

export default function EditOrcamentoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [clients, setClients] = useState<RentalClient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({
    nome_completo: "",
    cpf_cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
  });

  const [form, setForm] = useState({
    quote_number: "",
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
    desconto: "0",
    notes: "",
    status: "RASCUNHO",
  });

  const [items, setItems] = useState<QuoteItem[]>([
    { product_id: "", product_name: "", quantidade: 1, preco_unit: 0, total: 0 },
  ]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/locacoes/orcamentos/${id}`).then((r) => r.json()),
      fetch("/api/locacoes/clientes").then((r) => r.json()).catch(() => []),
      fetch("/api/locacoes/produtos").then((r) => r.json()).catch(() => []),
    ]).then(([quote, c, p]) => {
      setClients(Array.isArray(c) ? c : []);
      setProducts(Array.isArray(p) ? p : []);

      if (quote && !quote.error) {
        setForm({
          quote_number: quote.quote_number ?? "",
          client_id: quote.client_id ?? "",
          data_evento: quote.data_evento ? quote.data_evento.split("T")[0] : "",
          endereco_entrega: quote.endereco_entrega ?? "",
          horario_inicio: quote.horario_inicio ?? "",
          horario_fim: quote.horario_fim ?? "",
          responsavel_nome: quote.responsavel_nome ?? "",
          responsavel_telefone: quote.responsavel_telefone ?? "",
          uso_monitor: quote.uso_monitor ?? false,
          qtd_monitores: quote.qtd_monitores != null ? String(quote.qtd_monitores) : "0",
          horas_contratadas: quote.horas_contratadas != null ? String(quote.horas_contratadas) : "4",
          desconto: quote.desconto != null ? String(quote.desconto) : "0",
          notes: quote.notes ?? "",
          status: quote.status ?? "RASCUNHO",
        });

        if (quote.items && quote.items.length > 0) {
          setItems(
            quote.items.map((item: any) => ({
              product_id: item.product_id ?? "",
              product_name: item.product?.name ?? "",
              quantidade: item.quantidade ?? 1,
              preco_unit: typeof item.preco_unit === "string" ? parseFloat(item.preco_unit) : Number(item.preco_unit) || 0,
              total: typeof item.total === "string" ? parseFloat(item.total) : Number(item.total) || 0,
            }))
          );
        }
      }

      setFetching(false);
    }).catch(() => setFetching(false));
  }, [id]);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const desconto = parseFloat(form.desconto) || 0;
  const total = Math.max(0, subtotal - desconto);

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === "product_id") {
        const product = products.find((p) => p.id === value);
        if (product) {
          const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
          updated[index].product_name = product.name;
          updated[index].preco_unit = price;
          updated[index].total = price * updated[index].quantidade;
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

  const addClient = async () => {
    if (!newClient.nome_completo.trim()) {
      toast.error("Nome e obrigatorio");
      return;
    }
    try {
      const res = await fetch("/api/locacoes/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (!res.ok) throw new Error();
      const c = await res.json();
      setClients((prev) => [c, ...prev]);
      setForm((f) => ({ ...f, client_id: c.id }));
      setShowNewClient(false);
      setNewClient({ nome_completo: "", cpf_cnpj: "", email: "", telefone: "", endereco: "" });
      toast.success("Cliente adicionado");
    } catch {
      toast.error("Falha ao adicionar cliente");
    }
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
    if (!form.data_evento) {
      toast.error("Informe a data do evento");
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
      desconto: parseFloat(form.desconto) || 0,
      notes: form.notes || null,
      subtotal,
      total,
      status: form.status,
      items: items.map((i) => ({
        product_id: i.product_id,
        quantidade: i.quantidade,
        preco_unit: i.preco_unit,
        total: i.total,
      })),
    };

    try {
      const res = await fetch(`/api/locacoes/orcamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Orcamento atualizado!");
      router.push(`/locacoes/orcamentos/${id}`);
    } catch {
      toast.error("Falha ao salvar orcamento");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Orcamento {form.quote_number}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar Alteracoes
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
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Selecionar cliente
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2AABE2] focus:border-transparent"
                    value={form.client_id}
                    onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                  >
                    <option value="">Escolha um cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome_completo}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNewClient((v) => !v)}
                >
                  + Novo Cliente
                </Button>
              </div>
              {showNewClient && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">Adicionar cliente</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Nome Completo"
                      value={newClient.nome_completo}
                      onChange={(e) =>
                        setNewClient((c) => ({ ...c, nome_completo: e.target.value }))
                      }
                    />
                    <Input
                      label="CPF/CNPJ"
                      value={newClient.cpf_cnpj}
                      onChange={(e) => setNewClient((c) => ({ ...c, cpf_cnpj: e.target.value }))}
                    />
                    <Input
                      label="Telefone"
                      value={newClient.telefone}
                      onChange={(e) => setNewClient((c) => ({ ...c, telefone: e.target.value }))}
                    />
                    <Input
                      label="E-mail"
                      value={newClient.email}
                      onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))}
                    />
                    <div className="col-span-2">
                      <Input
                        label="Endereco"
                        value={newClient.endereco}
                        onChange={(e) => setNewClient((c) => ({ ...c, endereco: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={addClient}>
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowNewClient(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
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
            <CardHeader>
              <h2 className="font-semibold">Responsavel no Local</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={form.responsavel_nome}
                  onChange={(e) => setForm((f) => ({ ...f, responsavel_nome: e.target.value }))}
                  placeholder="Nome do responsavel"
                />
                <Input
                  label="Telefone"
                  value={form.responsavel_telefone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, responsavel_telefone: e.target.value }))
                  }
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
                      <th className="px-4 py-3 text-right font-semibold text-gray-600 w-24">
                        Qtd
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600 w-32">
                        Preco Unit.
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-600 w-32">
                        Total
                      </th>
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
                            onChange={(e) =>
                              updateItem(index, "quantidade", parseInt(e.target.value) || 1)
                            }
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                            value={item.preco_unit}
                            onChange={(e) =>
                              updateItem(index, "preco_unit", parseFloat(e.target.value) || 0)
                            }
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
              <h2 className="font-semibold">Observacoes</h2>
            </CardHeader>
            <CardContent>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                rows={3}
                placeholder="Observacoes sobre o orcamento..."
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
              <h2 className="font-semibold">Detalhes do Orcamento</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Numero"
                value={form.quote_number}
                readOnly
              />
              <Input
                label="Horas Contratadas"
                type="number"
                min="1"
                value={form.horas_contratadas}
                onChange={(e) => setForm((f) => ({ ...f, horas_contratadas: e.target.value }))}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2AABE2] focus:border-transparent"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
