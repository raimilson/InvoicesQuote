"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Upload, X } from "lucide-react";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    image_url?: string | null;
    active: boolean;
  };
}

export default function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ? String(initialData.price) : "",
    image_url: initialData?.image_url ?? "",
    active: initialData?.active ?? true,
  });

  const [preview, setPreview] = useState<string>(initialData?.image_url ?? "");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/locacoes/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm((f) => ({ ...f, image_url: data.url }));
      setPreview(data.url);
      toast.success("Imagem enviada");
    } catch {
      toast.error("Falha ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, image_url: "" }));
    setPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    setLoading(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price) || 0,
      image_url: form.image_url || null,
      active: form.active,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/locacoes/produtos" : `/api/locacoes/produtos/${initialData!.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const product = await res.json();
      toast.success(mode === "create" ? "Produto criado!" : "Produto atualizado!");
      router.push(`/locacoes/produtos/${product.id}`);
    } catch {
      toast.error("Falha ao salvar produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === "create" ? "Novo Produto" : "Editar Produto"}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {mode === "create" ? "Criar Produto" : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Informações do Produto</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nome do produto"
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AABE2] focus:border-transparent"
              rows={3}
              placeholder="Descrição do produto..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="0.00"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Imagem</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="h-40 w-40 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2AABE2] transition-colors">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-500 mt-2">
                {uploading ? "Enviando..." : "Clique para enviar"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-[#2AABE2] focus:ring-[#2AABE2]"
            />
            <span className="text-sm font-medium text-gray-700">Produto ativo</span>
          </label>
        </CardContent>
      </Card>
    </form>
  );
}
