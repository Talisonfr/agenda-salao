"use client";

import React, { useState, useEffect } from "react";
import { 
  Scissors, 
  Package, 
  Plus, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  Check, 
  Trash2, 
  X, 
  Loader2 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Service, Product, ServiceCategory, ProductCategory } from "@/types/database";
import { supabase } from "@/lib/supabase/client";

export default function CatalogoPage() {
  const [tab, setTab] = useState<"SERVICOS" | "PRODUTOS">("SERVICOS");
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modais de Cadastro
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - Novo Serviço
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>("CABELO");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("60");
  const [newServiceCommission, setNewServiceCommission] = useState("40");

  // Form states - Novo Produto
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>("COSMETICOS");
  const [newProductCost, setNewProductCost] = useState("");
  const [newProductSale, setNewProductSale] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductMinStock, setNewProductMinStock] = useState("3");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: srvData } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (srvData) setServices(srvData);
      if (prodData) setProducts(prodData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) {
      alert("Informe o nome e o preço do serviço.");
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = parseFloat(newServicePrice.replace(",", "."));
      const durationNum = parseInt(newServiceDuration, 10) || 60;
      const commissionNum = parseFloat(newServiceCommission.replace(",", ".")) || 40;

      const { data, error } = await supabase.from("services").insert({
        name: newServiceName.trim(),
        category: newServiceCategory,
        price: priceNum,
        duration_minutes: durationNum,
        commission_pct: commissionNum,
        active: true,
      }).select();

      if (error) throw error;

      if (data && data[0]) {
        setServices([data[0], ...services]);
      }

      setServiceNameReset();
      setServiceModalOpen(false);
    } catch (err: any) {
      alert("Erro ao cadastrar serviço: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductSale) {
      alert("Informe o nome e o preço de venda do produto.");
      return;
    }

    setIsSubmitting(true);
    try {
      const costNum = parseFloat(newProductCost.replace(",", ".")) || 0;
      const saleNum = parseFloat(newProductSale.replace(",", "."));
      const stockNum = parseInt(newProductStock, 10) || 0;
      const minStockNum = parseInt(newProductMinStock, 10) || 3;

      const { data, error } = await supabase.from("products").insert({
        name: newProductName.trim(),
        category: newProductCategory,
        cost_price: costNum,
        sale_price: saleNum,
        stock_qty: stockNum,
        min_stock: minStockNum,
        active: true,
      }).select();

      if (error) throw error;

      if (data && data[0]) {
        setProducts([data[0], ...products]);
      }

      setProductReset();
      setProductModalOpen(false);
    } catch (err: any) {
      alert("Erro ao cadastrar produto: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const setServiceNameReset = () => {
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDuration("60");
    setNewServiceCommission("40");
  };

  const setProductReset = () => {
    setNewProductName("");
    setNewProductCost("");
    setNewProductSale("");
    setNewProductStock("");
    setNewProductMinStock("3");
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Deseja realmente excluir este serviço?")) return;
    await supabase.from("services").delete().eq("id", id);
    setServices(services.filter((s) => s.id !== id));
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Deseja realmente excluir este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
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
            Cadastre os procedimentos do salão e controle o estoque de cosméticos, kits e semi-joias.
          </p>
        </div>

        <button
          onClick={() => {
            if (tab === "SERVICOS") {
              setServiceModalOpen(true);
            } else {
              setProductModalOpen(true);
            }
          }}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-luxury transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar {tab === "SERVICOS" ? "Novo Serviço" : "Novo Produto"}</span>
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
            <span>Serviços ({services.length})</span>
          </button>
          <button
            onClick={() => setTab("PRODUTOS")}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              tab === "PRODUTOS" ? "bg-rose-500 text-white shadow-sm" : "text-charcoal-500 hover:text-charcoal-800"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produtos & Estoque ({products.length})</span>
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

      {loading ? (
        <div className="p-12 text-center text-charcoal-400 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-2" />
          <p className="text-xs">Carregando catálogo...</p>
        </div>
      ) : (
        <>
          {/* Services Tab */}
          {tab === "SERVICOS" && (
            <div>
              {services.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border border-dashed border-charcoal-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <Scissors className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-charcoal-800">
                    Nenhum serviço cadastrado ainda
                  </h3>
                  <p className="text-xs text-charcoal-400 max-w-sm mx-auto">
                    Comece cadastrando os procedimentos do salão (ex: Corte, Escova, Manicure, Mechas). Eles aparecerão automaticamente na página de agendamento da cliente.
                  </p>
                  <button
                    onClick={() => setServiceModalOpen(true)}
                    className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Primeiro Serviço</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between space-y-3 relative group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-md">
                            {srv.category}
                          </span>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="text-charcoal-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h3 className="font-serif text-sm font-bold text-charcoal-800 mt-2">
                          {srv.name}
                        </h3>
                        <p className="text-xs text-charcoal-400 mt-0.5">
                          {srv.duration_minutes} minutos estimados
                        </p>
                      </div>

                      <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-charcoal-400 block">Comissão Equipe</span>
                          <span className="font-semibold text-charcoal-700">
                            {srv.commission_pct ?? srv.commission_percentage ?? 40}%
                          </span>
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
            </div>
          )}

          {/* Products Tab */}
          {tab === "PRODUTOS" && (
            <div>
              {products.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border border-dashed border-charcoal-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-charcoal-800">
                    Nenhum produto em estoque
                  </h3>
                  <p className="text-xs text-charcoal-400 max-w-sm mx-auto">
                    Cadastre cosméticos, kits capilares e semi-joias para vender diretamente na comanda de checkout e controlar o estoque físico.
                  </p>
                  <button
                    onClick={() => setProductModalOpen(true)}
                    className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Primeiro Produto</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.map((prod) => {
                    const stockQty = prod.stock_qty ?? prod.stock_quantity ?? 0;
                    const isLowStock = stockQty <= prod.min_stock;
                    const margin = prod.sale_price > 0
                      ? (((prod.sale_price - prod.cost_price) / prod.sale_price) * 100).toFixed(1)
                      : "0";

                    return (
                      <div
                        key={prod.id}
                        className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-md">
                              {prod.category.replace("_", " ")}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isLowStock && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Estoque Baixo
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="text-charcoal-300 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h3 className="font-serif text-sm font-bold text-charcoal-800 mt-1">
                            {prod.name}
                          </h3>
                        </div>

                        <div className="p-3 rounded-xl bg-charcoal-50/70 border border-charcoal-200/60 text-xs space-y-1">
                          <div className="flex justify-between text-charcoal-600">
                            <span>Estoque Atual:</span>
                            <strong className={`tabular-nums ${isLowStock ? "text-amber-700" : "text-charcoal-800"}`}>
                              {stockQty} unidades (Mín: {prod.min_stock})
                            </strong>
                          </div>
                          <div className="flex justify-between text-charcoal-600">
                            <span>Custo Unitário:</span>
                            <span className="tabular-nums">{formatCurrency(prod.cost_price)}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-charcoal-200">
                            <span>Margem Bruta:</span>
                            <span>{margin}% (+{formatCurrency(prod.sale_price - prod.cost_price)})</span>
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
          )}
        </>
      )}

      {/* Modal: Cadastrar Serviço */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-luxury border border-charcoal-200 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-rose-600" />
                <h3 className="font-serif text-base font-bold text-charcoal-800">
                  Cadastrar Novo Serviço
                </h3>
              </div>
              <button
                onClick={() => setServiceModalOpen(false)}
                className="w-7 h-7 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Escova Modelada & Nutrição"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-white"
                  >
                    <option value="CABELO">Cabelo</option>
                    <option value="UNHAS">Unhas</option>
                    <option value="ESTETICA">Estética</option>
                    <option value="SOBRANCELHA">Sobrancelha</option>
                    <option value="MAQUIAGEM">Maquiagem</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="90.00"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Duração Estimada (min)
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    % Comissão Equipe
                  </label>
                  <input
                    type="number"
                    placeholder="40"
                    value={newServiceCommission}
                    onChange={(e) => setNewServiceCommission(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all shadow-sm"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Produto */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-luxury border border-charcoal-200 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif text-base font-bold text-charcoal-800">
                  Cadastrar Produto para Revenda
                </h3>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-7 h-7 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Óleo Reparador Iluminador 60ml"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">
                  Categoria
                </label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-white"
                >
                  <option value="COSMETICOS">Cosméticos</option>
                  <option value="SEMIJOIAS">Semi-joias / Acessórios</option>
                  <option value="KITS_CAPILARES">Kits Capilares</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Preço de Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="30.00"
                    value={newProductCost}
                    onChange={(e) => setNewProductCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="75.00"
                    value={newProductSale}
                    onChange={(e) => setNewProductSale(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Quantidade em Estoque
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    value={newProductMinStock}
                    onChange={(e) => setNewProductMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all shadow-sm"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
