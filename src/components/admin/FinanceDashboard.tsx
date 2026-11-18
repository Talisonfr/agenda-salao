"use client";

import React, { useState } from "react";
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

// Dados simulados do mês corrente
const REVENUE_TIMELINE = [
  { day: "01/Nov", total: 680, servicos: 540, produtos: 140 },
  { day: "05/Nov", total: 1120, servicos: 890, produtos: 230 },
  { day: "10/Nov", total: 1850, servicos: 1450, produtos: 400 },
  { day: "15/Nov", total: 2450, servicos: 1980, produtos: 470 },
  { day: "20/Nov", total: 3100, servicos: 2420, produtos: 680 },
  { day: "25/Nov", total: 4200, servicos: 3350, produtos: 850 },
  { day: "30/Nov", total: 5480, servicos: 4280, produtos: 1200 },
];

const PAYMENT_DISTRIBUTION = [
  { name: "Pix", value: 2950, color: "#10B981" },
  { name: "Cartão de Crédito", value: 1680, color: "#B76E79" },
  { name: "Cartão de Débito", value: 620, color: "#6366F1" },
  { name: "Dinheiro", value: 230, color: "#F59E0B" },
];

const TOP_SERVICES = [
  { name: "Corte & Styling Personalizado", count: 42, revenue: 5040 },
  { name: "Escova Modelada & Nutrição", count: 38, revenue: 3420 },
  { name: "Alongamento em Gel", count: 21, revenue: 3780 },
  { name: "Design de Sobrancelha", count: 34, revenue: 2210 },
];

const TOP_PRODUCTS = [
  { name: "Kit Shampoo & Máscara Cronograma", sold: 18, stock: 8, revenue: 2520, profit: 1350 },
  { name: "Óleo Reparador Iluminador", sold: 14, stock: 2, revenue: 1190, profit: 742 },
  { name: "Brinco Gota Zircônia", sold: 9, stock: 5, revenue: 621, profit: 396 },
];

const TEAM_COMMISSIONS = [
  { name: "Camila Rocha", servicesDone: 52, generated: 5800, commission: 2320 },
  { name: "Juliana Mendes", servicesDone: 44, generated: 4100, commission: 2050 },
  { name: "Beatriz Lima", servicesDone: 36, generated: 3200, commission: 1280 },
];

const MONTHLY_PLANS: MonthlyPlan[] = [
  {
    id: "mp1",
    customer_id: "c1",
    customer: { id: "c1", full_name: "Mariana Albuquerque", phone: "11988887777", created_at: "" },
    name: "Pacote 4 Escovas / Mês",
    monthly_fee: 320,
    due_day: 10,
    total_sessions: 4,
    used_sessions: 3,
    status: "PAGO",
    created_at: "",
  },
  {
    id: "mp2",
    customer_id: "c2",
    customer: { id: "c2", full_name: "Luciana Vasconcelos", phone: "11977776666", created_at: "" },
    name: "Pé e Mão Semanal VIP",
    monthly_fee: 280,
    due_day: 15,
    total_sessions: 4,
    used_sessions: 2,
    status: "PENDENTE",
    created_at: "",
  },
  {
    id: "mp3",
    customer_id: "c3",
    customer: { id: "c3", full_name: "Patrícia Diniz", phone: "11966665555", created_at: "" },
    name: "Cronograma Capilar Completo",
    monthly_fee: 450,
    due_day: 5,
    total_sessions: 4,
    used_sessions: 4,
    status: "ATRASADO",
    created_at: "",
  },
];

export function FinanceDashboard() {
  const [filterPeriod, setFilterPeriod] = useState<"HOJE" | "SEMANA" | "MES">("MES");

  // Totais Consolidados
  const totalGrossRevenue = 15640;
  const servicesRevenue = 11210;
  const productsRevenue = 3380;
  const monthlyPlansRevenue = 1050;
  const productsProfit = 1840;
  const averageTicket = 148.95;

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Categoria,Faturamento,Participacao\n" +
      `Serviços,${servicesRevenue},71.6%\n` +
      `Produtos Revenda,${productsRevenue},21.6%\n` +
      `Planos Mensalistas,${monthlyPlansRevenue},6.7%\n` +
      `Total Bruto,${totalGrossRevenue},100%\n`;

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
      phone: plan.customer.phone,
      customerName: plan.customer.full_name,
      planName: plan.name,
      dueDay: plan.due_day,
      monthlyFee: plan.monthly_fee,
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
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +14.2% em relação ao mês anterior
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
              Margem média de 54.4%
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
              105 comandas fechadas
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
              <p className="text-xs text-charcoal-400">Entradas acumuladas ao longo do mês</p>
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              Meta Batida 94%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TIMELINE}>
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
        </div>

        {/* Distribuição por Forma de Pagamento */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
              Formas de Pagamento
            </h3>
            <p className="text-xs text-charcoal-400 mb-4">Divisão do volume de caixa</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PAYMENT_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PAYMENT_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-charcoal-100">
            {PAYMENT_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-charcoal-600">{item.name}</span>
                </div>
                <strong className="text-charcoal-800 tabular-nums">{formatCurrency(item.value)}</strong>
              </div>
            ))}
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

          <div className="space-y-3">
            {TOP_SERVICES.map((srv, idx) => (
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
                    <div className="text-[10px] text-charcoal-400">{srv.count} atendimentos</div>
                  </div>
                </div>
                <strong className="text-charcoal-800 tabular-nums">{formatCurrency(srv.revenue)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Top Produtos com Alerta de Estoque */}
        <div className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft">
          <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
            Produtos Mais Vendidos (Revenda)
          </h3>
          <p className="text-xs text-charcoal-400 mb-4">Volume e lucro de revenda de cosméticos e semi-joias</p>

          <div className="space-y-3">
            {TOP_PRODUCTS.map((prod) => (
              <div
                key={prod.name}
                className="p-3 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/70 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-charcoal-800">{prod.name}</div>
                  <div className="flex items-center gap-2 text-[10px] text-charcoal-400 mt-0.5">
                    <span>{prod.sold} vendidos</span>
                    {prod.stock <= 3 && (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Restam {prod.stock} un
                      </span>
                    )}
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
            3 Mensalistas Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MONTHLY_PLANS.map((plan) => {
            const usagePercent = (plan.used_sessions / plan.total_sessions) * 100;
            return (
              <div
                key={plan.id}
                className="p-4 rounded-2xl border border-charcoal-200 bg-charcoal-50/60 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        plan.status === "PAGO"
                          ? "bg-emerald-100 text-emerald-700"
                          : plan.status === "PENDENTE"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {plan.status}
                    </span>
                    <span className="text-[11px] text-charcoal-400 font-medium">
                      Vencimento dia {plan.due_day}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-charcoal-800">
                    {plan.customer?.full_name}
                  </h4>
                  <p className="text-[11px] text-rose-600 font-medium">{plan.name}</p>
                </div>

                {/* Progress bar of sessions */}
                <div>
                  <div className="flex justify-between text-[11px] text-charcoal-500 mb-1">
                    <span>Sessões Utilizadas:</span>
                    <strong className="text-charcoal-800">
                      {plan.used_sessions} de {plan.total_sessions}
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
                    {formatCurrency(plan.monthly_fee)}/mês
                  </span>
                  {plan.status !== "PAGO" && (
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
      </div>

      {/* Resumo de Comissões por Profissional */}
      <div className="p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-soft">
        <h3 className="font-serif text-base font-bold text-charcoal-800 mb-1">
          Fechamento de Comissões da Equipe
        </h3>
        <p className="text-xs text-charcoal-400 mb-4">Repasses calculados com base nos serviços concluídos</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEAM_COMMISSIONS.map((member) => (
            <div
              key={member.name}
              className="p-3.5 rounded-2xl bg-charcoal-50 border border-charcoal-200 text-xs space-y-1.5"
            >
              <div className="font-bold text-charcoal-800">{member.name}</div>
              <div className="text-[11px] text-charcoal-500">
                {member.servicesDone} procedimentos realizados
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-charcoal-200 text-charcoal-600">
                <span>Faturamento Gerado:</span>
                <span className="tabular-nums">{formatCurrency(member.generated)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-600">
                <span>Comissão a Pagar:</span>
                <span className="tabular-nums">{formatCurrency(member.commission)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
