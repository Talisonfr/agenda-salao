"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Scissors, 
  Users, 
  Calendar, 
  Download, 
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  MessageCircle,
  PieChart as PieIcon,
  CheckCircle,
  Clock
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { formatCurrency, buildWhatsAppReminderLink } from "@/lib/utils";
import { MonthlyPlan } from "@/types/database";
import { supabase } from "@/lib/supabase/client";

export function FinanceDashboard() {
  const [filterPeriod, setFilterPeriod] = useState<"HOJE" | "SEMANA" | "MES">("MES");
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([]);

  useEffect(() => {
    async function loadFinanceData() {
      try {
        setLoading(true);
        const [txRes, plansRes] = await Promise.all([
          supabase.from("transactions").select("*, items:transaction_items(*)").order("occurred_at", { ascending: true }),
          supabase.from("monthly_plans").select("*, customer:customers(*)").order("due_day", { ascending: true }),
        ]);

        if (txRes.data) setTransactions(txRes.data);
        if (plansRes.data) {
          const formattedPlans: MonthlyPlan[] = plansRes.data.map((p: any) => ({
            ...p,
            customer: p.customer ? {
              ...p.customer,
              full_name: p.customer.name || p.customer.full_name,
              phone: p.customer.whatsapp || p.customer.phone,
            } : undefined,
          }));
          setMonthlyPlans(formattedPlans);
        }
      } catch (err) {
        console.error("Erro ao carregar dados financeiros:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFinanceData();
  }, []);

  // Consolidação de métricas reais
  const totalGrossRevenue = transactions.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0);
  
  // Itens de todas as transações
  const allItems: any[] = transactions.flatMap((tx) => tx.items || []);

  const serviceItems = allItems.filter((i) => i.kind === "SERVICO");
  const productItems = allItems.filter((i) => i.kind === "PRODUTO");

  const servicesRevenue = serviceItems.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity) || 0), 0);
  const productsRevenue = productItems.reduce((sum, i) => sum + (Number(i.unit_price) * Number(i.quantity) || 0), 0);
  const productsCost = productItems.reduce((sum, i) => sum + (Number(i.unit_cost) * Number(i.quantity) || 0), 0);
  const productsProfit = productsRevenue - productsCost;

  const monthlyPlansRevenue = monthlyPlans
    .filter((p) => (p.payment_status || p.status) === "PAGO")
    .reduce((sum, p) => sum + (Number(p.monthly_price ?? p.monthly_fee) || 0), 0);

  const totalOrdersCount = transactions.length;
  const averageTicket = totalOrdersCount > 0 ? totalGrossRevenue / totalOrdersCount : 0;

  // Formas de pagamento
  const paymentCounts: Record<string, number> = {};
  transactions.forEach((tx) => {
    const m = tx.payment_method || "OUTROS";
    paymentCounts[m] = (paymentCounts[m] || 0) + (Number(tx.total) || 0);
  });

  const paymentColors: Record<string, string> = {
    PIX: "#10B981",
    CREDITO: "#B76E79",
    DEBITO: "#6366F1",
    DINHEIRO: "#F59E0B",
    PLANO: "#8B5CF6",
  };

  const paymentDistributionData = Object.entries(paymentCounts).map(([name, value]) => ({
    name: name === "PIX" ? "Pix" : name === "CREDITO" ? "Cartão de Crédito" : name === "DEBITO" ? "Cartão de Débito" : name === "DINHEIRO" ? "Dinheiro" : "Plano Mensal",
    value,
    color: paymentColors[name] || "#B76E79",
  }));

  // Top Serviços
  const servicesAgg: Record<string, { name: string; count: number; revenue: number }> = {};
  serviceItems.forEach((i) => {
    const desc = i.description || "Procedimento";
    if (!servicesAgg[desc]) {
      servicesAgg[desc] = { name: desc, count: 0, revenue: 0 };
    }
    servicesAgg[desc].count += Number(i.quantity) || 1;
    servicesAgg[desc].revenue += (Number(i.unit_price) * Number(i.quantity)) || 0;
  });
  const topServices = Object.values(servicesAgg).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  // Top Produtos
  const productsAgg: Record<string, { name: string; sold: number; revenue: number; profit: number }> = {};
  productItems.forEach((i) => {
    const desc = i.description || "Produto";
    if (!productsAgg[desc]) {
      productsAgg[desc] = { name: desc, sold: 0, revenue: 0, profit: 0 };
    }
    const sold = Number(i.quantity) || 1;
    const rev = (Number(i.unit_price) * sold) || 0;
    const cost = (Number(i.unit_cost) * sold) || 0;
    productsAgg[desc].sold += sold;
    productsAgg[desc].revenue += rev;
    productsAgg[desc].profit += (rev - cost);
  });
  const topProducts = Object.values(productsAgg).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  // Timeline de evolução de entradas
  const timelineMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    const dateObj = new Date(tx.occurred_at || tx.created_at);
    const dayKey = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    timelineMap[dayKey] = (timelineMap[dayKey] || 0) + (Number(tx.total) || 0);
  });
  const revenueTimeline = Object.entries(timelineMap).map(([day, total]) => ({ day, total }));

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Categoria,Faturamento\n" +
      `Serviços,${servicesRevenue}\n` +
      `Produtos Revenda,${productsRevenue}\n` +
      `Planos Mensalistas,${monthlyPlansRevenue}\n` +
      `Total Bruto,${totalGrossRevenue}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fechamento-salao-${filterPeriod.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReminder = (plan: MonthlyPlan) => {
    if (!plan.customer) return;
    const link = buildWhatsAppReminderLink({
      phone: plan.customer.phone || plan.customer.whatsapp || "",
      customerName: plan.customer.full_name || plan.customer.name || "Cliente",
      planName: plan.name,
      dueDay: plan.due_day,
      monthlyFee: plan.monthly_fee ?? plan.monthly_price ?? 0,
    });
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Painel Executivo
          </span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-800">
            Gestão Financeira & Caixa
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            DRE consolidado, controle de comissões, margem de produtos e recorrência VIP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-charcoal-200/80 flex text-xs font-medium">
            {(["HOJE", "SEMANA", "MES"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterPeriod === period
                    ? "bg-rose-500 text-white shadow-sm font-semibold"
                    : "text-charcoal-500 hover:text-charcoal-800"
                }`}
              >
                {period === "HOJE" ? "Hoje" : period === "SEMANA" ? "Semana" : "Este Mês"}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl border border-charcoal-200/80 bg-white hover:bg-charcoal-50 text-charcoal-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-soft"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Faturamento Bruto */}
        <div className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Faturamento Total</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-charcoal-800 tabular-nums">
              {formatCurrency(totalGrossRevenue)}
            </div>
            <div className="text-[10px] text-charcoal-400 font-medium mt-1">
              {totalOrdersCount} {totalOrdersCount === 1 ? "venda registrada" : "vendas registradas"}
            </div>
          </div>
        </div>

        {/* Serviços vs Produtos */}
        <div className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Serviços x Revenda</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xs text-charcoal-700 flex justify-between">
              <span>Serviços:</span>
              <strong className="tabular-nums">{formatCurrency(servicesRevenue)}</strong>
            </div>
            <div className="text-xs text-charcoal-700 flex justify-between mt-1">
              <span>Produtos:</span>
              <strong className="tabular-nums">{formatCurrency(productsRevenue)}</strong>
            </div>
          </div>
        </div>

        {/* Lucro Revenda */}
        <div className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Lucro em Produtos</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-600 tabular-nums">
              +{formatCurrency(productsProfit)}
            </div>
            <div className="text-[10px] text-charcoal-400 mt-1">
              {productsRevenue > 0
                ? `Margem de ${((productsProfit / productsRevenue) * 100).toFixed(1)}%`
                : "Aguardando vendas de produtos"}
            </div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Ticket Médio</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-charcoal-800 tabular-nums">
              {formatCurrency(averageTicket)}
            </div>
            <div className="text-[10px] text-charcoal-400 mt-1">
              Por atendimento concluído
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de Evolução de Entradas */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-800">
                Evolução do Faturamento
              </h3>
              <p className="text-xs text-charcoal-400">Entradas acumuladas ao longo do período</p>
            </div>
          </div>

          {revenueTimeline.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-charcoal-400 bg-charcoal-50/50 rounded-2xl border border-dashed border-charcoal-200">
              <DollarSign className="w-8 h-8 text-charcoal-300 mb-2" />
              <p className="text-xs font-medium text-charcoal-600">Nenhum faturamento registrado ainda</p>
              <p className="text-[11px] text-charcoal-400 mt-0.5">Finalize atendimentos ou registre vendas de balcão para visualizar a evolução gráfica.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTimeline}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B76E79" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#B76E79" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#8D8A90" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8D8A90" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
                    contentStyle={{
                      backgroundColor: "#1E1E24",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      border: "none",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#B76E79"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Distribuição por Forma de Pagamento */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
              Formas de Pagamento
            </h3>
            <p className="text-xs text-charcoal-400 mb-4">Divisão do volume de caixa</p>

            {paymentDistributionData.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-charcoal-400 bg-charcoal-50/50 rounded-2xl border border-dashed border-charcoal-200">
                <PieIcon className="w-7 h-7 text-charcoal-300 mb-1" />
                <p className="text-xs">Nenhum recebimento registrado</p>
              </div>
            ) : (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-charcoal-100">
            {paymentDistributionData.length === 0 ? (
              <p className="text-[11px] text-charcoal-400 text-center py-1">Pix, Cartão e Dinheiro</p>
            ) : (
              paymentDistributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-charcoal-600">{item.name}</span>
                  </div>
                  <strong className="text-charcoal-800 tabular-nums">{formatCurrency(item.value)}</strong>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rankings: Serviços & Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Serviços */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft">
          <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
            Serviços Mais Realizados
          </h3>
          <p className="text-xs text-charcoal-400 mb-4">Procedimentos de maior demanda</p>

          {topServices.length === 0 ? (
            <p className="text-xs text-charcoal-400 text-center py-6 bg-charcoal-50/50 rounded-2xl border border-dashed border-charcoal-200">
              Nenhum serviço realizado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {topServices.map((srv, idx) => (
                <div
                  key={srv.name}
                  className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-charcoal-800">{srv.name}</div>
                      <div className="text-[10px] text-charcoal-400">{srv.count} {srv.count === 1 ? "atendimento" : "atendimentos"}</div>
                    </div>
                  </div>
                  <strong className="text-charcoal-800 tabular-nums">{formatCurrency(srv.revenue)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Produtos */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft">
          <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
            Produtos Mais Vendidos (Revenda)
          </h3>
          <p className="text-xs text-charcoal-400 mb-4">Volume e lucro de revenda de cosméticos e semi-joias</p>

          {topProducts.length === 0 ? (
            <p className="text-xs text-charcoal-400 text-center py-6 bg-charcoal-50/50 rounded-2xl border border-dashed border-charcoal-200">
              Nenhuma venda de produto registrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((prod) => (
                <div
                  key={prod.name}
                  className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-charcoal-800">{prod.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-charcoal-400 mt-0.5">
                      <span>{prod.sold} {prod.sold === 1 ? "vendido" : "vendidos"}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-charcoal-800 tabular-nums">
                      {formatCurrency(prod.revenue)}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      +{formatCurrency(prod.profit)} lucro
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gestão de Clientes Mensalistas */}
      <div className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <h3 className="font-serif text-base font-bold text-charcoal-800">
                Controle de Clientes Mensalistas (Recorrência)
              </h3>
            </div>
            <p className="text-xs text-charcoal-400">
              Acompanhamento de sessões utilizadas e cobrança rápida de planos ativos.
            </p>
          </div>
          <span className="text-xs text-charcoal-600 bg-charcoal-100 px-3 py-1 rounded-full self-start font-medium">
            {monthlyPlans.length} {monthlyPlans.length === 1 ? "Mensalista Ativa" : "Mensalistas Ativas"}
          </span>
        </div>

        {monthlyPlans.length === 0 ? (
          <p className="text-xs text-charcoal-400 text-center py-6 bg-charcoal-50/50 rounded-2xl border border-dashed border-charcoal-200">
            Nenhuma cliente mensalista cadastrada ainda. Ao cadastrar uma cliente no menu &quot;Clientes&quot;, vincule um plano VIP para acompanhar as sessões e vencimento aqui.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {monthlyPlans.map((plan) => {
              const usedSessions = plan.used_sessions ?? plan.sessions_used ?? 0;
              const totalSessions = plan.total_sessions ?? plan.sessions_per_month ?? 1;
              const usagePercent = Math.min(100, (usedSessions / totalSessions) * 100);
              const status = plan.status ?? plan.payment_status ?? "PENDENTE";
              const fee = plan.monthly_fee ?? plan.monthly_price ?? 0;
              const customerName = plan.customer?.full_name || plan.customer?.name || "Cliente";

              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border border-charcoal-200 bg-charcoal-50/60 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          status === "PAGO"
                            ? "bg-emerald-100 text-emerald-700"
                            : status === "PENDENTE"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {status}
                      </span>
                      <span className="text-[11px] text-charcoal-400 font-medium">
                        Vencimento dia {plan.due_day}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-charcoal-800">
                      {customerName}
                    </h4>
                    <p className="text-[11px] text-rose-600 font-medium">{plan.name}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-charcoal-500 mb-1">
                      <span>Sessões Utilizadas:</span>
                      <strong className="text-charcoal-800">
                        {usedSessions} de {totalSessions}
                      </strong>
                    </div>
                    <div className="w-full bg-charcoal-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-2 rounded-full transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-charcoal-200">
                    <span className="font-bold text-charcoal-800 text-xs tabular-nums">
                      {formatCurrency(fee)}/mês
                    </span>
                    {status !== "PAGO" && (
                      <button
                        onClick={() => handleSendReminder(plan)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Cobrar no WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
