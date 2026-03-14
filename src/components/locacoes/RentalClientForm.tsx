"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface RentalClientFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    nome_completo: string;
    cpf_cnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
    endereco?: string | null;
  };
}

export default function RentalClientForm({ mode, initialData }: RentalClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome_completo: initialData?.nome_completo ?? "",
    cpf_cnpj: initialData?.cpf_cnpj ?? "",
    email: initialData?.email ?? "",
    telefone: initialData?.telefone ?? "",
    endereco: initialData?.endereco ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome_completo.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }

    setLoading(true);
    const payload = {
      nome_completo: form.nome_completo,
      cpf_cnpj: form.cpf_cnpj || null,
      email: form.email || null,
      telefone: form.telefone || null,
      endereco: form.endereco || null,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/locacoes/clientes" : `/api/locacoes/clientes/${initialData!.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const client = await res.json();
      toast.success(mode === "create" ? "Cliente criado!" : "Cliente atualizado!");
      router.push(`/locacoes/clientes/${client.id}`);
    } catch {
      toast.error("Falha ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Novo Cliente" : "Editar Cliente"}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {mode === "create" ? "Criar Cliente" : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Informações do Cliente</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome Completo"
            value={form.nome_completo}
            onChange={(e) => setForm((f) => ({ ...f, nome_completo: e.target.value }))}
            placeholder="Nome completo do cliente"
            required
          />
          <Input
            label="CPF / CNPJ"
            value={form.cpf_cnpj}
            onChange={(e) => setForm((f) => ({ ...f, cpf_cnpj: e.target.value }))}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="email@exemplo.com"
            />
            <Input
              label="Telefone"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              placeholder="(41) 99999-9999"
            />
          </div>
          <Input
            label="Endereço"
            value={form.endereco}
            onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
            placeholder="Endereço completo"
          />
        </CardContent>
      </Card>
    </form>
  );
}
