import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ticketsApi, TicketSummary } from "@/hooks/useTickets";
import TicketChat from "./TicketChat";

export default function CabinetTicketsTab() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const load = async () => {
    try {
      const list = await ticketsApi.list();
      setTickets(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (activeId !== null) {
    return (
      <TicketChat
        ticketId={activeId}
        isAdmin={false}
        onBack={() => {
          setActiveId(null);
          load();
        }}
        onUpdated={load}
      />
    );
  }

  if (loading) {
    return <div className="text-[#8a8a8a] text-sm">Загрузка обращений…</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white border border-[#e8e8e6] rounded-2xl p-10 text-center">
        <div className="w-14 h-14 bg-[#f7f7f6] rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Inbox" size={24} className="text-[#8a8a8a]" />
        </div>
        <h3 className="text-lg font-semibold text-[#111] mb-2">У вас пока нет обращений</h3>
        <p className="text-sm text-[#8a8a8a] mb-5">
          Напишите нам через форму обратной связи — здесь появится переписка и ответ.
        </p>
        <Link
          to="/contacts"
          className="inline-flex items-center gap-2 bg-[#7B9D52] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#6b8a47] transition-colors"
        >
          <Icon name="MessageSquarePlus" size={16} />
          Создать обращение
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] font-['IBM_Plex_Mono']">
          Мои обращения · {tickets.length}
        </h2>
        <Link
          to="/contacts"
          className="text-xs flex items-center gap-1.5 text-[#111] hover:text-[#7B9D52] transition-colors"
        >
          <Icon name="Plus" size={14} />
          Новое
        </Link>
      </div>

      {tickets.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveId(t.id)}
          className="w-full text-left bg-white border border-[#e8e8e6] rounded-2xl p-5 hover:border-[#111] transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#8a8a8a]">№{t.id}</span>
                <span
                  className={`text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded font-['IBM_Plex_Mono'] ${
                    t.status === "open"
                      ? "bg-[#7B9D52]/10 text-[#5f7d3e]"
                      : "bg-[#f0f0ee] text-[#8a8a8a]"
                  }`}
                >
                  {t.status === "open" ? "Открыто" : "Закрыто"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#111] truncate">{t.subject}</h3>
              <p className="text-xs text-[#8a8a8a] mt-1">
                {t.department} · обновлено{" "}
                {new Date(t.updated_at).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#8a8a8a]">
              <Icon name="MessageSquare" size={14} />
              {t.messages_count}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
