const TICKETS_URL = "https://functions.poehali.dev/e973cfa3-8185-4902-8a7f-4be21552d0fd";

export interface TicketSummary {
  id: number;
  user_id: number;
  subject: string;
  department: string;
  city: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  messages_count: number;
}

export interface TicketFull {
  id: number;
  user_id: number;
  subject: string;
  department: string;
  city: string;
  contact_phone: string;
  contact_email: string;
  contact_position: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_phone: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number | null;
  author_role: "user" | "admin";
  body: string;
  created_at: string;
}

export interface CreateTicketPayload {
  subject: string;
  message: string;
  department?: string;
  city?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_position?: string;
}

function getToken(): string | null {
  return localStorage.getItem("kompas_token");
}

async function call(path: string, init?: RequestInit) {
  const token = getToken();
  if (!token) throw new Error("Требуется авторизация");
  const r = await fetch(`${TICKETS_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": token,
      ...(init?.headers || {}),
    },
  });
  const raw = await r.json();
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!r.ok) {
    throw new Error(data?.error || "Ошибка запроса");
  }
  return data;
}

export const ticketsApi = {
  async list(status?: "open" | "closed"): Promise<TicketSummary[]> {
    const q = status ? `&status=${status}` : "";
    const data = await call(`?action=list${q}`);
    return data.tickets || [];
  },

  async get(id: number): Promise<{ ticket: TicketFull; messages: TicketMessage[] }> {
    return call(`?action=get&id=${id}`);
  },

  async create(payload: CreateTicketPayload): Promise<{ ticket: TicketFull; messages: TicketMessage[] }> {
    return call(`?action=create`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async sendMessage(ticketId: number, body: string): Promise<{ ticket: TicketFull; messages: TicketMessage[] }> {
    return call(`?action=message&id=${ticketId}`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  async close(ticketId: number) {
    return call(`?action=close&id=${ticketId}`, { method: "POST", body: "{}" });
  },

  async reopen(ticketId: number) {
    return call(`?action=reopen&id=${ticketId}`, { method: "POST", body: "{}" });
  },
};

export const ADMIN_EMAIL = "centr.mol89@bk.ru";

export function isAdminEmail(email?: string | null): boolean {
  return (email || "").trim().toLowerCase() === ADMIN_EMAIL;
}
