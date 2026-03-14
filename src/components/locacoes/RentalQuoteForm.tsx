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
  nome: string;
  preco: number;
}

interface QuoteItem {
  produto_id: string;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
}

interface RentalQuoteFormProps {
  mode: "create" | "edit";
  defaultQuoteNumber?: string;
  initialData?: any;
}

export default function RentalQuoteForm({ mode, defaultQuoteNumber, initialData }: RentalQuoteFormProps) {
  const router = useRouter();
  const [clients, setClients] = useState<RentalClient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ nome_completo: "", cpf_cnpj: "", email: "", telefone: "", endereco: "" });

  const [form, setForm] = useState({
    numero_orcamento: initialData?.numero_orcamento ?? defaultQuoteNumber ?? "",
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
    desconto: initialData?.desconto ? String(initialData.desconto) : "0",
    observacoes: initialData?.observacoes ?? "",
    status: initialData?.status ?? "RASCUNHO",
  });

  const [items, setItems] = useState<QuoteItem[]>(
    initialData?.itens ?? [{ produto_id: "", nome_produto: "", quantidade: 1, preco_unitario: 0, total: 0 }]
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/locacoes/clientes").then((r) => r.json()).catch(() => []),
      fetch("/api/locacoes/produtos").then((r) => r.json()).catch(() => []),
    ]).then(([c, p]) => {
      setClients(Array.isArray(c) ? c : []);
      setProducts(Array.isArray(p) ? p : []);
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const desconto = parseFloat(form.desconto) || 0;
  const total = subtotal - desconto;

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-fill price when product changes
      if (field === "produto_id") {
        const product = products.find((p) => p.id === value);
        if (product) {
          updated[index].nome_produto = product.nome;
          updated[index].preco_unitario = product.preco;
          updated[index].total = product.preco * updated[index].quantidade;
        }
      }

      // Recalculate total when quantity or price changes
      if (field === "quantidade" || field === "preco_unitario") {
        updated[index].total = updated[index].quantidade * updated[index].preco_unitario;
      }

      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { produto_id: "", nome_produto: "", quantidade: 1, preco_unitario: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addClient = async () => {
    if (!newClient.nome_completo.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    try {
      const res = await fetch("/api/locacoes/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      const c = await res.json();
      setClients((prev) => [c, ...prev]);
      setForm((f) => ({ ...f, cliente_id: c.id }));
      setShowNewClient(false);
      setNewClient({ nome_completo: "", cpf_cnpj: "", email: "", telefone: "", endereco: "" });
      toast.success("Cliente adicionado");
    } catch {
      toast.error("Falha ao adicionar cliente");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cliente_id) { toast.error("Selecione um cliente"); return; }
    if (items.some((i) => !i.produto_id)) { toast.error("Selecione um produto para cada item"); return; }

    setLoading(true);
    const payload = {
      ...form,
      qtd_monitores: parseInt(form.qtd_monitores) || 0,
      horas_contratadas: parseInt(form.horas_contratadas) || 4,
      desconto: parseFloat(form.desconto) || 0,
      subtotal,
      total,
      itens: items,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/locacoes/orcamentos" : `/api/locacoes/orcamentos/${initialData.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const orc = await res.json();
      toast.success(mode === "create" ? "Orçamento criado!" : "Orçamento atualizado!");
      router.push(`/locacoes/orcamentos/${orc.id}`);
    } catch {
      toast.error("Falha ao salvar orçamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Novo Orçamento" : `Editar Orçamento ${initialData?.numero_orcamento}`}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={loading}>
            {mode === "create" ? "Criar Orçamento" : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client */}
          <Card>
            <CardHeader><h2 className="font-semibold">Cliente</h2></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    label="Selecionar cliente"
                    value={form.cliente_id}
                    onChange={(e) => setForm((f) => ({ ...f, cliente_id: e.target.value }))}
                    options={clients.map((c) => ({ value: c.id, label: c.nome_completo }))}
                    placeholder="Escolha um cliente..."
                  />
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowNewClient((v) => !v)}>
                  + Novo Cliente
                </Button>
              </div>
              {showNewClient && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">Adicionar cliente</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Nome Completo" value={newClient.nome_completo} onChange={(e) => setNewClient((c) => ({ ...c, nome_completo: e.target.value }))} />
                    <Input label="CPF/CNPJ" value={newClient.cpf_cnpj} onChange={(e) => setNewClient((c) => ({ ...c, cpf_cnpj: e.target.value }))} />
                    <Input label="Telefone" value={newClient.telefone} onChange={(e) => setNewClient((c) => ({ ...c, telefone: e.target.value }))} />
                    <Input label="E-mail" value={newClient.email} onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))} />
                    <div className="col-span-2">
                      <Input label="Endereço" value={newClient.endereco} onChange={(e) => setNewClient((c) => ({ ...c, endereco: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={addClient}>Adicionar</Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowNewClient(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
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

          {/* Responsavel */}
          <Card>
            <CardHeader><h2 className="font-semibold">Responsável no Local</h2></CardHeader>
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
            <CardHeader><h2 className="font-semibold">Monitores</h2></CardHeader>
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
                            value={item.produto_id}
                            onChange={(e) => updateItem(index, "produto_id", e.target.value)}
                          >
                            <option value="">Selecionar produto...</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.nome}</option>
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
                            value={item.preco_unitario}
                            onChange={(e) => updateItem(index, "preco_unitario", parseFloat(e.target.value) || 0)}
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
                  <span className="font-medium">R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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
                  <span className="text-[#2AABE2]">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><h2 className="font-semibold">Observações</h2></CardHeader>
            <CardContent>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
                rows={3}
                placeholder="Observações sobre o orçamento..."
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Detalhes do Orçamento</h2></CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Número"
                value={form.numero_orcamento}
                onChange={(e) => setForm((f) => ({ ...f, numero_orcamento: e.target.value }))}
                readOnly={mode === "create"}
              />
              <Input
                label="Horas Contratadas"
                type="number"
                min="1"
                value={form.horas_contratadas}
                onChange={(e) => setForm((f) => ({ ...f, horas_contratadas: e.target.value }))}
              />
              {mode === "edit" && (
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  options={[
                    { value: "RASCUNHO", label: "Rascunho" },
                    { value: "ENVIADO", label: "Enviado" },
                    { value: "APROVADO", label: "Aprovado" },
                    { value: "REJEITADO", label: "Rejeitado" },
                    { value: "CONVERTIDO", label: "Convertido" },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
