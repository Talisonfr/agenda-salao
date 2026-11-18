"use client";

import React, { useState } from "react";
import { 
  Clock, 
  Calendar, 
  User, 
  MessageCircle, 
  Check, 
  X, 
  Sparkles, 
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { Appointment, AppointmentStatus } from "@/types/database";
import { NegotiationModal } from "@/components/admin/NegotiationModal";

const INITIAL_REQUESTS: Appointment[] = [
  {
    id: "req-1",
    customer_id: "c1",
    customer: { id: "c1", full_name: "Isabela Fonseca", phone: "11998765432", created_at: "" },
    scheduled_date: "2026-11-20",
    scheduled_time: "14:00",
    duration_minutes: 50,
    status: "PENDENTE_APROVACAO",
    total_amount: 120,
    items: [
      { id: "i1", appointment_id: "req-1", item_type: "SERVICE", service: { id: "s1", name: "Corte & Styling Personalizado", category: "CABELO", price: 120, duration_minutes: 50, commission_pct: 40, commission_percentage: 40, active: true, created_at: "" }, quantity: 1, unit_price: 120, professional_commission_amount: 48 }
    ],
    created_at: "2026-11-17T18:30:00Z",
    updated_at: "2026-11-17T18:30:00Z",
  },
  {
    id: "req-2",
    customer_id: "c2",
    customer: { id: "c2", full_name: "Renata Guimarães", phone: "11987654321", created_at: "" },
    scheduled_date: "2026-11-21",
    scheduled_time: "16:00",
    duration_minutes: 105,
    status: "PENDENTE_APROVACAO",
    total_amount: 270,
    items: [
      { id: "i2", appointment_id: "req-2", item_type: "SERVICE", service: { id: "s2", name: "Escova Modelada & Nutrição", category: "CABELO", price: 90, duration_minutes: 45, commission_pct: 40, commission_percentage: 40, active: true, created_at: "" }, quantity: 1, unit_price: 90, professional_commission_amount: 36 },
      { id: "i3", appointment_id: "req-2", item_type: "SERVICE", service: { id: "s4", name: "Alongamento em Gel Premium", category: "UNHAS", price: 180, duration_minutes: 90, commission_pct: 50, commission_percentage: 50, active: true, created_at: "" }, quantity: 1, unit_price: 180, professional_commission_amount: 90 }
    ],
    created_at: "2026-11-17T19:15:00Z",
    updated_at: "2026-11-17T19:15:00Z",
  },
  {
    id: "req-3",
    customer_id: "c3",
    customer: { id: "c3", full_name: "Carolina Meireles", phone: "11976543210", created_at: "" },
    scheduled_date: "2026-11-22",
    scheduled_time: "10:00",
    duration_minutes: 60,
    status: "EM_NEGOCIACAO",
    negotiation_notes: "Sugerido quinta 15h ou sexta 10h via WhatsApp.",
    total_amount: 75,
    items: [
      { id: "i4", appointment_id: "req-3", item_type: "SERVICE", service: { id: "s3", name: "Manicure & Pedicure Completa", category: "UNHAS", price: 75, duration_minutes: 60, commission_pct: 50, commission_percentage: 50, active: true, created_at: "" }, quantity: 1, unit_price: 75, professional_commission_amount: 37.5 }
    ],
    created_at: "2026-11-17T17:00:00Z",
    updated_at: "2026-11-17T17:20:00Z",
  },
];

export default function SolicitacoesPage() {
  const [requests, setRequests] = useState<Appointment[]>(INITIAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "TODOS">("TODOS");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNegotiation = (app: Appointment) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: AppointmentStatus, notes?: string) => {
    setRequests(
      requests.map((r) =>
        r.id === id ? { ...r, status: newStatus, negotiation_notes: notes || r.negotiation_notes } : r
      )
    );
  };

  const filtered = filterStatus === "TODOS"
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Triagem Inteligente
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Solicitações de Agendamento
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Avalie, aprove ou faça contraproposta de horário via WhatsApp com 1 clique.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(["TODOS", "PENDENTE_APROVACAO", "EM_NEGOCIACAO", "CONFIRMADO"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-charcoal-600 border border-charcoal-200/80 hover:border-rose-300"
              }`}
            >
              {st === "TODOS"
                ? "Todas"
                : st === "PENDENTE_APROVACAO"
                ? "Pendentes"
                : st === "EM_NEGOCIACAO"
                ? "Em Negociação"
                : "Confirmadas"}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-charcoal-200/80 text-charcoal-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-serif text-base font-semibold text-charcoal-700">
              Tudo em dia!
            </h3>
            <p className="text-xs text-charcoal-400 mt-1">
              Nenhuma solicitação encontrada neste filtro.
            </p>
          </div>
        ) : (
          filtered.map((req) => {
            const isPending = req.status === "PENDENTE_APROVACAO";
            const isNegotiating = req.status === "EM_NEGOCIACAO";
            const isConfirmed = req.status === "CONFIRMADO";

            return (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft hover:shadow-luxury transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPending
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : isNegotiating
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {isPending ? "Pendente Aprovação" : isNegotiating ? "Em Negociação WhatsApp" : "Confirmado"}
                    </span>
                    <span className="text-[11px] text-charcoal-400">
                      Recebido hoje
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-charcoal-800">
                      {req.customer?.full_name}
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      WhatsApp: {formatPhone(req.customer?.phone || "")}
                    </p>
                  </div>

                  {/* Procedures and Total */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-charcoal-600">
                    <span className="font-medium bg-charcoal-50 px-2.5 py-1 rounded-lg border border-charcoal-200/70">
                      {req.items?.map((i) => i.service?.name).join(" + ")}
                    </span>
                    <span className="text-rose-600 font-bold tabular-nums">
                      {formatCurrency(req.total_amount)}
                    </span>
                  </div>

                  {/* Date and Time Requested */}
                  <div className="flex items-center gap-4 text-xs text-charcoal-500 pt-1">
                    <div className="flex items-center gap-1 font-medium text-charcoal-700">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>{req.scheduled_date}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-charcoal-700">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{req.scheduled_time} ({req.duration_minutes} min)</span>
                    </div>
                  </div>

                  {req.negotiation_notes && (
                    <div className="text-[11px] text-rose-700 bg-rose-50/70 p-2 rounded-xl border border-rose-200/70">
                      {req.negotiation_notes}
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenNegotiation(req)}
                    className="px-4 py-2.5 rounded-xl border border-charcoal-200 hover:border-rose-300 bg-white text-charcoal-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-soft"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Gerenciar / Negociar</span>
                  </button>

                  {isPending && (
                    <button
                      onClick={() => handleStatusChange(req.id, "CONFIRMADO")}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Negociação */}
      <NegotiationModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
