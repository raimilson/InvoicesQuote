"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  active: boolean;
  created_at: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/locacoes/produtos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este produto?")) return;
    try {
      const res = await fetch(`/api/locacoes/produtos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Produto excluído");
      router.push("/locacoes/produtos");
    } catch {
      toast.error("Falha ao excluir produto");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!product) return <p className="text-gray-500">Produto não encontrado.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">
              {product.active ? "Produto ativo" : "Produto inativo"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/locacoes/produtos/${id}/edit`}>
            <Button size="sm"><Edit className="h-4 w-4" />Editar</Button>
          </Link>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {product.image_url && (
          <Card>
            <CardContent className="p-0">
              <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover rounded-xl" />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader><h2 className="font-semibold">Detalhes</h2></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div><span className="text-gray-500">Nome</span><p className="font-medium">{product.name}</p></div>
            {product.description && (<div><span className="text-gray-500">Descrição</span><p className="text-gray-700">{product.description}</p></div>)}
            <div>
              <span className="text-gray-500">Preço</span>
              <p className="text-xl font-bold text-[#2AABE2]">R$ {Number(product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <span className="text-gray-500">Status</span>
              <p><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${product.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{product.active ? "Ativo" : "Inativo"}</span></p>
            </div>
            <div><span className="text-gray-500">Cadastrado em</span><p className="text-gray-700">{new Date(product.created_at).toLocaleDateString("pt-BR")}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
