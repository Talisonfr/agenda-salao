"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  Clock, 
  Check, 
  Calendar as CalendarIcon, 
  User, 
  Phone, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { Service, ServiceCategory } from "@/types/database";

// Catálogo inicial mockado de serviços boutique para agendamento instantâneo
const AVAILABLE_SERVICES: Service[] = [
  { id: "1", name: "Corte & Styling Personalizado", category: "CABELO", price: 120, duration_minutes: 50, commission_pct: 40, commission_percentage: 40, active: true, created_at: "" },
  { id: "2", name: "Escova Modelada & Nutrição", category: "CABELO", price: 90, duration_minutes: 45, commission_pct: 40, commission_percentage: 40, active: true, created_at: "" },
  { id: "3", name: "Manicure & Pedicure Completa", category: "UNHAS", price: 75, duration_minutes: 60, commission_pct: 50, commission_percentage: 50, active: true, created_at: "" },
  { id: "4", name: "Alongamento em Gel Premium", category: "UNHAS", price: 180, duration_minutes: 90, commission_pct: 50, commission_percentage: 50, active: true, created_at: "" },
  { id: "5", name: "Design de Sobrancelha com Henna", category: "SOBRANCELHA", price: 65, duration_minutes: 35, commission_pct: 45, commission_percentage: 45, active: true, created_at: "" },
  { id: "6", name: "Limpeza de Pele Profunda", category: "ESTETICA", price: 160, duration_minutes: 75, commission_pct: 40, commission_percentage: 40, active: true, created_at: "" },
];

const PROFESSIONALS = [
  { id: "any", name: "Sem preferência (Primeira disponível)", role: "Atendimento Especial" },
  { id: "p1", name: "Camila Rocha", role: "Especialista em Mechas & Corte" },
  { id: "p2", name: "Juliana Mendes", role: "Nail Designer & Alongamentos" },
  { id: "p3", name: "Beatriz Lima", role: "Terapeuta Capilar & Estética" },
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30", "17:30"
];

const CATEGORIES: { label: string; value: ServiceCategory | "TODOS" }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Cabelos", value: "CABELO" },
  { label: "Unhas", value: "UNHAS" },
  { label: "Sobrancelhas", value: "SOBRANCELHA" },
  { label: "Estética", value: "ESTETICA" },
];

export default function AgendarPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "TODOS">("TODOS");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Serviços selecionados calculados
  const selectedServices = AVAILABLE_SERVICES.filter((s) => selectedServiceIds.includes(s.id));
  const totalAmount = selectedServices.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = selectedServices.reduce((acc, s) => acc + s.duration_minutes, 0);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 11) {
      setCustomerPhone(raw);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0 || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      alert("Por favor, preencha todos os campos para enviar sua solicitação.");
      return;
    }

    setIsSubmitting(true);
    // Simulação de envio com sucesso (integrado via Supabase em prod)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-charcoal-50 flex flex-col justify-center items-center px-6 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-luxury text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-charcoal-800 mb-2">
            Solicitação Enviada!
          </h2>

          <p className="text-sm text-charcoal-600 mb-6 leading-relaxed">
            Olá, <strong className="text-charcoal-800">{customerName.split(" ")[0]}</strong>! Sua solicitação para{" "}
            <strong>{selectedServices.map((s) => s.name).join(", ")}</strong> no dia{" "}
            <strong>{selectedDate}</strong> às <strong>{selectedTime}</strong> foi registrada com sucesso.
          </p>

          <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 text-xs text-rose-800 text-left mb-8 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600" /> Como funciona o próximo passo?
            </p>
            <p className="text-rose-700/90 leading-relaxed">
              Nossa equipe já está checando a grade de atendimentos. Você receberá uma confirmação ou sugestão de encaixe pelo WhatsApp{" "}
              <strong>{formatPhone(customerPhone)}</strong> em instantes!
            </p>
          </div>

          <Link
            href="/"
            className="w-full inline-block py-3.5 px-6 rounded-xl bg-charcoal-800 hover:bg-charcoal-900 text-white font-medium text-sm transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </main>
    );
  }

  const filteredServices = selectedCategory === "TODOS"
    ? AVAILABLE_SERVICES
    : AVAILABLE_SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <main className="min-h-screen bg-charcoal-50 pb-32">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-charcoal-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
        <span className="font-serif text-sm font-bold text-charcoal-800">
          Maison de Beauté
        </span>
        <div className="w-10"></div>
      </header>

      <div className="max-w-md mx-auto px-5 pt-6">
        <div className="mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
            Passo a Passo
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Escolha seus Serviços
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Selecione um ou mais procedimentos para seu atendimento.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-charcoal-600 border border-charcoal-200/80 hover:border-rose-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div className="space-y-2.5 mb-8">
          {filteredServices.map((service) => {
            const isSelected = selectedServiceIds.includes(service.id);
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-rose-50/60 border-rose-400 shadow-sm"
                    : "bg-white border-charcoal-200/70 hover:border-rose-200 shadow-soft"
                }`}
              >
                <div className="flex-1 pr-3">
                  <h3 className="text-sm font-semibold text-charcoal-800">
                    {service.name}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-charcoal-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      {service.duration_minutes} min
                    </span>
                    <span className="font-medium text-charcoal-700 tabular-nums">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-rose-500 border-rose-500 text-white"
                      : "border-charcoal-300 bg-charcoal-50"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Selection */}
        <div className="mb-8">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 mb-1">
            Profissional de Preferência
          </h2>
          <p className="text-xs text-charcoal-500 mb-3">
            Escolha quem cuidará de você ou selecione sem preferência.
          </p>

          <div className="space-y-2">
            {PROFESSIONALS.map((prof) => {
              const isSelected = selectedProfessional === prof.id;
              return (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfessional(prof.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-rose-50/60 border-rose-400 shadow-sm"
                      : "bg-white border-charcoal-200/70 hover:border-rose-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-600 text-xs font-semibold">
                      {prof.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal-800">{prof.name}</h4>
                      <p className="text-[10px] text-charcoal-400">{prof.role}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-rose-500 bg-rose-500 text-white" : "border-charcoal-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date and Time Selection */}
        <div className="mb-8">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 mb-1">
            Data e Horário Desejados
          </h2>
          <p className="text-xs text-charcoal-500 mb-3">
            Defina sua preferência de dia e horário para o atendimento.
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-charcoal-700 mb-1">
              Data de Preferência
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-charcoal-200/80 bg-white text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-700 mb-1.5">
              Horários Sugeridos
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-rose-500 text-white shadow-sm"
                        : "bg-white text-charcoal-700 border border-charcoal-200 hover:border-rose-300"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Identification Form */}
        <div className="mb-8">
          <h2 className="font-serif text-lg font-bold text-charcoal-800 mb-1">
            Seus Dados de Contato
          </h2>
          <p className="text-xs text-charcoal-500 mb-3">
            Para confirmação rápida e envio de lembretes pelo WhatsApp.
          </p>

          <div className="space-y-3 bg-white p-4 rounded-2xl border border-charcoal-200/70 shadow-soft">
            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ex: Beatriz Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal-700 mb-1">
                WhatsApp com DDD
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="Ex: 11999998888"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300 tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar (Thumb Zone) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-charcoal-200/80 p-4 safe-bottom z-30 shadow-bottomNav">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-semibold text-charcoal-400">
              Total ({selectedServices.length} {selectedServices.length === 1 ? "serviço" : "serviços"})
            </div>
            <div className="text-lg font-bold text-charcoal-800 tabular-nums">
              {formatCurrency(totalAmount)}
            </div>
            {totalDuration > 0 && (
              <div className="text-[11px] text-charcoal-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-500" />
                <span>{totalDuration} minutos estimados</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedServiceIds.length === 0 || isSubmitting}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 disabled:bg-charcoal-200 disabled:text-charcoal-400 text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-luxury"
          >
            {isSubmitting ? (
              <span>Enviando...</span>
            ) : (
              <>
                <span>Enviar Solicitação</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
