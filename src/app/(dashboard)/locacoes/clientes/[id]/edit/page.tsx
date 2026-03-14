"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RentalClientForm from "@/components/locacoes/RentalClientForm";

export default function EditRentalClientPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
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

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  if (!client) return <p className="text-gray-500">Cliente não encontrado.</p>;

  return <RentalClientForm mode="edit" initialData={client} />;
}
