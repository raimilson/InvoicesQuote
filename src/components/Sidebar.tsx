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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/quotes", icon: ScrollText, label: "Quotes" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/settings/users", icon: Users, label: "Users" },
];

const logisticsItems = [
  { href: "/orders", icon: ClipboardCheck, label: "Orders" },
  { href: "/deliveries", icon: Truck, label: "Deliveries" },
  { href: "/packing-lists", icon: Package, label: "Packing Lists" },
  { href: "/contracts", icon: FileSignature, label: "Contracts" },
];

function NavLink({ href, icon: Icon, label }: (typeof navItems)[0]) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

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
        {navItems.slice(0, 3).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <div className="pt-3 pb-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Logistics</p>
        </div>
        {logisticsItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
        <div className="pt-3 pb-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</p>
        </div>
        {navItems.slice(3).map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
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
