"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PackingListForm from "@/components/PackingListForm";

export default function EditPackingListPage() {
  const { id } = useParams<{ id: string }>();
  const [pl, setPl] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/packing-lists/${id}`).then((r) => r.json()).then(setPl);
  }, [id]);

  if (!pl) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  return <PackingListForm mode="edit" initialData={pl} />;
}
