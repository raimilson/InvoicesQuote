"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "", address: "", phone: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then((r) => r.json()).then((c) => {
      setForm({
        name: c.name ?? "",
        company: c.company ?? "",
        address: c.address ?? "",
        phone: c.phone ?? "",
        email: c.email ?? "",
        notes: c.notes ?? "",
      });
    });
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Client updated!");
      router.push(`/clients/${id}`);
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Client</h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Changes</Button>
        </div>
      </div>
      <Card>
        <CardHeader><h2 className="font-semibold">Client Information</h2></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Contact Name *" value={form.name} onChange={set("name")} required />
          <Input label="Company" value={form.company} onChange={set("company")} />
          <Input label="Address" value={form.address} onChange={set("address")} />
          <Input label="Phone" value={form.phone} onChange={set("phone")} />
          <Input label="Email" type="email" value={form.email} onChange={set("email")} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2AABE2]"
              rows={3}
              value={form.notes}
              onChange={set("notes")}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
