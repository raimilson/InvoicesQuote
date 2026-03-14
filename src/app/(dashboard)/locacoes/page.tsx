"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollText, ClipboardCheck, Package, Users, Plus, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/ui/Button";

interface Stats {
  orcamentosRascunho: number;
  pedidosConfirmados: number;
  totalProdutos: number;
  totalClientes: number;
}

interface UpcomingOrder {
  id: string;
  order_number: string;
  data_evento: string;
  endereco_entrega: string;
  status: string;
  client?: { nome_completo: string };
}

export default function LocacoesDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingOrder[]>([]);

  useEffect(() => {
    // Fetch stats
    Promise.all([
      fetch("/api/locacoes/orcamentos?status=RASCUNHO").then((r) => r.json()).catch(() => []),
      fetch("/api/locacoes/pedidos?status=CONFIRMADO").then((r) => r.json()).catch(() => []),
      fetch("/api/locacoes/produtos").then((r) => r.json()).catch(() => []),
      fetch("/api/locacoes/clientes").then((r) => r.json()).catch(() => []),
    ]).then(([orc, ped, prod, cli]) => {
      setStats({
        orcamentosRascunho: Array.isArray(orc) ? orc.length : 0,
        pedidosConfirmados: Array.isArray(ped) ? ped.length : 0,
        totalProdutos: Array.isArray(prod) ? prod.length : 0,
        totalClientes: Array.isArray(cli) ? cli.length : 0,
      });
    });

    // Fetch upcoming orders
    fetch("/api/locacoes/pedidos?upcoming=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUpcoming(data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { label: "Orçamentos Pendentes", value: stats?.orcamentosRascunho ?? 0, icon: ScrollText, color: "text-orange-600", bg: "bg-orange-50", href: "/locacoes/orcamentos" },
    { label: "Pedidos Confirmados", value: stats?.pedidosConfirmados ?? 0, icon: ClipboardCheck, color: "text-blue-600", bg: "bg-blue-50", href: "/locacoes/pedidos" },
    { label: "Produtos Cadastrados", value: stats?.totalProdutos ?? 0, icon: Package, color: "text-green-600", bg: "bg-green-50", href: "/locacoes/produtos" },
    { label: "Clientes", value: stats?.totalClientes ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50", href: "/locacoes/clientes" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Painel - Locações</h1>
        <div className="flex gap-2">
          <Link href="/locacoes/orcamentos/new">
            <Button size="sm"><Plus className="h-4 w-4" />Novo Orçamento</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`p-2.5 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold">{stats ? s.value : "..."}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#2AABE2]" />
            <h2 className="font-semibold">Próximos Eventos</h2>
          </div>
          <Link href="/locacoes/pedidos" className="text-sm text-[#2AABE2] hover:underline">Ver todos</Link>
        </CardHeader>
        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500 px-6 py-4">Nenhum evento próximo encontrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Pedido</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Data do Evento</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Local</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcoming.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/locacoes/pedidos/${order.id}`} className="font-medium text-[#2AABE2] hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{order.client?.nome_completo ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.data_evento).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.endereco_entrega || "-"}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status as any} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
