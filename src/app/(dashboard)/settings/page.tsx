"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "BRL", label: "BRL — Brazilian Real" },
  { value: "EUR", label: "EUR — Euro" },
];

const EMPTY = {
  name: "", currency: "USD", account_number: "", institution_no: "",
  transit_no: "", swift_bic: "", bank_name: "", bank_address: "", is_default: false,
};

export default function SettingsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const load = () => fetch("/api/bank-templates").then((r) => r.json()).then(setTemplates);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ ...t }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name || !form.bank_name || !form.account_number) {
      toast.error("Name, bank name, and account number are required"); return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/bank-templates/${editing.id}` : "/api/bank-templates";
      await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success(editing ? "Updated!" : "Created!");
      closeModal();
      load();
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this bank template? Invoices using it will keep their current data.")) return;
    await fetch(`/api/bank-templates/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  };

  const setDefault = async (t: any) => {
    await fetch(`/api/bank-templates/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, is_default: true }),
    });
    toast.success("Set as default");
    load();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage bank templates used on invoices and quotes.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4" />Add Template</Button>
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No bank templates yet. Add one to get started.</p>
        </div>
      )}

      {templates.map((t) => (
        <Card key={t.id}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{t.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.currency}</span>
                {t.is_default && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="h-3 w-3" />Default
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {!t.is_default && (
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setDefault(t)}>
                    Set Default
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => del(t.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm grid grid-cols-2 gap-x-8 gap-y-2">
            <div><span className="text-gray-500">Bank:</span> {t.bank_name}</div>
            <div><span className="text-gray-500">Account:</span> {t.account_number}</div>
            {t.institution_no && <div><span className="text-gray-500">Institution #:</span> {t.institution_no}</div>}
            {t.transit_no && <div><span className="text-gray-500">Transit #:</span> {t.transit_no}</div>}
            {t.swift_bic && <div><span className="text-gray-500">SWIFT/BIC:</span> {t.swift_bic}</div>}
            <div className="col-span-2"><span className="text-gray-500">Address:</span> {t.bank_address}</div>
          </CardContent>
        </Card>
      ))}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">{editing ? "Edit Bank Template" : "New Bank Template"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Template Name *" value={form.name} onChange={setF("name")} placeholder="e.g. USD - Wise Canada" />
              </div>
              <Select
                label="Currency"
                value={form.currency}
                onChange={setF("currency")}
                options={CURRENCY_OPTIONS}
              />
              <Input label="Account Number *" value={form.account_number} onChange={setF("account_number")} />
              <Input label="Institution #" value={form.institution_no} onChange={setF("institution_no")} />
              <Input label="Transit #" value={form.transit_no} onChange={setF("transit_no")} />
              <Input label="SWIFT / BIC" value={form.swift_bic} onChange={setF("swift_bic")} />
              <Input label="Bank Name *" value={form.bank_name} onChange={setF("bank_name")} />
              <div className="col-span-2">
                <Input label="Bank Address" value={form.bank_address} onChange={setF("bank_address")} />
              </div>
              <label className="col-span-2 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm((f: any) => ({ ...f, is_default: e.target.checked }))}
                  className="w-4 h-4 accent-[#2AABE2]"
                />
                <span className="text-sm text-gray-700">Set as default bank template for new invoices</span>
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={save} loading={saving}>Save Template</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
