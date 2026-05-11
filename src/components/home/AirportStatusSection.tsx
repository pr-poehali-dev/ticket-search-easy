import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const AIRPORT_STATUS_API = "https://functions.poehali.dev/d59d455f-da30-4c36-b8cc-878db1ba737a";

type AirportStatus = {
  airport: string;
  city: string;
  status: "restriction" | "resume";
  restrictedAt: string;
  resumedAt: string;
};

export default function AirportStatusSection() {
  const [airportItems, setAirportItems] = useState<AirportStatus[]>([]);
  const [airportLoading, setAirportLoading] = useState(true);
  const [rotateOffset, setRotateOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadStatuses = () => {
      fetch(`${AIRPORT_STATUS_API}?t=${Date.now()}`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data?.items)) setAirportItems(data.items);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setAirportLoading(false);
        });
    };
    loadStatuses();
    const statusTimer = setInterval(loadStatuses, 30000);

    return () => {
      cancelled = true;
      clearInterval(statusTimer);
    };
  }, []);

  // Ротация карточек аэропортов: показываем максимум 3, листаем каждые 5 секунд
  useEffect(() => {
    if (airportItems.length <= 3) {
      setRotateOffset(0);
      return;
    }
    const t = setInterval(() => {
      setRotateOffset((prev) => (prev + 3) % airportItems.length);
    }, 5000);
    return () => clearInterval(t);
  }, [airportItems.length]);

  const visibleAirports: AirportStatus[] = (() => {
    if (airportItems.length === 0) return [];
    const result: AirportStatus[] = [];
    for (let i = 0; i < Math.min(3, airportItems.length); i++) {
      result.push(airportItems[(rotateOffset + i) % airportItems.length]);
    }
    return result;
  })();

  if (airportItems.length === 0 && !airportLoading) return null;

  return (
    <section className="px-6 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="Plane" size={16} className="text-[#8a8a8a]" />
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] font-['IBM_Plex_Mono']">
            Статус аэропортов России
          </h2>
        </div>
        <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              airportLoading
                ? "bg-[#c0c0bc] animate-pulse"
                : "bg-[#7B9D52] animate-pulse"
            }`}
          />
          REAL-TIME
        </span>
      </div>

      {airportLoading && airportItems.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#e8e8e6] rounded-2xl p-4 animate-pulse h-28"
            />
          ))}
        </div>
      ) : airportItems.length === 0 ? (
        <div className="bg-white border border-[#e8e8e6] rounded-2xl p-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#7B9D52]/10 flex items-center justify-center">
            <Icon name="Check" size={16} className="text-[#7B9D52]" />
          </div>
          <p className="text-sm text-[#111]">
            Все аэропорты работают штатно.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {visibleAirports.map((it) => {
            const isResume = it.status === "resume";
            return (
              <div
                key={`${it.airport}-${rotateOffset}`}
                className={`bg-white border rounded-2xl p-4 transition-all duration-500 ${
                  isResume
                    ? "border-[#7B9D52]/30"
                    : "border-[#c97a2b]/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isResume ? "bg-[#7B9D52]" : "bg-[#c97a2b] animate-pulse"
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-[0.15em] font-['IBM_Plex_Mono'] font-medium ${
                      isResume ? "text-[#7B9D52]" : "text-[#c97a2b]"
                    }`}
                  >
                    {isResume ? "ОТКРЫТ" : "ЗАКРЫТ"}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-[15px] font-semibold text-[#111] leading-tight">
                    {it.airport}
                  </p>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {it.city}
                  </p>
                </div>
                <div className="space-y-1 pt-2 border-t border-[#f0f0ee]">
                  {it.restrictedAt && (
                    <div className="flex items-center justify-between text-[10px] font-['IBM_Plex_Mono']">
                      <span className="text-[#c0c0bc]">ВВЕДЕНО</span>
                      <span className="text-[#444]">
                        {it.restrictedAt}
                      </span>
                    </div>
                  )}
                  {it.resumedAt && (
                    <div className="flex items-center justify-between text-[10px] font-['IBM_Plex_Mono']">
                      <span className="text-[#c0c0bc]">СНЯТО</span>
                      <span className="text-[#7B9D52]">
                        {it.resumedAt}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {airportItems.length > 3 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: Math.ceil(airportItems.length / 3) }).map(
            (_, i) => {
              const active = i === Math.floor(rotateOffset / 3);
              return (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    active ? "w-6 bg-[#111]" : "w-1.5 bg-[#d4d4d2]"
                  }`}
                />
              );
            },
          )}
        </div>
      )}
    </section>
  );
}
