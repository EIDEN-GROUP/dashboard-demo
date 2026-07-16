export type Profile = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  parent_name: string;
  child_name: string;
  child_age: string;
  email: string;
  email2: string;
  phone: string;
  phone2: string;
  cin: string;
  father_name: string;
  mother_name: string;
  cin_mother: string;
  profession_father: string;
  profession_mother: string;
  address: string;
  child_names: ChildInfo[];
  subscribed_frais: string[];
  dob: string;
  level: string;
  crm_stage: "nouveau" | "converti";
  payment_status: "en_attente" | "paye";
  monthly_fee: number;
  debt: number;
  overdue: boolean;
  payment_day: number;
  notes: string;
  whatsapp_optin: boolean;
  created_at: string;
  updated_at: string;
};

export type ChildInfo = {
  name: string;
  dob: string;
  cycle: string;
  level: string;
  services: string[];
  frais: string[];
};

export type Payment = {
  id: string;
  client_id: string;
  amount: number;
  date: string;
  mode: "especes" | "virement" | "carte" | "cheque";
  period: string;
  receipt: string;
  invoice_sent: boolean;
  notes: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  type: "contact" | "rdv";
  status: "nouveau" | "contacte" | "converti";
  age: string;
  message: string;
  date_table: string;
  date_detail: string;
  created_at: string;
  updated_at: string;
};

export type Employee = {
  id: string;
  full_name: string;
  position: string;
  department: string;
  email: string;
  personal_email: string;
  phone: string;
  phone2: string;
  cin: string;
  birth_date: string;
  hire_date: string;
  address: string;
  contract_type: string;
  status: "actif" | "inactif";
  created_at: string;
  updated_at: string;
};

export type Planification = {
  id: string;
  date: string;
  time: string;
  title: string;
  detail: string;
  tone: "violet" | "emerald" | "amber" | "zinc";
  created_at: string;
  updated_at: string;
};

export type WhatsAppMessage = {
  id: string;
  client_id: string | null;
  phone: string;
  direction: "sent" | "received";
  content: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  wa_message_id: string;
  broadcast_id: string | null;
  created_at: string;
};

export type EmailLog = {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  status: "sent" | "failed";
  error_msg: string;
  created_at: string;
};

export type Level = {
  id: string;
  name: string;
  cycle: string;
  monthly_fee: number;
  max_students: number;
  created_at: string;
  updated_at: string;
};

export type Setting = {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
};

export type DashboardStats = {
  total_clients: number;
  paid_this_month: number;
  total_debt: number;
  total_revenue: number;
  active_clients: number;
  overdue_count: number;
};
