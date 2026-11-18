"use client";

import React, { useState } from "react";
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

interface AgendaSlot {
  id: string;
  time: string;
  customerName: string;
  professionalName: string;
  services: string[];
  durationMinutes: number;
  price: number;
  status: "CONFIRMADO" | "EM_ANDAMENTO" | "CONCLUIDO";
}

const INITIAL_SLOTS: AgendaSlot[] = [
  { id: "sl1", time: "09:00", customerName: "Helena Castro", professionalName: "Camila Rocha", services: ["Corte & Styling"], durationMinutes: 50, price: 120, status: "CONCLUIDO" },
  { id: "sl2", time: "10:30", customerName: "Tatiane Ribeiro", professionalName: "Juliana Mendes", services: ["Alongamento em Gel"], durationMinutes: 90, price: 180, status: "EM_ANDAMENTO" },
  { id: "sl3", time: "13:30", customerName: "Fernanda Lopes", professionalName: "Camila Rocha", services: ["Escova Modelada & Nutrição"], durationMinutes: 45, price: 90, status: "CONFIRMADO" },
  { id: "sl4", time: "15:00", customerName: "Gabriela Duarte", professionalName: "Beatriz Lima", services: ["Limpeza de Pele Profunda"], durationMinutes: 75, price: 160, status: "CONFIRMADO" },
];

export default function AgendaPage() {
  const [slots, setSlots] = useState<AgendaSlot[]>(INITIAL_SLOTS);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("TODAS");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [activeCheckoutSlot, setActiveCheckoutSlot] = useState<AgendaSlot | null>(null);

  const handleOpenCheckout = (slot: AgendaSlot) => {
    setActiveCheckoutSlot(slot);
    setCheckoutModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setSlots(
      slots.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "CONFIRMADO" ? "EM_ANDAMENTO" : "CONCLUIDO";
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const filteredSlots = selectedProfessional === "TODAS"
    ? slots
    : slots.filter((s) => s.professionalName === selectedProfessional);

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
          <p className="text-xs text-charcoal-500 mt-0.5">
            Quarta-feira, 20 de Novembro de 2026
          </p>
        </div>

        {/* Date Selector & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-charcoal-200/80 rounded-xl p-1 shadow-soft">
            <button className="p-1.5 hover:bg-charcoal-50 rounded-lg text-charcoal-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-charcoal-700">Hoje</span>
            <button className="p-1.5 hover:bg-charcoal-50 rounded-lg text-charcoal-500">
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

      {/* Filter by Professional */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["TODAS", "Camila Rocha", "Juliana Mendes", "Beatriz Lima"].map((prof) => (
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

      {/* Time Slots Timeline */}
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
                      onClick={() => handleToggleStatus(slot.id)}
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
                    <span>Fechar Comanda</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        customerName={activeCheckoutSlot?.customerName || "Cliente Balcão"}
        initialServices={
          activeCheckoutSlot
            ? [{ name: activeCheckoutSlot.services[0], price: activeCheckoutSlot.price, commissionRate: 40 }]
            : [{ name: "Serviço Balcão", price: 80, commissionRate: 40 }]
        }
        onFinishCheckout={(data) => {
          if (activeCheckoutSlot) {
            setSlots(
              slots.map((s) =>
                s.id === activeCheckoutSlot.id ? { ...s, status: "CONCLUIDO" } : s
              )
            );
          }
        }}
      />
    </div>
  );
}
