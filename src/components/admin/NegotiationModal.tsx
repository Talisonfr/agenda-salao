"use client";

import React, { useState } from "react";
import { 
  X, 
  Check, 
  MessageCircle, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Trash2,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { formatCurrency, formatPhone, buildWhatsAppNegotiationLink } from "@/lib/utils";
import { Appointment } from "@/types/database";

interface NegotiationModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: Appointment["status"], notes?: string) => void;
}

export function NegotiationModal({
  appointment,
  isOpen,
  onClose,
  onStatusChange,
}: NegotiationModalProps) {
  const [activeTab, setActiveTab] = useState<"DETAILS" | "COUNTER_OFFER" | "REJECT">("DETAILS");
  const [proposals, setProposals] = useState<string[]>([
    "Quinta-feira às 15:00 com Camila",
    "Sexta-feira às 10:30 com Camila",
  ]);
  const [newProposalInput, setNewProposalInput] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");

  if (!isOpen || !appointment) return null;

  const customerName = appointment.customer?.full_name || appointment.customer?.name || "Cliente";
  const customerPhone = appointment.customer?.phone || appointment.customer?.whatsapp || "";
  const servicesList = appointment.items?.map((i) => i.service?.name || i.service_name || "Serviço") || [
    "Corte & Styling",
  ];
  const requestedDate = appointment.scheduled_date || appointment.requested_date || "";
  const requestedTime = appointment.scheduled_time || appointment.requested_from || "";
  const totalAmount = appointment.total_amount ?? appointment.total_price ?? 0;

  const handleAddProposal = () => {
    if (newProposalInput.trim()) {
      setProposals([...proposals, newProposalInput.trim()]);
      setNewProposalInput("");
    }
  };

  const handleRemoveProposal = (index: number) => {
    setProposals(proposals.filter((_, i) => i !== index));
  };

  const handleApprove = () => {
    onStatusChange(appointment.id, "CONFIRMADO");
    onClose();
  };

  const handleSendCounterOffer = () => {
    if (proposals.length === 0) {
      alert("Adicione pelo menos uma sugestão de horário para a contraproposta.");
      return;
    }

    const waLink = buildWhatsAppNegotiationLink({
      phone: customerPhone,
      customerName,
      serviceNames: servicesList,
      requestedDate,
      requestedTime,
      proposals,
    });

    // Abre o WhatsApp para envio direto da contraproposta
    window.open(waLink, "_blank");

    // Atualiza status do agendamento para EM_NEGOCIACAO
    const notes = `Contraproposta enviada:\n${proposals.join(" | ")}`;
    onStatusChange(appointment.id, "EM_NEGOCIACAO", notes);
    onClose();
  };

  const handleReject = () => {
    onStatusChange(appointment.id, "RECUSADO", rejectionReason || "Sem disponibilidade de agenda");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-luxury border border-charcoal-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-charcoal-200/80 flex items-center justify-between bg-charcoal-50/50">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">
              Triagem de Horário
            </span>
            <h3 className="font-serif text-lg font-bold text-charcoal-800">
              Solicitação de {customerName.split(" ")[0]}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-charcoal-100 hover:bg-charcoal-200 flex items-center justify-center text-charcoal-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-charcoal-200/80 bg-charcoal-50/30 text-xs font-medium">
          <button
            onClick={() => setActiveTab("DETAILS")}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === "DETAILS"
                ? "border-rose-500 text-rose-600 font-semibold"
                : "border-transparent text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            Detalhes do Pedido
          </button>
          <button
            onClick={() => setActiveTab("COUNTER_OFFER")}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === "COUNTER_OFFER"
                ? "border-rose-500 text-rose-600 font-semibold"
                : "border-transparent text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            Propor Novo Horário
          </button>
          <button
            onClick={() => setActiveTab("REJECT")}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === "REJECT"
                ? "border-rose-500 text-rose-600 font-semibold"
                : "border-transparent text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            Recusar / Espera
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === "DETAILS" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-500">Cliente:</span>
                  <span className="font-semibold text-charcoal-800">{customerName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-500">WhatsApp:</span>
                  <span className="font-semibold text-charcoal-800 tabular-nums">
                    {formatPhone(customerPhone)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-500">Data Solicitada:</span>
                  <span className="font-semibold text-charcoal-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    {requestedDate}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-500">Horário Solicitado:</span>
                  <span className="font-semibold text-charcoal-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {requestedTime} ({appointment.duration_minutes} min)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-charcoal-200">
                  <span className="text-charcoal-500">Valor Total Estimado:</span>
                  <span className="font-bold text-rose-600 text-sm tabular-nums">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
                  Serviços Solicitados
                </h4>
                <div className="space-y-1.5">
                  {servicesList.map((srv, idx) => (
                    <div
                      key={idx}
                      className="px-3.5 py-2 rounded-xl bg-white border border-charcoal-200 text-xs text-charcoal-800 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "COUNTER_OFFER" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Defina 1 ou mais opções de remanejamento. Ao clicar em enviar, o WhatsApp abrirá com uma mensagem pré-formatada e o status mudará para <strong>Em Negociação</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-2">
                  Opções de Horário Sugeridas
                </label>
                <div className="space-y-2 mb-3">
                  {proposals.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs text-charcoal-800"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemoveProposal(index)}
                        className="text-charcoal-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Sexta-feira às 14:00"
                    value={newProposalInput}
                    onChange={(e) => setNewProposalInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-rose-300 focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleAddProposal()}
                  />
                  <button
                    type="button"
                    onClick={handleAddProposal}
                    className="px-3 py-2 bg-charcoal-800 text-white rounded-xl text-xs font-medium hover:bg-charcoal-900 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "REJECT" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  A recusa manterá o registro no histórico da cliente e permitirá oferecer lista de espera caso abra vaga.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                  Motivo da Recusa / Observação
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Agenda completamente lotada no fim de semana."
                  className="w-full p-3 rounded-xl border border-charcoal-200 text-xs focus:ring-2 focus:ring-rose-300 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-charcoal-200/80 bg-white safe-bottom flex gap-3">
          {activeTab === "DETAILS" && (
            <>
              <button
                onClick={() => setActiveTab("COUNTER_OFFER")}
                className="flex-1 py-3 px-4 rounded-xl border border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-rose-600" />
                <span>Propor Outro Horário</span>
              </button>

              <button
                onClick={handleApprove}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Aprovar Horário</span>
              </button>
            </>
          )}

          {activeTab === "COUNTER_OFFER" && (
            <button
              onClick={handleSendCounterOffer}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Proposta no WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </button>
          )}

          {activeTab === "REJECT" && (
            <button
              onClick={handleReject}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-sm"
            >
              Confirmar Recusa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
