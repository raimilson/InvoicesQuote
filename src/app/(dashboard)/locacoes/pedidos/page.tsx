"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Check, Minus } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";

interface RentalOrder {
  id: string;
  order_number: string;
  status: string;
  data_evento?: string;
  total: number;
  contract_generated: boolean;
  client?: { nome_completo: string };
  from_quote?: { id: string; quote_number: string } | null;
  created_at: string;
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    try {
      const data = await fetch(`/api/locacoes/pedidos?${p}`).then((r) => r.json());
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const del = async (id: string) => {
    if (!confirm("Deseja realmente excluir este pedido?")) return;
    await fetch(`/api/locacoes/pedidos/${id}`, { method: "DELETE" });
    toast.success("Pedido excluído");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <Link href="/locacoes/pedidos/new">
          <Button><Plus className="h-4 w-4" />Novo Pedido</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
            placeholder="Buscar por número ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          {["CONFIRMADO", "PAGO_PARCIAL", "PAGO", "ENTREGUE", "CONCLUIDO", "CANCELADO"].map((s) => (
            <option key={s} value={s}>{
              { CONFIRMADO: "Confirmado", PAGO_PARCIAL: "Pago Parcial", PAGO: "Pago", ENTREGUE: "Entregue", CONCLUIDO: "Concluído", CANCELADO: "Cancelado" }[s]
            }</option>
          ))}
        </select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nº</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Data do Evento</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Contrato</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Carregando...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Nenhum pedido encontrado.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/locacoes/pedidos/${o.id}`} className="text-[#2AABE2] hover:underline">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.client?.nome_completo ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {o.data_evento ? new Date(o.data_evento).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    R$ {Number(o.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status as any} /></td>
                  <td className="px-4 py-3 text-center">
                    {o.contract_generated ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/locacoes/pedidos/${o.id}/edit`}>
                        <Button size="sm" variant="ghost" className="text-xs">Editar</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={() => del(o.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
