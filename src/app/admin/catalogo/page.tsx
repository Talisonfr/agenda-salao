"use client";

import React, { useState } from "react";
import { 
  Scissors, 
  Package, 
  Plus, 
  AlertTriangle, 
  Sparkles, 
  Search,
  Check,
  TrendingUp,
  Tag
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Service, Product } from "@/types/database";

const SERVICES_DATA: Service[] = [
  { id: "1", name: "Corte & Styling Personalizado", category: "CABELO", price: 120, duration_minutes: 50, commission_pct: 40, commission_percentage: 40, active: true, created_at: "" },
  { id: "2", name: "Escova Modelada & Nutrição", category: "CABELO", price: 90, duration_minutes: 45, commission_pct: 40, commission_percentage: 40, active: true, created_at: "" },
  { id: "3", name: "Manicure & Pedicure Completa", category: "UNHAS", price: 75, duration_minutes: 60, commission_pct: 50, commission_percentage: 50, active: true, created_at: "" },
  { id: "4", name: "Alongamento em Gel Premium", category: "UNHAS", price: 180, duration_minutes: 90, commission_pct: 50, commission_percentage: 50, active: true, created_at: "" },
  { id: "5", name: "Design de Sobrancelha com Henna", category: "SOBRANCELHA", price: 65, duration_minutes: 35, commission_pct: 45, commission_percentage: 45, active: true, created_at: "" },
];

const PRODUCTS_DATA: Product[] = [
  { id: "1", name: "Kit Shampoo & Máscara Cronograma", category: "KITS_CAPILARES", cost_price: 65, sale_price: 140, stock_qty: 8, stock_quantity: 8, min_stock: 3, active: true, created_at: "" },
  { id: "2", name: "Óleo Reparador Iluminador 60ml", category: "COSMETICOS", cost_price: 32, sale_price: 85, stock_qty: 2, stock_quantity: 2, min_stock: 4, active: true, created_at: "" },
  { id: "3", name: "Brinco Gota Zircônia Dourada", category: "SEMI_JOIAS", cost_price: 25, sale_price: 69, stock_qty: 5, stock_quantity: 5, min_stock: 2, active: true, created_at: "" },
  { id: "4", name: "Leave-in Térmico Protetor", category: "COSMETICOS", cost_price: 28, sale_price: 72, stock_qty: 12, stock_quantity: 12, min_stock: 3, active: true, created_at: "" },
];

export default function CatalogoPage() {
  const [tab, setTab] = useState<"SERVICOS" | "PRODUTOS">("SERVICOS");
  const [search, setSearch] = useState("");

  const filteredServices = SERVICES_DATA.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = PRODUCTS_DATA.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Estoque & Portfólio
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Catálogo & Estoque Físico
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Gerencie procedimentos do salão e controle o estoque de revenda de cosméticos e semi-joias.
          </p>
        </div>

        <button className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-luxury">
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar {tab === "SERVICOS" ? "Serviço" : "Produto"}</span>
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-white p-1 rounded-xl border border-charcoal-200/80 flex text-xs font-semibold self-start shadow-soft">
          <button
            onClick={() => setTab("SERVICOS")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              tab === "SERVICOS" ? "bg-rose-500 text-white shadow-sm" : "text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Serviços ({SERVICES_DATA.length})</span>
          </button>
          <button
            onClick={() => setTab("PRODUTOS")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              tab === "PRODUTOS" ? "bg-rose-500 text-white shadow-sm" : "text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produtos & Estoque ({PRODUCTS_DATA.length})</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-charcoal-200/80 bg-white text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </div>

      {/* Services List */}
      {tab === "SERVICOS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 bg-charcoal-100 px-2 py-0.5 rounded-md">
                  {srv.category}
                </span>
                <h3 className="font-serif text-sm font-bold text-charcoal-800 mt-2">
                  {srv.name}
                </h3>
                <p className="text-xs text-charcoal-400 mt-0.5">{srv.duration_minutes} minutos estimados</p>
              </div>

              <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-charcoal-400 block">Comissão Equipe</span>
                  <span className="font-semibold text-charcoal-700">{srv.commission_percentage}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-charcoal-400 block">Preço</span>
                  <strong className="text-rose-600 text-sm font-bold tabular-nums">
                    {formatCurrency(srv.price)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products List with Stock Alert */}
      {tab === "PRODUTOS" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((prod) => {
            const isLowStock = prod.stock_quantity <= prod.min_stock;
            const margin = ((prod.sale_price - prod.cost_price) / prod.sale_price) * 100;

            return (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 bg-charcoal-100 px-2 py-0.5 rounded-md">
                      {prod.category.replace("_", " ")}
                    </span>
                    {isLowStock && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Estoque Baixo
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-sm font-bold text-charcoal-800 mt-1">
                    {prod.name}
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-50/70 border border-charcoal-200/60 text-xs space-y-1">
                  <div className="flex justify-between text-charcoal-600">
                    <span>Estoque Atual:</span>
                    <strong className={`tabular-nums ${isLowStock ? "text-amber-700" : "text-charcoal-800"}`}>
                      {prod.stock_quantity} unidades (Mín: {prod.min_stock})
                    </strong>
                  </div>
                  <div className="flex justify-between text-charcoal-600">
                    <span>Custo Unitário:</span>
                    <span className="tabular-nums">{formatCurrency(prod.cost_price)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-charcoal-200">
                    <span>Margem Bruta:</span>
                    <span>{margin.toFixed(1)}% (+{formatCurrency(prod.sale_price - prod.cost_price)})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-charcoal-400 font-medium">Preço de Venda</span>
                  <span className="text-sm font-bold text-rose-600 tabular-nums">
                    {formatCurrency(prod.sale_price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
