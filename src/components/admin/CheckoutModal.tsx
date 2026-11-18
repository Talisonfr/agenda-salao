"use client";

import React, { useState } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Sparkles, 
  Package, 
  Scissors,
  AlertTriangle,
  Receipt
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Product, Service, PaymentMethod } from "@/types/database";

interface CartItem {
  id: string;
  name: string;
  type: "SERVICE" | "PRODUCT";
  unitPrice: number;
  costPrice?: number;
  quantity: number;
  commissionRate: number; // %
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  initialServices?: { name: string; price: number; commissionRate: number }[];
  onFinishCheckout: (transactionData: any) => void;
}

// Catálogo mock de produtos disponíveis para adição imediata no checkout
const CATALOG_PRODUCTS: Product[] = [
  { id: "pr1", name: "Kit Shampoo & Máscara Cronograma", category: "KITS_CAPILARES", cost_price: 65, sale_price: 140, stock_qty: 8, stock_quantity: 8, min_stock: 3, active: true, created_at: "" },
  { id: "pr2", name: "Óleo Reparador Iluminador 60ml", category: "COSMETICOS", cost_price: 32, sale_price: 85, stock_qty: 2, stock_quantity: 2, min_stock: 4, active: true, created_at: "" },
  { id: "pr3", name: "Brinco Gota Zircônia Dourada", category: "SEMI_JOIAS", cost_price: 25, sale_price: 69, stock_qty: 5, stock_quantity: 5, min_stock: 2, active: true, created_at: "" },
  { id: "pr4", name: "Leave-in Térmico Protetor", category: "COSMETICOS", cost_price: 28, sale_price: 72, stock_qty: 12, stock_quantity: 12, min_stock: 3, active: true, created_at: "" },
];

export function CheckoutModal({
  isOpen,
  onClose,
  customerName = "Cliente Balcão",
  initialServices = [{ name: "Escova Modelada", price: 90, commissionRate: 40 }],
  onFinishCheckout,
}: CheckoutModalProps) {
  const [items, setItems] = useState<CartItem[]>(() =>
    initialServices.map((s, idx) => ({
      id: `init-${idx}`,
      name: s.name,
      type: "SERVICE",
      unitPrice: s.price,
      quantity: 1,
      commissionRate: s.commissionRate,
    }))
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [installments, setInstallments] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAddProduct = (product: Product) => {
    const stockAvailable = product.stock_quantity ?? product.stock_qty ?? 0;
    if (stockAvailable <= 0) {
      alert("Produto esgotado no estoque.");
      return;
    }

    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      if (existing.quantity >= stockAvailable) {
        alert("Quantidade máxima disponível em estoque atingida.");
        return;
      }
      setItems(
        items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          id: product.id,
          name: product.name,
          type: "PRODUCT",
          unitPrice: product.sale_price,
          costPrice: product.cost_price,
          quantity: 1,
          commissionRate: 0, // Produtos geralmente não geram comissão direta ou percentual específico
        },
      ]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // Cálculos financeiros do checkout
  const servicesSubtotal = items
    .filter((i) => i.type === "SERVICE")
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const productsSubtotal = items
    .filter((i) => i.type === "PRODUCT")
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const productsCostTotal = items
    .filter((i) => i.type === "PRODUCT")
    .reduce((sum, i) => sum + (i.costPrice || 0) * i.quantity, 0);

  const totalAmount = servicesSubtotal + productsSubtotal;

  // Lucro bruto de revenda
  const productProfit = productsSubtotal - productsCostTotal;

  // Total de repasse/comissão para o profissional
  const totalCommission = items
    .filter((i) => i.type === "SERVICE")
    .reduce((sum, i) => sum + (i.unitPrice * i.quantity * i.commissionRate) / 100, 0);

  const handleCompleteOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      onFinishCheckout({
        totalAmount,
        servicesSubtotal,
        productsSubtotal,
        productProfit,
        totalCommission,
        paymentMethod,
        installments: paymentMethod === "CREDITO" ? installments : 1,
        items,
      });
    }, 700);
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
        <div className="max-w-sm w-full bg-white rounded-3xl p-6 text-center shadow-luxury border border-charcoal-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-charcoal-800 mb-1">
            Comanda Fechada!
          </h3>
          <p className="text-xs text-charcoal-500 mb-4">
            Venda registrada e estoque atualizado com sucesso.
          </p>

          <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 text-xs text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Total Recebido:</span>
              <strong className="text-charcoal-800">{formatCurrency(totalAmount)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Forma de Pagamento:</span>
              <span className="font-semibold text-rose-600">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Comissão Profissional:</span>
              <span className="text-charcoal-700">{formatCurrency(totalCommission)}</span>
            </div>
            {productsSubtotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Lucro em Produtos:</span>
                <span>+{formatCurrency(productProfit)}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsCompleted(false);
              onClose();
            }}
            className="w-full py-3 bg-charcoal-800 hover:bg-charcoal-900 text-white rounded-xl text-xs font-semibold"
          >
            Concluir & Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-luxury border border-charcoal-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-charcoal-200/80 flex items-center justify-between bg-charcoal-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-800">
                Fechamento de Comanda / Balcão
              </h3>
              <p className="text-[11px] text-charcoal-400">Cliente: {customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-charcoal-100 hover:bg-charcoal-200 flex items-center justify-center text-charcoal-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Itens Atuais na Comanda */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2.5">
              Itens da Comanda ({items.length})
            </h4>

            {items.length === 0 ? (
              <p className="text-xs text-charcoal-400 text-center py-4 bg-charcoal-50 rounded-2xl border border-dashed border-charcoal-200">
                Nenhum item na comanda. Adicione serviços ou produtos abaixo.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.type === "SERVICE" ? (
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                          <Scissors className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-charcoal-800">{item.name}</div>
                        <div className="text-[10px] text-charcoal-400">
                          {item.quantity}x de {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-charcoal-800 tabular-nums">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-charcoal-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Venda Casada: Adicionar Produtos Físicos na Hora */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                Venda Adicional (Revenda de Produtos)
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CATALOG_PRODUCTS.map((prod) => {
                const stockQty = prod.stock_quantity ?? prod.stock_qty ?? 0;
                const isLowStock = stockQty <= prod.min_stock;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleAddProduct(prod)}
                    className="p-2.5 rounded-xl border border-charcoal-200/80 bg-white hover:border-rose-300 hover:bg-rose-50/20 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-charcoal-400 mb-1">
                        <span className="uppercase">{prod.category.replace("_", " ")}</span>
                        {isLowStock && (
                          <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> {stockQty} un
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-semibold text-charcoal-800 line-clamp-1">
                        {prod.name}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-charcoal-100">
                      <span className="text-xs font-bold text-rose-600 tabular-nums">
                        {formatCurrency(prod.sale_price)}
                      </span>
                      <span className="p-1 rounded-md bg-charcoal-100 hover:bg-rose-500 hover:text-white transition-colors text-charcoal-600">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
              Forma de Pagamento
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: "PIX", label: "Pix", icon: QrCode },
                { id: "CREDITO", label: "Crédito", icon: CreditCard },
                { id: "DEBITO", label: "Débito", icon: CreditCard },
                { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
                { id: "PLANO_MENSAL", label: "Plano Mensal", icon: Sparkles },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? "bg-rose-50 border-rose-400 text-rose-700 shadow-sm"
                        : "bg-white border-charcoal-200 text-charcoal-600 hover:border-rose-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === "CREDITO" && (
              <div className="p-3 rounded-xl bg-charcoal-50 border border-charcoal-200 text-xs">
                <label className="block text-charcoal-600 font-medium mb-1">
                  Número de Parcelas
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-charcoal-200 bg-white text-xs text-charcoal-800"
                >
                  <option value={1}>1x de {formatCurrency(totalAmount)} (Sem acréscimo)</option>
                  <option value={2}>2x de {formatCurrency(totalAmount / 2)}</option>
                  <option value={3}>3x de {formatCurrency(totalAmount / 3)}</option>
                </select>
              </div>
            )}
          </div>

          {/* Resumo Financeiro da Comanda */}
          <div className="p-4 rounded-2xl bg-charcoal-50 border border-charcoal-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal Serviços:</span>
              <span className="font-semibold tabular-nums">{formatCurrency(servicesSubtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal Produtos Revenda:</span>
              <span className="font-semibold tabular-nums">{formatCurrency(productsSubtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal-500 text-[11px] pt-1">
              <span>Previsão de Comissão Equipe:</span>
              <span className="tabular-nums">{formatCurrency(totalCommission)}</span>
            </div>
            {productsSubtotal > 0 && (
              <div className="flex justify-between text-emerald-700 text-[11px] font-medium">
                <span>Lucro Bruto nos Produtos:</span>
                <span className="tabular-nums">+{formatCurrency(productProfit)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-charcoal-800 pt-2 border-t border-charcoal-200">
              <span>Total a Cobrar:</span>
              <span className="text-rose-600 tabular-nums">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-charcoal-200/80 bg-white safe-bottom flex gap-3">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-charcoal-200 text-charcoal-600 font-semibold text-xs hover:bg-charcoal-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCompleteOrder}
            disabled={items.length === 0 || isProcessing}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-charcoal-200 text-white font-semibold text-xs transition-all shadow-luxury flex items-center justify-center gap-2"
          >
            {isProcessing ? "Registrando Baixa..." : "Finalizar & Confirmar Pagamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
