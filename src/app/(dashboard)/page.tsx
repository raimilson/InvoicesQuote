"use client";

import Link from "next/link";
import { FileText, Tent } from "lucide-react";

const apps = [
  {
    name: "Kezpo Solutions",
    description: "Invoices, Quotes & Logistics",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "Kezpo Locações",
    description: "Orçamentos, Pedidos & Contratos de Locação",
    href: "/locacoes",
    icon: Tent,
  },
];

export default function AppSelectorPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao Kezpo</h1>
          <p className="text-gray-500 mt-2">Selecione o sistema que deseja acessar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {apps.map((app) => (
            <Link key={app.href} href={app.href}>
              <div className="group bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col items-center gap-4 cursor-pointer transition-all hover:shadow-lg hover:border-[#2AABE2] hover:-translate-y-1">
                <div className="p-4 rounded-xl bg-[#2AABE2]/10 group-hover:bg-[#2AABE2]/20 transition-colors">
                  <app.icon className="h-10 w-10 text-[#2AABE2]" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#2AABE2] transition-colors">
                    {app.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
