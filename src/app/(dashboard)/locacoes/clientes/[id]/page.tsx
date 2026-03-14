"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface RentalClient {
  id: string;
  nome_completo: string;
  cpf_cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
  created_at: string;
}

export default function RentalClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<RentalClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/locacoes/clientes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setClient(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este cliente?")) return;
    try {
      const res = await fetch(`/api/locacoes/clientes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Cliente excluído");
      router.push("/locacoes/clientes");
    } catch {
      toast.error("Falha ao excluir cliente");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!client) return <p className="text-gray-500">Cliente não encontrado.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{client.nome_completo}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/locacoes/clientes/${id}/edit`}>
            <Button size="sm">
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

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Informações do Cliente</h2>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Nome Completo</span>
              <p className="font-medium">{client.nome_completo}</p>
            </div>
            <div>
              <span className="text-gray-500">CPF / CNPJ</span>
              <p className="font-medium">{client.cpf_cnpj || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">E-mail</span>
              <p className="font-medium">{client.email || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500">Telefone</span>
              <p className="font-medium">{client.telefone || "-"}</p>
            </div>
          </div>
          <div>
            <span className="text-gray-500">Endereço</span>
            <p className="font-medium">{client.endereco || "-"}</p>
          </div>
          <div>
            <span className="text-gray-500">Cadastrado em</span>
            <p className="text-gray-700">{new Date(client.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
