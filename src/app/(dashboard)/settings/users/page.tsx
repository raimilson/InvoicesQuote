"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Shield, User } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin — full access + user management" },
  { value: "MEMBER", label: "Member — standard access" },
];

const EMPTY = { name: "", email: "", password: "", role: "MEMBER" };

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else toast.error(data.error ?? "Failed to load users");
      });

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }
    if (!editing && !form.password) {
      toast.error("Password is required for new users");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/users/${editing.id}` : "/api/users";
      const body: any = { name: form.name, email: form.email, role: form.role };
      if (form.password) body.password = form.password;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save");
        return;
      }
      toast.success(editing ? "User updated!" : "User created!");
      closeModal();
      load();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const del = async (u: any) => {
    if (!confirm(`Delete user "${u.name}"? They will no longer be able to log in.`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to delete");
      return;
    }
    toast.success("User deleted");
    load();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage who can access this application.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No users found.</p>
        </div>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {u.role === "ADMIN" ? (
                    <Shield className="h-4 w-4 text-[#2AABE2]" />
                  ) : (
                    <User className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === "ADMIN"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {u.role === "ADMIN" ? "Admin" : "Member"}
                </span>
                <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => del(u)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">{editing ? "Edit User" : "New User"}</h2>
            <div className="space-y-3">
              <Input
                label="Full Name *"
                value={form.name}
                onChange={setF("name")}
                placeholder="Jane Smith"
              />
              <Input
                label="Email *"
                value={form.email}
                onChange={setF("email")}
                placeholder="jane@kezpo.ca"
                type="email"
              />
              <Input
                label={editing ? "New Password (leave blank to keep current)" : "Password *"}
                value={form.password}
                onChange={setF("password")}
                placeholder="••••••••"
                type="password"
              />
              <Select
                label="Role"
                value={form.role}
                onChange={setF("role")}
                options={ROLE_OPTIONS}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={save} loading={saving}>
                {editing ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
