import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const WEATHER_API = "https://functions.poehali.dev/f1cb531b-1e57-49a1-a494-e158a960aa31";

type WeatherSpot = {
  city: string;
  temp: string;
  cond: string;
  icon: string;
};

const travelTips = [
  {
    icon: "ShieldCheck",
    title: "Страховка",
    text: "Оформляйте за 1–2 дня до вылета — так покрытие начнётся ещё до выхода из дома.",
  },
  {
    icon: "Wallet",
    title: "Деньги в поездке",
    text: "Берите 2 карты разных банков и немного наличных в долларах или евро.",
  },
  {
    icon: "Smartphone",
    title: "eSIM вместо роуминга",
    text: "Подключите eSIM до вылета — выйдет в 5–10 раз дешевле роуминга.",
  },
  {
    icon: "Clock",
    title: "Приезжайте заранее",
    text: "В аэропорту — за 2 часа на внутренний рейс, за 3 часа на международный.",
  },
];

const fallbackWeather: WeatherSpot[] = [
  { city: "Дубай", temp: "—", cond: "Загружаем…", icon: "Cloud" },
  { city: "Стамбул", temp: "—", cond: "Загружаем…", icon: "Cloud" },
  { city: "Пхукет", temp: "—", cond: "Загружаем…", icon: "Cloud" },
  { city: "Сочи", temp: "—", cond: "Загружаем…", icon: "Cloud" },
];

export default function WeatherTipsSection() {
  const [weather, setWeather] = useState<WeatherSpot[]>(fallbackWeather);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(WEATHER_API)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.spots) && data.spots.length > 0) {
          setWeather(data.spots);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Weather */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] font-['IBM_Plex_Mono']">
            Погода в популярных направлениях
          </h2>
          <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] flex items-center gap-1.5">
            {weatherLoading ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c0c0bc] animate-pulse" />
                ОБНОВЛЯЕМ…
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9D52]" />
                СЕЙЧАС
              </>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {weather.map((w) => (
            <div
              key={w.city}
              className="bg-white border border-[#e8e8e6] rounded-2xl p-5 flex flex-col items-start"
            >
              <Icon name={w.icon} size={28} className="text-[#7B9D52] mb-3" />
              <p className="text-xs text-[#8a8a8a] mb-1">{w.city}</p>
              <p className="text-2xl font-semibold text-[#111]">{w.temp}</p>
              <p className="text-xs text-[#c0c0bc] mt-1">{w.cond}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] mb-6 font-['IBM_Plex_Mono']">
          Советы перед поездкой
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {travelTips.map((tip) => (
            <div
              key={tip.title}
              className="bg-white border border-[#e8e8e6] rounded-2xl p-5 flex gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#7B9D52]/10 flex items-center justify-center">
                <Icon name={tip.icon} size={18} className="text-[#7B9D52]" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#111] mb-1">
                  {tip.title}
                </p>
                <p className="text-sm text-[#8a8a8a] leading-relaxed">
                  {tip.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
