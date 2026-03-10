"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ContractForm from "@/components/ContractForm";

export default function EditContractPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/contracts/${id}`).then((r) => r.json()).then(setContract);
  }, [id]);

  if (!contract) return <div className="animate-pulse h-96 bg-white rounded-xl border" />;
  return <ContractForm mode="edit" initialData={contract} />;
}
