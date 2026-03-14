"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";

interface RentalQuote {
  id: string;
  quote_number: string;
  status: string;
  data_evento?: string;
  total: string | number;
  client?: { nome_completo: string };
  created_at: string;
}

export default function OrcamentosPage() {
  const [quotes, setQuotes] = useState<RentalQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    try {
      const data = await fetch(`/api/locacoes/orcamentos?${p}`).then((r) => r.json());
      setQuotes(Array.isArray(data) ? data : []);
    } catch {
      setQuotes([]);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const del = async (id: string) => {
    if (!confirm("Deseja realmente excluir este orcamento?")) return;
    try {
      await fetch(`/api/locacoes/orcamentos/${id}`, { method: "DELETE" });
      toast.success("Orcamento excluido");
      load();
    } catch {
      toast.error("Falha ao excluir orcamento");
    }
  };

  const fmtCurrency = (v: string | number) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return `R$ ${(num || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const fmtDate = (d?: string) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("pt-BR");
  };

  const statusLabels: Record<string, string> = {
    RASCUNHO: "Rascunho",
    ENVIADO: "Enviado",
    APROVADO: "Aprovado",
    REJEITADO: "Rejeitado",
    CONVERTIDO: "Convertido",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orcamentos</h1>
        <Link href="/locacoes/orcamentos/new">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Orcamento
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
            placeholder="Buscar por numero ou cliente..."
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
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">N.</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Data do Evento</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Carregando...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    Nenhum orcamento encontrado.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/locacoes/orcamentos/${q.id}`}
                        className="text-[#2AABE2] hover:underline"
                      >
                        {q.quote_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {q.client?.nome_completo ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(q.data_evento)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{fmtCurrency(q.total)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.status as any} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/locacoes/orcamentos/${q.id}/edit`}>
                          <Button size="sm" variant="ghost" className="text-xs">
                            <Edit className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => del(q.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
