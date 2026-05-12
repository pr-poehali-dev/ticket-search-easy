import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  ticketsApi,
  TicketFull,
  TicketMessage,
} from "@/hooks/useTickets";

interface Props {
  ticketId: number;
  isAdmin: boolean;
  onBack: () => void;
  onUpdated?: () => void;
}

export default function TicketChat({ ticketId, isAdmin, onBack, onUpdated }: Props) {
  const [ticket, setTicket] = useState<TicketFull | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await ticketsApi.get(ticketId);
      setTicket(res.ticket);
      setMessages(res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await ticketsApi.sendMessage(ticketId, text.trim());
      setTicket(res.ticket);
      setMessages(res.messages);
      setText("");
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async () => {
    if (!confirm("Закрыть обращение? После этого пользователь не сможет писать.")) return;
    try {
      const res = await ticketsApi.close(ticketId);
      setTicket(res.ticket);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const reopenTicket = async () => {
    try {
      const res = await ticketsApi.reopen(ticketId);
      setTicket(res.ticket);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const printTicket = () => {
    if (!ticket) return;
    const fmtDate = (s: string | null) =>
      s ? new Date(s).toLocaleString("ru-RU") : "—";
    const fio = `${ticket.user_last_name} ${ticket.user_first_name}`.trim() || "—";
    const safe = (v: string) =>
      (v || "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const messagesHtml = messages
      .map(
        (m) => `
        <div class="msg ${m.author_role}">
          <div class="msg-head">${m.author_role === "admin" ? "Администратор" : "Пользователь"} · ${fmtDate(m.created_at)}</div>
          <div class="msg-body">${safe(m.body).replace(/\n/g, "<br>")}</div>
        </div>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Справка по обращению №${ticket.id}</title>
<style>
  body { font-family: Arial, sans-serif; color:#111; max-width:800px; margin:24px auto; padding:0 24px; }
  h1 { font-size:20px; margin:0 0 4px; }
  .sub { color:#666; font-size:12px; margin-bottom:24px; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  th, td { text-align:left; padding:8px 10px; border-bottom:1px solid #e0e0e0; vertical-align:top; font-size:13px; }
  th { width:38%; color:#555; font-weight:600; background:#fafafa; }
  h2 { font-size:14px; margin:24px 0 8px; text-transform:uppercase; letter-spacing:.1em; color:#444; }
  .msg { border:1px solid #e0e0e0; border-radius:8px; padding:10px 12px; margin-bottom:10px; }
  .msg.admin { background:#f5fbe9; border-color:#cfe1a8; }
  .msg-head { font-size:11px; color:#666; margin-bottom:4px; text-transform:uppercase; letter-spacing:.05em; }
  .msg-body { font-size:13px; line-height:1.5; white-space:pre-wrap; }
  .footer { margin-top:32px; font-size:11px; color:#888; border-top:1px solid #e0e0e0; padding-top:12px; }
  @media print { body { margin:0; } .no-print { display:none; } }
</style></head><body>
<h1>Справка по обращению №${ticket.id}</h1>
<div class="sub">Сформировано ${fmtDate(new Date().toISOString())}</div>
<table>
  <tr><th>Подразделение</th><td>${safe(ticket.department)}</td></tr>
  <tr><th>Тема</th><td>${safe(ticket.subject)}</td></tr>
  <tr><th>Статус</th><td>${ticket.status === "open" ? "Открыто" : "Закрыто"}</td></tr>
  <tr><th>Дата создания</th><td>${fmtDate(ticket.created_at)}</td></tr>
  <tr><th>Последнее обновление</th><td>${fmtDate(ticket.updated_at)}</td></tr>
  ${ticket.closed_at ? `<tr><th>Дата закрытия</th><td>${fmtDate(ticket.closed_at)}</td></tr>` : ""}
  <tr><th>ФИО пользователя</th><td>${safe(fio)}</td></tr>
  <tr><th>Email пользователя</th><td>${safe(ticket.user_email)}</td></tr>
  <tr><th>Город</th><td>${safe(ticket.city)}</td></tr>
  <tr><th>Телефон для связи</th><td>${safe(ticket.contact_phone || ticket.user_phone)}</td></tr>
  <tr><th>Email для связи</th><td>${safe(ticket.contact_email || ticket.user_email)}</td></tr>
  <tr><th>Должность / пост</th><td>${safe(ticket.contact_position)}</td></tr>
</table>
<h2>Содержание переписки</h2>
${messagesHtml}
<div class="footer">Документ сформирован автоматически системой обращений.</div>
<div class="no-print" style="margin-top:24px;text-align:center;">
  <button onclick="window.print()" style="padding:10px 20px;background:#111;color:#fff;border:0;border-radius:8px;cursor:pointer;font-size:14px;">Печать</button>
</div>
<script>setTimeout(function(){window.print();}, 400);</script>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  };

  const downloadTicket = () => {
    if (!ticket) return;
    const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleString("ru-RU") : "—");
    const lines = [
      `СПРАВКА ПО ОБРАЩЕНИЮ №${ticket.id}`,
      `Сформировано: ${fmtDate(new Date().toISOString())}`,
      ``,
      `Подразделение:        ${ticket.department}`,
      `Тема:                 ${ticket.subject}`,
      `Статус:               ${ticket.status === "open" ? "Открыто" : "Закрыто"}`,
      `Дата создания:        ${fmtDate(ticket.created_at)}`,
      `Последнее обновление: ${fmtDate(ticket.updated_at)}`,
      ticket.closed_at ? `Дата закрытия:        ${fmtDate(ticket.closed_at)}` : "",
      ``,
      `ДАННЫЕ ПОЛЬЗОВАТЕЛЯ`,
      `ФИО:                  ${ticket.user_last_name} ${ticket.user_first_name}`.trim(),
      `Email:                ${ticket.user_email}`,
      `Город:                ${ticket.city || "—"}`,
      ``,
      `КОНТАКТЫ ДЛЯ ОБРАТНОЙ СВЯЗИ`,
      `Телефон:              ${ticket.contact_phone || ticket.user_phone || "—"}`,
      `Email:                ${ticket.contact_email || ticket.user_email}`,
      `Должность / пост:     ${ticket.contact_position || "—"}`,
      ``,
      `СОДЕРЖАНИЕ ПЕРЕПИСКИ`,
      ``,
      ...messages.map(
        (m) =>
          `[${fmtDate(m.created_at)}] ${m.author_role === "admin" ? "АДМИНИСТРАТОР" : "ПОЛЬЗОВАТЕЛЬ"}:\n${m.body}\n`,
      ),
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `обращение-${ticket.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-[#8a8a8a] text-sm">Загрузка обращения…</div>;
  }

  if (!ticket) {
    return (
      <div className="text-[#8a8a8a] text-sm">
        Обращение не найдено.{" "}
        <button onClick={onBack} className="underline">Назад</button>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";
  const canWrite = !isClosed;

  return (
    <div className="bg-white border border-[#e8e8e6] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#e8e8e6] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-[#8a8a8a] hover:text-[#111] transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            К списку
          </button>
          <span
            className={`text-[10px] font-medium tracking-wider uppercase font-['IBM_Plex_Mono'] px-2 py-1 rounded ${
              isClosed
                ? "bg-[#f0f0ee] text-[#8a8a8a]"
                : "bg-[#7B9D52]/10 text-[#5f7d3e]"
            }`}
          >
            {isClosed ? "Закрыто" : "Открыто"} · №{ticket.id}
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-[#111] leading-tight mb-1">
          {ticket.subject}
        </h2>
        <p className="text-xs text-[#8a8a8a]">
          {ticket.department}
          {ticket.city ? ` · ${ticket.city}` : ""}
        </p>

        {isAdmin && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#f7f7f6] rounded-lg p-2">
              <div className="text-[10px] uppercase tracking-wider text-[#8a8a8a] font-['IBM_Plex_Mono']">Пользователь</div>
              <div className="text-[#111] font-medium truncate">
                {ticket.user_last_name} {ticket.user_first_name}
              </div>
              <div className="text-[#8a8a8a] truncate">{ticket.user_email}</div>
            </div>
            <div className="bg-[#f7f7f6] rounded-lg p-2">
              <div className="text-[10px] uppercase tracking-wider text-[#8a8a8a] font-['IBM_Plex_Mono']">Контакты</div>
              <div className="text-[#111] truncate">{ticket.contact_phone || ticket.user_phone || "—"}</div>
              <div className="text-[#8a8a8a] truncate">{ticket.contact_position || "—"}</div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={printTicket}
              className="flex items-center gap-1.5 text-xs bg-[#111] text-white px-3 py-2 rounded-lg hover:bg-[#333] transition-colors"
            >
              <Icon name="Printer" size={13} />
              Печать справки
            </button>
            <button
              onClick={downloadTicket}
              className="flex items-center gap-1.5 text-xs bg-white border border-[#e8e8e6] text-[#111] px-3 py-2 rounded-lg hover:border-[#111] transition-colors"
            >
              <Icon name="Download" size={13} />
              Скачать .txt
            </button>
            {isClosed ? (
              <button
                onClick={reopenTicket}
                className="flex items-center gap-1.5 text-xs bg-white border border-[#e8e8e6] text-[#111] px-3 py-2 rounded-lg hover:border-[#111] transition-colors"
              >
                <Icon name="RotateCcw" size={13} />
                Переоткрыть
              </button>
            ) : (
              <button
                onClick={closeTicket}
                className="flex items-center gap-1.5 text-xs bg-white border border-red-200 text-red-700 px-3 py-2 rounded-lg hover:border-red-400 transition-colors"
              >
                <Icon name="Lock" size={13} />
                Закрыть обращение
              </button>
            )}
          </div>
        )}
      </div>

      {!isAdmin && !isClosed && (
        <div className="bg-[#f3efff] border-t border-[#d9cfff] px-4 sm:px-5 py-2.5 flex gap-2 items-start text-xs text-[#4a3d8a]">
          <Icon name="Sparkles" size={13} className="mt-0.5 flex-shrink-0" />
          <span>
            Первым отвечает ИИ-ассистент <b>Гоша</b>. Это автоматический ответ — он может содержать неточности.
            По возвратам, оплате и спорным вопросам подключится специалист поддержки.
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="p-4 sm:p-5 space-y-3 max-h-[480px] overflow-y-auto bg-[#fafafa]">
        {messages.map((m) => {
          const mine = isAdmin ? m.author_role === "admin" : m.author_role === "user";
          const isAi = m.author_role === "ai";
          const label =
            m.author_role === "admin"
              ? "Администратор"
              : m.author_role === "ai"
              ? "Ассистент"
              : "Пользователь";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  mine
                    ? "bg-[#7B9D52] text-white"
                    : isAi
                    ? "bg-[#f3efff] border border-[#d9cfff] text-[#111]"
                    : "bg-white border border-[#e8e8e6] text-[#111]"
                }`}
              >
                <div className={`text-[10px] uppercase tracking-wider mb-1 font-['IBM_Plex_Mono'] flex items-center gap-1 ${mine ? "text-white/70" : isAi ? "text-[#7a5af8]" : "text-[#8a8a8a]"}`}>
                  {isAi && <Icon name="Sparkles" size={11} />}
                  {label} ·{" "}
                  {new Date(m.created_at).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-[#e8e8e6] p-4">
        {canWrite ? (
          <form onSubmit={send} className="flex gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isAdmin ? "Ответ пользователю..." : "Сообщение..."}
              rows={2}
              className="flex-1 border border-[#e8e8e6] rounded-xl px-4 py-2.5 text-sm text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="bg-[#111] text-white px-4 rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              <Icon name="Send" size={16} />
            </button>
          </form>
        ) : (
          <div className="text-center text-sm text-[#8a8a8a] py-2">
            <Icon name="Lock" size={14} className="inline mr-1.5 -mt-0.5" />
            Обращение закрыто, отправка сообщений недоступна.
          </div>
        )}
        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}