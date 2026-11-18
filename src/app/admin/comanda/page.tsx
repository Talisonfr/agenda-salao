"use client";

import React, { useState } from "react";
import { CheckoutModal } from "@/components/admin/CheckoutModal";
import { Receipt, Sparkles, Plus, ArrowRight } from "lucide-react";

export default function ComandaPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="space-y-6 pb-28">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
          Ponto de Venda & Checkout
        </span>
        <h1 className="font-serif text-2xl font-bold text-charcoal-800">
          Comanda & Venda de Balcão
        </h1>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Fechamento de atendimentos somando serviços, cosméticos, semi-joias e kits com baixa automática de estoque.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft text-center max-w-md mx-auto my-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Receipt className="w-8 h-8" />
        </div>

        <h3 className="font-serif text-lg font-bold text-charcoal-800">
          Abrir Nova Comanda
        </h3>
        <p className="text-xs text-charcoal-500 leading-relaxed">
          Registre procedimentos realizados e adicione produtos comprados pela cliente em uma única cobrança unificada.
        </p>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-luxury transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Iniciar Fechamento de Venda</span>
        </button>
      </div>

      <CheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customerName="Cliente Presencial"
        initialServices={[{ name: "Escova & Hidratação", price: 110, commissionRate: 40 }]}
        onFinishCheckout={(data) => {
          setModalOpen(false);
        }}
      />
    </div>
  );
}
