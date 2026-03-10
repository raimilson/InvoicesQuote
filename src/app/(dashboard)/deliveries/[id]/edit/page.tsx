"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DeliveryNoticeForm from "@/components/DeliveryNoticeForm";

export default function EditDeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const [delivery, setDelivery] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/deliveries/${id}`).then((r) => r.json()).then(setDelivery);
  }, [id]);

  if (!delivery) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  return <DeliveryNoticeForm mode="edit" initialData={delivery} />;
}
