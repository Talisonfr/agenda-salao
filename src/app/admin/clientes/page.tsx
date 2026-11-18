"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  FileText, 
  Sparkles, 
  MessageCircle,
  Clock
} from "lucide-react";
import { formatCurrency, formatPhone, buildWhatsAppReminderLink } from "@/lib/utils";
import { Customer, MonthlyPlan } from "@/types/database";

const CUSTOMERS_DATA: (Customer & { monthlyPlan?: MonthlyPlan })[] = [
  {
    id: "c1",
    full_name: "Mariana Albuquerque",
    phone: "11988887777",
    birth_date: "1992-05-14",
    notes: "Fórmula de mechas: 9.1 + 8.31 com oxidante 20 vol. Cabelo com sensibilidade térmica no couro cabeludo.",
    created_at: "2026-01-10",
    monthlyPlan: {
      id: "mp1",
      customer_id: "c1",
      name: "Pacote 4 Escovas / Mês",
      monthly_fee: 320,
      due_day: 10,
      total_sessions: 4,
      used_sessions: 3,
      status: "PAGO",
      created_at: "",
    },
  },
  {
    id: "c2",
    full_name: "Luciana Vasconcelos",
    phone: "11977776666",
    birth_date: "1988-11-22",
    notes: "Alergia a esmaltes com tolueno. Utilizar exclusivamente linha hipoalergênica. Prefere corte bordado.",
    created_at: "2026-03-15",
    monthlyPlan: {
      id: "mp2",
      customer_id: "c2",
      name: "Pé e Mão Semanal VIP",
      monthly_fee: 280,
      due_day: 15,
      total_sessions: 4,
      used_sessions: 2,
      status: "PENDENTE",
      created_at: "",
    },
  },
  {
    id: "c3",
    full_name: "Patrícia Diniz",
    phone: "11966665555",
    birth_date: "1995-08-30",
    notes: "Transição capilar. Foco em nutrição lipídica e umectação com óleo vegetal.",
    created_at: "2026-05-20",
    monthlyPlan: {
      id: "mp3",
      customer_id: "c3",
      name: "Cronograma Capilar Completo",
      monthly_fee: 450,
      due_day: 5,
      total_sessions: 4,
      used_sessions: 4,
      status: "ATRASADO",
      created_at: "",
    },
  },
];

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = CUSTOMERS_DATA.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Relacionamento & Fidelização
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Ficha de Clientes & Mensalistas
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Histórico técnico, fichas de procedimentos químicos e controle de recorrência.
          </p>
        </div>

        <button className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-luxury">
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm w-full">
        <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Buscar cliente por nome ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-charcoal-200/80 bg-white text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft hover:shadow-luxury transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal-800">
                    {customer.full_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatPhone(customer.phone)}</span>
                  </div>
                </div>

                {customer.monthlyPlan && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    Mensalista VIP
                  </span>
                )}
              </div>

              {/* Technical Notes / Allergies / Formulas */}
              {customer.notes && (
                <div className="mt-3 p-3 rounded-2xl bg-charcoal-50 border border-charcoal-200/60 text-xs text-charcoal-700">
                  <div className="flex items-center gap-1 font-semibold text-rose-700 text-[11px] mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ficha Técnica & Alergias:</span>
                  </div>
                  <p className="leading-relaxed line-clamp-3">{customer.notes}</p>
                </div>
              )}

              {/* Mensalista Details */}
              {customer.monthlyPlan && (
                <div className="mt-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-200/60 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-800">{customer.monthlyPlan.name}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        customer.monthlyPlan.status === "PAGO"
                          ? "bg-emerald-100 text-emerald-800"
                          : customer.monthlyPlan.status === "PENDENTE"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {customer.monthlyPlan.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-charcoal-500 flex justify-between pt-1">
                    <span>Sessões do Mês:</span>
                    <strong>{customer.monthlyPlan.used_sessions} de {customer.monthlyPlan.total_sessions} usadas</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between text-xs">
              <a
                href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-800"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Conversar</span>
              </a>

              <button className="text-charcoal-600 hover:text-charcoal-900 font-semibold">
                Ver Histórico Completo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
