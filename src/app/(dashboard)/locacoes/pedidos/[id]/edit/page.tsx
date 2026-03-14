"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RentalOrderForm from "@/components/locacoes/RentalOrderForm";

export default function EditPedidoPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/locacoes/pedidos/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!order) return <p className="text-gray-500">Pedido nao encontrado.</p>;

  return <RentalOrderForm mode="edit" initialData={order} />;
}
