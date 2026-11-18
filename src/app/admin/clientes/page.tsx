"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  FileText, 
  Sparkles, 
  MessageCircle,
  X,
  Trash2,
  CheckCircle2,
  Crown
} from "lucide-react";
import { formatCurrency, formatPhone } from "@/lib/utils";
import { Customer, MonthlyPlan } from "@/types/database";
import { supabase } from "@/lib/supabase/client";

interface CustomerWithPlan extends Customer {
  monthly_plans?: MonthlyPlan[];
  monthlyPlan?: MonthlyPlan;
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<CustomerWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notes, setNotes] = useState("");
  const [hasPlan, setHasPlan] = useState(false);
  const [planName, setPlanName] = useState("Pacote 4 Escovas / Mês");
  const [planPrice, setPlanPrice] = useState("320");
  const [planDueDay, setPlanDueDay] = useState("10");
  const [planSessions, setPlanSessions] = useState("4");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customers")
        .select("*, monthly_plans(*)")
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao carregar clientes do Supabase:", error);
      } else if (data) {
        const formatted: CustomerWithPlan[] = data.map((c: any) => ({
          ...c,
          full_name: c.name || c.full_name || "Cliente",
          phone: c.whatsapp || c.phone || "",
          monthlyPlan: c.monthly_plans && c.monthly_plans.length > 0 ? c.monthly_plans[0] : undefined,
        }));
        setCustomers(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 11) {
      setWhatsapp(raw);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      alert("Por favor, preencha o nome completo e o WhatsApp da cliente.");
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanPhone = whatsapp.replace(/\D/g, "");

      // Insere cliente
      const { data: customerData, error: custError } = await supabase
        .from("customers")
        .insert({
          name: name.trim(),
          whatsapp: cleanPhone,
          birth_date: birthDate || null,
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (custError) {
        throw custError;
      }

      // Se marcou plano mensalista, cria o plano
      if (hasPlan && customerData) {
        const { error: planError } = await supabase
          .from("monthly_plans")
          .insert({
            customer_id: customerData.id,
            name: planName.trim(),
            monthly_price: parseFloat(planPrice) || 0,
            due_day: parseInt(planDueDay) || 10,
            sessions_per_month: parseInt(planSessions) || 4,
            sessions_used: 0,
            payment_status: "PAGO",
            reference_month: new Date().toISOString().slice(0, 10),
            active: true,
          });

        if (planError) {
          console.warn("Aviso ao vincular plano:", planError);
        }
      }

      // Limpa formulário e fecha modal
      setName("");
      setWhatsapp("");
      setBirthDate("");
      setNotes("");
      setHasPlan(false);
      setIsModalOpen(false);

      await loadCustomers();
    } catch (err: any) {
      console.error("Erro ao salvar cliente:", err);
      alert(`Erro ao cadastrar cliente: ${err.message || "Tente novamente"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string, customerName: string) => {
    if (!confirm(`Deseja realmente remover o cadastro de "${customerName}"?`)) return;

    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(`Não foi possível remover: ${err.message}`);
    }
  };

  const filtered = customers.filter(
    (c) =>
      (c.full_name || c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || c.whatsapp || "").includes(search)
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

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-luxury transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400 bg-white rounded-3xl border border-charcoal-200/70">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Carregando carteira de clientes...</p>
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <div className="p-10 text-center bg-white rounded-3xl border border-charcoal-200/80 shadow-soft max-w-md mx-auto my-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-800">
              Nenhuma cliente cadastrada ainda
            </h3>
            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
              Cadastre suas clientes para registrar fichas de procedimentos químicos, alergias, fórmulas de mechas e planos mensalistas recorrentes.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-luxury transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Primeira Cliente</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        /* Search Empty State */
        <div className="p-8 text-center bg-white rounded-3xl border border-charcoal-200/80 text-charcoal-500">
          <p className="text-xs">Nenhuma cliente encontrada com o termo &quot;{search}&quot;.</p>
        </div>
      ) : (
        /* Customers List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => {
            const displayName = customer.name || customer.full_name || "Cliente";
            const displayPhone = customer.whatsapp || customer.phone || "";
            const plan = customer.monthlyPlan || (customer.monthly_plans && customer.monthly_plans[0]);

            return (
              <div
                key={customer.id}
                className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft hover:shadow-luxury transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-charcoal-800">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-rose-500" />
                        <span>{formatPhone(displayPhone)}</span>
                      </div>
                      {customer.birth_date && (
                        <div className="flex items-center gap-1.5 text-[11px] text-charcoal-400 mt-0.5">
                          <Calendar className="w-3 h-3 text-charcoal-400" />
                          <span>Aniversário: {customer.birth_date.split("-").reverse().join("/")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {plan && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-rose-500" />
                          <span>VIP</span>
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteCustomer(customer.id, displayName)}
                        title="Remover cliente"
                        className="p-1 text-charcoal-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                  {plan && (
                    <div className="mt-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-200/60 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-rose-800">{plan.name}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            (plan.payment_status || plan.status) === "PAGO"
                              ? "bg-emerald-100 text-emerald-800"
                              : (plan.payment_status || plan.status) === "PENDENTE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {plan.payment_status || plan.status || "ATIVO"}
                        </span>
                      </div>
                      <div className="text-[11px] text-charcoal-500 flex justify-between pt-1">
                        <span>Sessões do Mês:</span>
                        <strong>
                          {plan.sessions_used ?? plan.used_sessions ?? 0} de {plan.sessions_per_month ?? plan.total_sessions ?? 4} usadas
                        </strong>
                      </div>
                      <div className="text-[11px] text-charcoal-500 flex justify-between">
                        <span>Valor Mensal:</span>
                        <strong className="text-rose-700">
                          {formatCurrency(plan.monthly_price ?? plan.monthly_fee ?? 0)} (Venc. dia {plan.due_day})
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between text-xs">
                  <a
                    href={`https://wa.me/55${displayPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  <span className="text-[11px] text-charcoal-400">
                    Cadastrada em {new Date(customer.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-luxury border border-charcoal-200/80 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-charcoal-200/80 flex items-center justify-between bg-charcoal-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal-800">
                    Nova Cliente
                  </h3>
                  <p className="text-[10px] text-charcoal-400">
                    Cadastro completo de ficha e recorrência
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateCustomer} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Albuquerque"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    WhatsApp (DDD + Número) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="11988887777"
                    value={whatsapp}
                    onChange={handlePhoneInput}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Ficha Técnica & Alergias
                </label>
                <textarea
                  rows={3}
                  placeholder="Fórmulas de coloração, alergias (tolueno, amônia), sensibilidade no couro cabeludo ou preferências..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              {/* Toggle Mensalista VIP */}
              <div className="pt-2 border-t border-charcoal-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPlan}
                    onChange={(e) => setHasPlan(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-300 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-charcoal-800 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-rose-500" />
                    Vincular Pacote Mensalista VIP
                  </span>
                </label>

                {hasPlan && (
                  <div className="mt-3 p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                        Nome do Pacote
                      </label>
                      <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-white text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-600 mb-1">
                          Valor Mensal (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={planPrice}
                          onChange={(e) => setPlanPrice(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-rose-200 bg-white text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300 tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-600 mb-1">
                          Dia Vencimento
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={planDueDay}
                          onChange={(e) => setPlanDueDay(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-rose-200 bg-white text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300 tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-charcoal-600 mb-1">
                          Sessões/Mês
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={planSessions}
                          onChange={(e) => setPlanSessions(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-rose-200 bg-white text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300 tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 text-xs font-semibold hover:bg-charcoal-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-luxury transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Salvar Cliente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
