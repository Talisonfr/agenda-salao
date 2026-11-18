"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { Appointment, AppointmentStatus } from "@/types/database";
import { NegotiationModal } from "@/components/admin/NegotiationModal";
import { supabase } from "@/lib/supabase/client";

export default function SolicitacoesPage() {
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "TODOS">("TODOS");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("*, customer:customers(*), items:appointment_items(*), professional:profiles(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar solicitações:", error);
      } else if (data) {
        const formatted: Appointment[] = data.map((item: any) => ({
          ...item,
          scheduled_date: item.requested_date || item.scheduled_date || "",
          scheduled_time: (item.requested_from || item.scheduled_time || "").slice(0, 5),
          total_amount: item.total_price ?? item.total_amount ?? 0,
          negotiation_notes: item.proposal_message || item.negotiation_notes || "",
          customer: item.customer
            ? {
                ...item.customer,
                full_name: item.customer.name || item.customer.full_name || "Cliente",
                phone: item.customer.whatsapp || item.customer.phone || "",
              }
            : undefined,
          items: item.items?.map((it: any) => ({
            ...it,
            service: {
              name: it.service_name || "Procedimento",
              price: it.price || 0,
            },
          })),
        }));
        setRequests(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenNegotiation = (app: Appointment) => {
    setSelectedAppointment(app);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus, notes?: string) => {
    try {
      const updatePayload: any = { status: newStatus };
      if (notes) {
        updatePayload.proposal_message = notes;
      }

      const { error } = await supabase
        .from("appointments")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus, negotiation_notes: notes || r.negotiation_notes } : r
        )
      );
    } catch (err: any) {
      console.error("Erro ao atualizar status:", err);
      alert(`Erro ao atualizar status: ${err.message || "Tente novamente"}`);
    }
  };

  const copyPublicLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/agendar` : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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
            Avalie, aprove ou envie contraproposta de horário com 1 clique pelo WhatsApp.
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

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400 bg-white rounded-3xl border border-charcoal-200/70">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Buscando solicitações no banco...</p>
        </div>
      ) : requests.length === 0 ? (
        /* Empty State */
        <div className="p-10 text-center bg-white rounded-3xl border border-charcoal-200/80 shadow-soft max-w-md mx-auto my-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-800">
              Tudo em dia! Nenhuma solicitação pendente
            </h3>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              Compartilhe o link do seu salão no Instagram e WhatsApp para que suas clientes solicitem horários com facilidade.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={copyPublicLink}
              className="py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-luxury transition-all"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Link de Agendamento</span>
                </>
              )}
            </button>

            <a
              href="/agendar"
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 border border-charcoal-200 hover:bg-charcoal-50 text-charcoal-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Página de Agendamento</span>
            </a>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-charcoal-200/80 text-charcoal-400">
          <p className="text-xs">Nenhuma solicitação encontrada neste filtro.</p>
        </div>
      ) : (
        /* Requests List */
        <div className="space-y-3">
          {filtered.map((req) => {
            const isPending = req.status === "PENDENTE_APROVACAO";
            const isNegotiating = req.status === "EM_NEGOCIACAO";
            const isConfirmed = req.status === "CONFIRMADO";
            const customerName = req.customer?.full_name || req.customer?.name || "Cliente";
            const customerPhone = req.customer?.phone || req.customer?.whatsapp || "";
            const servicesText = req.items && req.items.length > 0
              ? req.items.map((i) => i.service?.name || i.service_name).join(" + ")
              : "Procedimento";

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
                      Recebido em {new Date(req.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-charcoal-800">
                      {customerName}
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      WhatsApp: {formatPhone(customerPhone)}
                    </p>
                  </div>

                  {/* Procedures and Total */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-charcoal-600">
                    <span className="font-medium bg-charcoal-50 px-2.5 py-1 rounded-lg border border-charcoal-200/70">
                      {servicesText}
                    </span>
                    <span className="text-rose-600 font-bold tabular-nums">
                      {formatCurrency(req.total_amount || 0)}
                    </span>
                  </div>

                  {/* Date and Time Requested */}
                  <div className="flex items-center gap-4 text-xs text-charcoal-500 pt-1">
                    <div className="flex items-center gap-1 font-medium text-charcoal-700">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>{req.scheduled_date ? req.scheduled_date.split("-").reverse().join("/") : "Data a definir"}</span>
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
          })}
        </div>
      )}

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
