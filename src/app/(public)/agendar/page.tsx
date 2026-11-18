"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { Service, ServiceCategory, Profile } from "@/types/database";
import { supabase } from "@/lib/supabase/client";

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

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hStr, mStr] = startTime.split(":");
  let totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + durationMinutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function AgendarPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<{ id: string; full_name: string; role?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "TODOS">("TODOS");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Busca serviços ativos
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("active", true)
          .order("name", { ascending: true });

        if (servicesData) {
          setServices(servicesData);
        }

        // Busca profissionais ativas
        const { data: profsData } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("active", true)
          .order("full_name", { ascending: true });

        const profsList = profsData && profsData.length > 0
          ? [
              { id: "any", full_name: "Sem preferência (Primeira disponível)", role: "Atendimento Especial" },
              ...profsData.map((p) => ({
                id: p.id,
                full_name: p.full_name,
                role: p.role === "admin" ? "Especialista & Gestora" : "Profissional Especialista",
              })),
            ]
          : [
              { id: "any", full_name: "Sem preferência (Primeira disponível)", role: "Equipe Especializada" },
            ];

        setProfessionals(profsList);
      } catch (err) {
        console.error("Erro ao carregar serviços:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Define data mínima como hoje
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalAmount = selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);
  const totalDuration = selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      alert("Por favor, selecione pelo menos um procedimento.");
      return;
    }
    if (!selectedDate) {
      alert("Por favor, selecione a data desejada.");
      return;
    }
    if (!selectedTime) {
      alert("Por favor, selecione um horário preferencial.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Por favor, informe seu nome completo e WhatsApp para contato.");
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanPhone = customerPhone.replace(/\D/g, "");

      // 1. Localiza ou cria cliente no Supabase
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("whatsapp", cleanPhone)
        .maybeSingle();

      let customerId = existingCustomer?.id;

      if (!customerId) {
        const { data: newCust, error: custErr } = await supabase
          .from("customers")
          .insert({
            name: customerName.trim(),
            whatsapp: cleanPhone,
          })
          .select("id")
          .single();

        if (custErr) throw custErr;
        customerId = newCust.id;
      }

      // 2. Calcula horário de término estimado
      const calculatedEnd = calculateEndTime(selectedTime, totalDuration > 0 ? totalDuration : 30);

      // 3. Cria agendamento pendente
      const { data: newApp, error: appErr } = await supabase
        .from("appointments")
        .insert({
          customer_id: customerId,
          professional_id: selectedProfessional !== "any" ? selectedProfessional : null,
          status: "PENDENTE_APROVACAO",
          source: "PUBLICO",
          requested_date: selectedDate,
          requested_from: selectedTime + ":00",
          requested_to: calculatedEnd + ":00",
          duration_minutes: totalDuration,
          total_price: totalAmount,
        })
        .select("id")
        .single();

      if (appErr) throw appErr;

      // 4. Insere itens do agendamento
      if (newApp?.id) {
        const itemsToInsert = selectedServices.map((s) => ({
          appointment_id: newApp.id,
          service_id: s.id,
          service_name: s.name,
          price: s.price,
          duration_minutes: s.duration_minutes,
          commission_pct: s.commission_pct ?? s.commission_percentage ?? 40,
        }));

        const { error: itemsErr } = await supabase
          .from("appointment_items")
          .insert(itemsToInsert);

        if (itemsErr) console.warn("Aviso ao inserir itens do agendamento:", itemsErr);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Erro ao enviar solicitação:", err);
      alert(`Não foi possível enviar a solicitação: ${err.message || "Tente novamente"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-charcoal-50 flex flex-col justify-center items-center px-6 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-luxury text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-charcoal-800 mb-2">
            Solicitação Enviada!
          </h2>

          <p className="text-sm text-charcoal-600 mb-6 leading-relaxed">
            Olá, <strong className="text-charcoal-800">{customerName.split(" ")[0]}</strong>! Sua solicitação para{" "}
            <strong>{selectedServices.map((s) => s.name).join(", ")}</strong> no dia{" "}
            <strong>{selectedDate.split("-").reverse().join("/")}</strong> às <strong>{selectedTime}</strong> foi registrada no sistema.
          </p>

          <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 text-xs text-rose-800 text-left mb-8 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-600" /> Próximo passo
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
    ? services
    : services.filter((s) => s.category === selectedCategory);

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
            Agendamento Online
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Escolha seus Serviços
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Selecione um ou mais procedimentos para seu momento de autocuidado.
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="p-12 text-center text-charcoal-400 bg-white rounded-3xl border border-charcoal-200/70 mb-8">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Carregando catálogo do salão...</p>
          </div>
        ) : services.length === 0 ? (
          /* Empty Catalog State */
          <div className="p-8 text-center bg-white rounded-3xl border border-charcoal-200/80 shadow-soft mb-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal-800">
                Catálogo em Preparação
              </h3>
              <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                Nosso catálogo de serviços está sendo preparado com muito carinho. Por favor, volte em instantes ou fale conosco diretamente no WhatsApp para agendar seu horário.
              </p>
            </div>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>
        ) : (
          <>
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
                      {service.description && (
                        <p className="text-[11px] text-charcoal-400 line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-charcoal-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          {service.duration_minutes} min
                        </span>
                        <span className="font-semibold text-charcoal-800 tabular-nums">
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
                {professionals.map((prof) => {
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
                          {prof.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-charcoal-800">{prof.full_name}</h4>
                          <p className="text-[10px] text-charcoal-400">{prof.role || "Profissional"}</p>
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
                  min={new Date().toISOString().split("T")[0]}
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
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Beatriz Silva"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-700 mb-1">
                    WhatsApp com DDD *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 11999998888"
                      value={customerPhone}
                      onChange={handlePhoneChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300 tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Bottom Bar (Thumb Zone) */}
      {!loading && services.length > 0 && (
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
      )}
    </main>
  );
}
