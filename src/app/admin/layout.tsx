"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  Receipt, 
  Package, 
  TrendingUp, 
  Sparkles, 
  Users, 
  Menu, 
  X,
  Bell
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Agenda", href: "/admin/agenda", icon: Calendar },
    { label: "Solicitações", href: "/admin/solicitacoes", icon: Clock, badge: 3 },
    { label: "Comanda", href: "/admin/comanda", icon: Receipt, highlight: true },
    { label: "Catálogo", href: "/admin/catalogo", icon: Package },
    { label: "Financeiro", href: "/admin/financeiro", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-charcoal-50 flex flex-col md:flex-row text-charcoal-800">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-charcoal-200/80 p-5 justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center space-x-2.5 px-2">
            <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-300 flex items-center justify-center text-rose-600 font-serif font-bold text-base">
              M
            </div>
            <div>
              <span className="font-serif text-base font-bold text-charcoal-800 tracking-tight">
                Maison de Beauté
              </span>
              <span className="block text-[10px] tracking-wider uppercase text-charcoal-400 font-medium">
                Gestão Proprietária
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-rose-50 text-rose-700 shadow-sm"
                      : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-rose-600" : "text-charcoal-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/admin/clientes"
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                pathname.startsWith("/admin/clientes")
                  ? "bg-rose-50 text-rose-700 shadow-sm"
                  : "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900"
              }`}
            >
              <Users className="w-4 h-4 text-charcoal-400" />
              <span>Clientes & Mensalistas</span>
            </Link>
          </nav>
        </div>

        {/* User Badge */}
        <div className="p-3 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs">
            AL
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-charcoal-800 truncate">Ana Luíza</h4>
            <span className="text-[10px] text-charcoal-400">Proprietária & Gestora</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden px-5 py-3.5 flex items-center justify-between bg-white border-b border-charcoal-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center text-xs font-serif font-bold">
              M
            </div>
            <span className="font-serif text-sm font-bold text-charcoal-800">
              Maison de Beauté
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/solicitacoes"
              className="relative p-2 rounded-full text-charcoal-500 hover:bg-charcoal-100"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation (Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-charcoal-200/80 py-2 px-3 safe-bottom z-30 shadow-bottomNav flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-luxury active:scale-95 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-rose-600 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive ? "text-rose-600 font-semibold" : "text-charcoal-400 hover:text-charcoal-700"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
