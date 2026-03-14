"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface RentalClient {
  id: string;
  nome_completo: string;
  cpf_cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
}

export default function RentalClientsPage() {
  const [clients, setClients] = useState<RentalClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    fetch("/api/locacoes/clientes")
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm("Deseja realmente excluir este cliente?")) return;
    try {
      await fetch(`/api/locacoes/clientes/${id}`, { method: "DELETE" });
      toast.success("Cliente excluído");
      load();
    } catch {
      toast.error("Falha ao excluir");
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.cpf_cnpj && c.cpf_cnpj.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Link href="/locacoes/clientes/new">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
          placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">CPF/CNPJ</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">E-mail</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Telefone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Carregando...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Nenhum cliente encontrado.</td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/locacoes/clientes/${client.id}`}
                        className="font-medium text-[#2AABE2] hover:underline"
                      >
                        {client.nome_completo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{client.cpf_cnpj || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{client.email || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{client.telefone || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/locacoes/clientes/${client.id}/edit`}>
                          <Button size="sm" variant="ghost" className="text-xs">Editar</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-red-500 hover:text-red-700"
                          onClick={() => del(client.id)}
                        >
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
