"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  ScrollText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  Truck,
  Package,
  FileSignature,
  ArrowLeft,
  UserCog,
} from "lucide-react";
import { useState } from "react";

const solutionsSalesItems = [
  { href: "/quotes", icon: ScrollText, label: "Quotes" },
  { href: "/orders", icon: ClipboardCheck, label: "Orders" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
];

const solutionsFulfillmentItems = [
  { href: "/deliveries", icon: Truck, label: "Deliveries" },
  { href: "/packing-lists", icon: Package, label: "Packing Lists" },
];

const solutionsAdminItems = [
  { href: "/contracts", icon: FileSignature, label: "Contracts" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/settings/users", icon: UserCog, label: "Users" },
];

const locacoesNavItems = [
  { href: "/locacoes", icon: LayoutDashboard, label: "Painel" },
  { href: "/locacoes/orcamentos", icon: ScrollText, label: "Orçamentos" },
  { href: "/locacoes/pedidos", icon: ClipboardCheck, label: "Pedidos" },
  { href: "/locacoes/produtos", icon: Package, label: "Produtos" },
  { href: "/locacoes/clientes", icon: Users, label: "Clientes" },
];

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && href !== "/locacoes" && pathname.startsWith(href))
    || (href === "/locacoes" && pathname === "/locacoes");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#2AABE2] text-white"
          : "text-gray-600 hover:bg-blue-50 hover:text-[#2AABE2]"
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isLocacoes = pathname.startsWith("/locacoes");

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-gray-100">
        <img
          src="/logo.png"
          alt="Kezpo"
          className="h-10 w-auto"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.style.display = "none";
            (t.nextSibling as HTMLElement).style.display = "block";
          }}
        />
        <span className="hidden text-xl font-bold text-[#2AABE2]">Kezpo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {isLocacoes ? (
          <>
            {locacoesNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                <span>Kezpo Solutions</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="pt-1 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sales</p>
            </div>
            {solutionsSalesItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            <div className="pt-3 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fulfillment</p>
            </div>
            {solutionsFulfillmentItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
            <div className="pt-3 pb-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
            </div>
            {solutionsAdminItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen fixed top-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow border border-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed top-0 left-0 w-56 h-full bg-white z-50 shadow-xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
