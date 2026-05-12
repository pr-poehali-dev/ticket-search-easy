import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { ticketsApi, TicketSummary } from "@/hooks/useTickets";
import TicketChat from "./TicketChat";

type Filter = "all" | "open" | "closed";

export default function CabinetAdminTab() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = async () => {
    try {
      const list = await ticketsApi.list(filter === "all" ? undefined : filter);
      setTickets(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  if (activeId !== null) {
    return (
      <TicketChat
        ticketId={activeId}
        isAdmin={true}
        onBack={() => {
          setActiveId(null);
          load();
        }}
        onUpdated={load}
      />
    );
  }

  const openCount = tickets.filter((t) => t.status === "open").length;
  const closedCount = tickets.filter((t) => t.status === "closed").length;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#7B9D52] to-[#5f7d3e] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Icon name="ShieldCheck" size={18} />
          <span className="text-xs font-['IBM_Plex_Mono'] tracking-wider uppercase">Панель администратора</span>
        </div>
        <p className="text-sm text-white/80">
          Все обращения пользователей. Отвечайте, закрывайте и распечатывайте справки.
        </p>
        {!loading && (
          <div className="flex gap-4 mt-3 text-xs text-white/90">
            <span>Открытых: <b>{openCount}</b></span>
            <span>Закрытых: <b>{closedCount}</b></span>
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-white/60 rounded-xl p-1 w-fit border border-[#e8e8e6]">
        {(["all", "open", "closed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === f ? "bg-[#111] text-white" : "text-[#8a8a8a] hover:text-[#111]"
            }`}
          >
            {f === "all" ? "Все" : f === "open" ? "Открытые" : "Закрытые"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-[#8a8a8a] text-sm">Загрузка обращений…</div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-[#e8e8e6] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-[#f7f7f6] rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Inbox" size={24} className="text-[#8a8a8a]" />
          </div>
          <h3 className="text-base font-semibold text-[#111] mb-1">
            Обращений нет
          </h3>
          <p className="text-sm text-[#8a8a8a]">Здесь появятся новые обращения от пользователей.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className="w-full text-left bg-white border border-[#e8e8e6] rounded-2xl p-4 hover:border-[#111] transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                    <span className="text-[10px] text-[#8a8a8a]">{t.department}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#111] truncate">{t.subject}</h3>
                  <p className="text-xs text-[#8a8a8a] mt-1 truncate">
                    {t.user_last_name} {t.user_first_name} · {t.user_email}
                    {t.city ? ` · ${t.city}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-[#8a8a8a] justify-end">
                    <Icon name="MessageSquare" size={12} />
                    {t.messages_count}
                  </div>
                  <div className="text-[10px] text-[#c0c0bc] mt-1 font-['IBM_Plex_Mono']">
                    {new Date(t.updated_at).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
