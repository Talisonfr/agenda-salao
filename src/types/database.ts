export type UserRole = 'admin' | 'professional';

export type ServiceCategory = 
  | 'CABELO' 
  | 'UNHAS' 
  | 'ESTETICA' 
  | 'SOBRANCELHA' 
  | 'MAQUIAGEM' 
  | 'OUTROS';

export type ProductCategory = 'COSMETICOS' | 'SEMIJOIAS' | 'KITS_CAPILARES';

export type AppointmentStatus = 
  | 'PENDENTE_APROVACAO'
  | 'EM_NEGOCIACAO'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'RECUSADO'
  | 'LISTA_ESPERA'
  | 'CANCELADO';

export type AppointmentSource = 'PUBLICO' | 'INTERNO';

export type PaymentMethod = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO' | 'PLANO';

export type PlanPaymentStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO';

export type StockMovementType = 'ENTRADA' | 'SAIDA_VENDA' | 'AJUSTE';

export type TransactionItemKind = 'SERVICO' | 'PRODUTO' | 'PLANO';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  active: boolean;
  color: string;
  can_view_all_agenda: boolean;
  accepts_bookings: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description?: string | null;
  price: number;
  duration_minutes: number;
  commission_pct: number;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  cost_price: number;
  sale_price: number;
  stock_qty: number;
  min_stock: number;
  active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  birth_date?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface MonthlyPlan {
  id: string;
  customer_id: string;
  customer?: Customer;
  name: string;
  monthly_price: number;
  sessions_per_month: number;
  sessions_used: number;
  due_day: number;
  reference_month: string;
  payment_status: PlanPaymentStatus;
  paid_at?: string | null;
  active: boolean;
  created_at: string;
}

export interface AppointmentItem {
  id: string;
  appointment_id: string;
  service_id?: string | null;
  service_name: string;
  price: number;
  duration_minutes: number;
  commission_pct: number;
}

export interface Appointment {
  id: string;
  customer_id: string;
  customer?: Customer;
  professional_id?: string | null;
  professional?: Profile;
  status: AppointmentStatus;
  source: AppointmentSource;
  requested_date: string; // YYYY-MM-DD
  requested_from: string; // HH:mm:ss
  requested_to: string;   // HH:mm:ss
  starts_at?: string | null;
  ends_at?: string | null;
  duration_minutes: number;
  total_price: number;
  customer_notes?: string | null;
  internal_notes?: string | null;
  proposal_message?: string | null;
  proposed_options: Array<{ date: string; time: string; professional_id?: string }>;
  decline_reason?: string | null;
  items?: AppointmentItem[];
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  appointment_id?: string | null;
  customer_id?: string | null;
  monthly_plan_id?: string | null;
  payment_method: PaymentMethod;
  installments: number;
  fee_pct: number;
  subtotal: number;
  discount: number;
  fee_amount: number;
  total: number;
  notes?: string | null;
  created_by?: string | null;
  occurred_at: string;
  created_at: string;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  kind: TransactionItemKind;
  service_id?: string | null;
  product_id?: string | null;
  monthly_plan_id?: string | null;
  professional_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  commission_pct: number;
  covered_by_plan: boolean;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  unit_cost?: number | null;
  note?: string | null;
  transaction_id?: string | null;
  created_by?: string | null;
  created_at: string;
}
