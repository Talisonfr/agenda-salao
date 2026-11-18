"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Scissors, 
  Receipt,
  Sparkles,
  Filter
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CheckoutModal } from "@/components/admin/CheckoutModal";
import { supabase } from "@/lib/supabase/client";

interface AgendaSlot {
  id: string;
  time: string;
  customerName: string;
  customerId?: string;
  professionalName: string;
  services: string[];
  durationMinutes: number;
  price: number;
  status: "CONFIRMADO" | "EM_ANDAMENTO" | "CONCLUIDO";
  itemsRaw?: any[];
}

export default function AgendaPage() {
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("TODAS");
  const [professionalsList, setProfessionalsList] = useState<string[]>([]);
  
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeCheckoutSlot, setActiveCheckoutSlot] = useState<AgendaSlot | null>(null);

  const loadAgenda = async (dateStr: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("*, customer:customers(*), items:appointment_items(*), professional:profiles(*)")
        .eq("requested_date", dateStr)
        .in("status", ["CONFIRMADO", "EM_ANDAMENTO", "CONCLUIDO"])
        .order("requested_from", { ascending: true });

      if (error) {
        console.error("Erro ao carregar agenda:", error);
      } else if (data) {
        const formatted: AgendaSlot[] = data.map((item: any) => {
          const custName = item.customer?.name || item.customer?.full_name || "Cliente Balcão";
          const profName = item.professional?.full_name || "Equipe do Salão";
          const serviceNames = item.items && item.items.length > 0
            ? item.items.map((it: any) => it.service_name || "Procedimento")
            : ["Atendimento"];

          return {
            id: item.id,
            customerId: item.customer_id,
            time: (item.requested_from || "09:00").slice(0, 5),
            customerName: custName,
            professionalName: profName,
            services: serviceNames,
            durationMinutes: item.duration_minutes || 45,
            price: item.total_price || 0,
            status: item.status,
            itemsRaw: item.items,
          };
        });
        setSlots(formatted);

        // Extrai nomes únicos de profissionais
        const profs = Array.from(new Set(formatted.map((s) => s.professionalName)));
        setProfessionalsList(profs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgenda(selectedDate);
  }, [selectedDate]);

  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate + "T12:00:00");
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  };

  const handleOpenCheckout = (slot: AgendaSlot) => {
    setActiveCheckoutSlot(slot);
    setCheckoutModalOpen(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: AgendaSlot["status"]) => {
    const nextStatus = currentStatus === "CONFIRMADO" ? "EM_ANDAMENTO" : "CONCLUIDO";
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;

      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
      );
    } catch (err: any) {
      console.error("Erro ao alterar status:", err);
      alert(`Não foi possível atualizar status: ${err.message}`);
    }
  };

  const filteredSlots = selectedProfessional === "TODAS"
    ? slots
    : slots.filter((s) => s.professionalName === selectedProfessional);

  const formattedDateTitle = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Grade Operacional
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Agenda do Dia
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5 capitalize">
            {formattedDateTitle}
          </p>
        </div>

        {/* Date Selector & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-charcoal-200/80 rounded-xl p-1 shadow-soft">
            <button
              onClick={() => changeDateByDays(-1)}
              title="Dia anterior"
              className="p-1.5 hover:bg-charcoal-50 rounded-lg text-charcoal-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-0.5 text-xs font-semibold text-charcoal-700 bg-transparent border-none focus:outline-none"
            />
            <button
              onClick={() => changeDateByDays(1)}
              title="Próximo dia"
              className="p-1.5 hover:bg-charcoal-50 rounded-lg text-charcoal-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setActiveCheckoutSlot(null);
              setCheckoutModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-luxury"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Encaixe / Venda Rápida</span>
          </button>
        </div>
      </div>

      {/* Filter by Professional (se houver mais de 1) */}
      {professionalsList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["TODAS", ...professionalsList].map((prof) => (
            <button
              key={prof}
              onClick={() => setSelectedProfessional(prof)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedProfessional === prof
                  ? "bg-charcoal-800 text-white shadow-sm"
                  : "bg-white text-charcoal-600 border border-charcoal-200/80 hover:border-rose-300"
              }`}
            >
              {prof === "TODAS" ? "Todas as Profissionais" : prof}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400 bg-white rounded-3xl border border-charcoal-200/70">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Carregando horários agendados...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        /* Empty Day State */
        <div className="p-10 text-center bg-white rounded-3xl border border-charcoal-200/80 shadow-soft max-w-md mx-auto my-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-800">
              Agenda Livre para este Dia
            </h3>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              Nenhum atendimento confirmado para {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR")}. Você pode aprovar solicitações pendentes ou registrar um encaixe de balcão imediato.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveCheckoutSlot(null);
              setCheckoutModalOpen(true);
            }}
            className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-luxury transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Atendimento / Encaixe</span>
          </button>
        </div>
      ) : (
        /* Time Slots Timeline */
        <div className="space-y-3">
          {filteredSlots.map((slot) => {
            const isDone = slot.status === "CONCLUIDO";
            const inProgress = slot.status === "EM_ANDAMENTO";

            return (
              <div
                key={slot.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-charcoal-50/70 border-charcoal-200 text-charcoal-500"
                    : inProgress
                    ? "bg-rose-50/50 border-rose-300 shadow-soft"
                    : "bg-white border-charcoal-200/80 shadow-soft"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Time Indicator */}
                  <div className="w-14 text-center shrink-0">
                    <div className="text-base font-bold text-charcoal-800 tabular-nums">
                      {slot.time}
                    </div>
                    <div className="text-[10px] text-charcoal-400">
                      {slot.durationMinutes} min
                    </div>
                  </div>

                  <div className="w-px h-10 bg-charcoal-200 hidden sm:block" />

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-bold text-charcoal-800">
                        {slot.customerName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isDone
                            ? "bg-charcoal-200 text-charcoal-700"
                            : inProgress
                            ? "bg-rose-500 text-white animate-pulse"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isDone ? "Concluído" : inProgress ? "Em Atendimento" : "Confirmado"}
                      </span>
                    </div>

                    <div className="text-xs text-charcoal-600 flex items-center gap-2">
                      <span className="font-medium text-rose-700">
                        {slot.services.join(", ")}
                      </span>
                      <span>•</span>
                      <span className="text-charcoal-400">{slot.professionalName}</span>
                    </div>
                  </div>
                </div>

                {/* Price and Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-charcoal-100">
                  <span className="font-bold text-charcoal-800 text-sm tabular-nums">
                    {formatCurrency(slot.price)}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isDone && (
                      <button
                        onClick={() => handleToggleStatus(slot.id, slot.status)}
                        className="px-3 py-1.5 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-semibold hover:bg-charcoal-100 transition-colors"
                      >
                        {inProgress ? "Concluir" : "Iniciar"}
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenCheckout(slot)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{isDone ? "Ver Comanda" : "Fechar Comanda"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        customerName={activeCheckoutSlot?.customerName || "Cliente Balcão"}
        customerId={activeCheckoutSlot?.customerId}
        appointmentId={activeCheckoutSlot?.id}
        initialServices={
          activeCheckoutSlot && activeCheckoutSlot.itemsRaw && activeCheckoutSlot.itemsRaw.length > 0
            ? activeCheckoutSlot.itemsRaw.map((it: any) => ({
                name: it.service_name || "Serviço",
                price: it.price || 0,
                commissionRate: it.commission_pct || 40,
                serviceId: it.service_id,
              }))
            : activeCheckoutSlot
            ? [{ name: activeCheckoutSlot.services[0] || "Procedimento", price: activeCheckoutSlot.price, commissionRate: 40 }]
            : []
        }
        onFinishCheckout={() => {
          loadAgenda(selectedDate);
        }}
      />
    </div>
  );
}
