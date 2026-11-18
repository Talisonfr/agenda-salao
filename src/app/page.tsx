import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Clock, Scissors } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-charcoal-50 flex flex-col justify-between">
      {/* Top Boutique Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-charcoal-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-300 flex items-center justify-center text-rose-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-charcoal-800">
              Maison de Beauté
            </span>
            <span className="block text-[10px] tracking-widest uppercase text-charcoal-400 font-medium">
              Atelier & Spa
            </span>
          </div>
        </div>

        <Link
          href="/admin/agenda"
          className="text-xs font-semibold text-charcoal-600 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-full border border-charcoal-200 hover:border-rose-300"
        >
          Painel Gestora
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-md mx-auto w-full px-6 pt-10 pb-16 flex flex-col justify-center text-center">
        <div className="inline-flex items-center self-center space-x-2 px-3 py-1 rounded-full bg-rose-100/70 border border-rose-200 text-rose-700 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Experiência Exclusiva & Personalizada</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal-800 tracking-tight leading-[1.15] mb-4">
          Realce sua beleza no seu melhor tempo.
        </h1>

        <p className="text-charcoal-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Cabelos, unhas, estética e bem-estar em um ambiente acolhedor e sofisticado. Escolha seus serviços e solicite seu horário com facilidade.
        </p>

        {/* Action Button */}
        <div className="space-y-3">
          <Link
            href="/agendar"
            className="w-full flex items-center justify-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white font-medium py-4 px-6 rounded-2xl shadow-luxury hover:shadow-lg transition-all active:scale-[0.98] text-base"
          >
            <Calendar className="w-5 h-5" />
            <span>Solicitar Agendamento</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <p className="text-[11px] text-charcoal-400">
            Sem cadastro complicado. Confirmação direta pelo seu WhatsApp.
          </p>
        </div>

        {/* Highlights */}
        <div className="mt-12 grid grid-cols-3 gap-3 pt-8 border-t border-charcoal-200/80">
          <div className="p-3 rounded-xl bg-white border border-charcoal-200/60 shadow-soft flex flex-col items-center">
            <Clock className="w-5 h-5 text-rose-500 mb-1" />
            <span className="text-[11px] font-semibold text-charcoal-700">Sem Filas</span>
            <span className="text-[10px] text-charcoal-400">Horários precisos</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-charcoal-200/60 shadow-soft flex flex-col items-center">
            <Scissors className="w-5 h-5 text-rose-500 mb-1" />
            <span className="text-[11px] font-semibold text-charcoal-700">Especialistas</span>
            <span className="text-[10px] text-charcoal-400">Equipe sênior</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-charcoal-200/60 shadow-soft flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-rose-500 mb-1" />
            <span className="text-[11px] font-semibold text-charcoal-700">Boutique</span>
            <span className="text-[10px] text-charcoal-400">Produtos premium</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-charcoal-400 border-t border-charcoal-200/60 safe-bottom">
        Maison de Beauté © Todos os direitos reservados.
      </footer>
    </main>
  );
}
