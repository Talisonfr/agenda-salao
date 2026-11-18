"use client";

import React, { useState, useEffect } from "react";
import { CheckoutModal } from "@/components/admin/CheckoutModal";
import { Receipt, Sparkles, Plus, Clock, CreditCard, Banknote, QrCode } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

export default function ComandaPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("transactions")
        .select("*, customer:customers(*), items:transaction_items(*)")
        .order("occurred_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Erro ao carregar comandas:", error);
      } else if (data) {
        setRecentTransactions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Ponto de Venda & Checkout
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Comanda & Venda de Balcão
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Fechamento de atendimentos somando serviços, cosméticos e kits com baixa automática de estoque.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-luxury transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Abrir Nova Comanda</span>
        </button>
      </div>

      {/* Hero Action Card */}
      <div className="p-8 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft text-center max-w-md mx-auto my-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Receipt className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-lg font-bold text-charcoal-800">
          Venda de Balcão Express
        </h3>
        <p className="text-xs text-charcoal-500 leading-relaxed">
          Registre procedimentos realizados e adicione produtos comprados pela cliente em uma única cobrança unificada com Pix, Cartão ou Dinheiro.
        </p>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-luxury transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Iniciar Fechamento de Venda</span>
        </button>
      </div>

      {/* Histórico Recente de Comandas Fechadas */}
      <div className="mt-8">
        <h3 className="font-serif text-base font-bold text-charcoal-800 mb-3">
          Comandas Recentes Fechadas
        </h3>

        {loading ? (
          <div className="p-8 text-center text-charcoal-400 bg-white rounded-3xl border border-charcoal-200/70">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Carregando comandas...</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-charcoal-200/80 text-charcoal-400">
            <p className="text-xs">Nenhuma comanda fechada ainda. Realize a primeira venda pelo botão acima.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((tx) => {
              const custName = tx.customer?.name || tx.customer?.full_name || "Cliente Balcão";
              const itemsCount = tx.items?.length || 1;

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-charcoal-800">{custName}</div>
                      <div className="text-[11px] text-charcoal-400">
                        {new Date(tx.occurred_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {tx.payment_method} • {itemsCount} {itemsCount === 1 ? "item" : "itens"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-charcoal-800 tabular-nums text-sm">
                      {formatCurrency(tx.total || 0)}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      PAGO
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customerName="Cliente Presencial"
        onFinishCheckout={() => {
          setModalOpen(false);
          loadRecentTransactions();
        }}
      />
    </div>
  );
}
