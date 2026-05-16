import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const AIRPORT_STATUS_API =
  "https://functions.poehali.dev/d59d455f-da30-4c36-b8cc-878db1ba737a";

type AirportStatus = {
  airport: string;
  city: string;
  status: "restriction" | "resume";
  restrictedAt: string;
  resumedAt: string;
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AirportTicker() {
  const [items, setItems] = useState<AirportStatus[]>([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch(`${AIRPORT_STATUS_API}?t=${Date.now()}`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          const list = Array.isArray(data?.items) ? data.items : [];
          // оставляем только активные ограничения
          const active = list.filter(
            (i: AirportStatus) => i.status === "restriction",
          );
          setItems(active);
        })
        .catch(() => {});
    };

    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (hidden || items.length === 0) return null;

  const phrases = items.map((i) => {
    const when = formatDate(i.restrictedAt);
    return `${i.airport} (${i.city}) — ограничения с ${when || "сегодня"}`;
  });
  // дублируем для бесшовной прокрутки
  const line = phrases.concat(phrases).join("   •   ");

  return (
    <div className="px-3 sm:px-6 pt-2 animate-ticker-drop">
      <div className="max-w-6xl mx-auto bg-[#fff3c4] border border-[#f0d97a] text-[#7a5a00] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 pr-2">
          <div className="flex-shrink-0 flex items-center gap-2 pl-4 py-2 bg-[#ffe680] rounded-l-2xl">
            <Icon name="TriangleAlert" size={14} className="text-[#7a5a00]" />
          </div>

          <div className="flex-1 overflow-hidden py-2">
            <div
              className="whitespace-nowrap animate-ticker text-sm font-medium"
              style={{ animationDuration: `${Math.max(20, phrases.length * 8)}s` }}
            >
              {line}
            </div>
          </div>

          <button
            onClick={() => setHidden(true)}
            aria-label="Скрыть"
            className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-[#ffe680] flex items-center justify-center text-[#7a5a00]"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}