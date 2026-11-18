import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned.startsWith("55") && (cleaned.length === 10 || cleaned.length === 11)) {
    cleaned = "55" + cleaned;
  }
  return cleaned;
}

export function buildWhatsAppNegotiationLink(params: {
  phone: string;
  customerName: string;
  serviceNames: string[];
  requestedDate: string;
  requestedTime: string;
  proposals: string[];
}): string {
  const cleanPhone = cleanPhoneForWhatsApp(params.phone);
  const firstName = params.customerName.trim().split(" ")[0];
  const servicesText = params.serviceNames.join(", ");
  const proposalsText = params.proposals.map((p) => `• ${p}`).join("\n");

  const message = `Olá, *${firstName}*! Tudo bem? ✨\n\nRecebemos seu pedido de agendamento no salão para *${servicesText}* no dia *${params.requestedDate}* às *${params.requestedTime}*.\n\nPara esse horário específico nossa grade já estava preenchida, mas separamos estas opções perfeitas para você:\n\n${proposalsText}\n\nQual desses horários você prefere confirmar? 💕`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppReminderLink(params: {
  phone: string;
  customerName: string;
  planName: string;
  dueDay: number;
  monthlyFee: number;
}): string {
  const cleanPhone = cleanPhoneForWhatsApp(params.phone);
  const firstName = params.customerName.trim().split(" ")[0];
  const feeFormatted = formatCurrency(params.monthlyFee);

  const message = `Olá, *${firstName}*! Tudo bem? ✨\n\nPassando para lembrar que a mensalidade do seu plano *${params.planName}* no valor de *${feeFormatted}* está com vencimento no dia *${params.dueDay}*.\n\nQualquer dúvida estamos à disposição! 💕`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
