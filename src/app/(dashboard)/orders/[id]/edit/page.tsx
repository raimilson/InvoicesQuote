"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import OrderForm from "@/components/OrderForm";

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then(setOrder);
  }, [id]);

  if (!order) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  return <OrderForm mode="edit" initialData={order} />;
}
