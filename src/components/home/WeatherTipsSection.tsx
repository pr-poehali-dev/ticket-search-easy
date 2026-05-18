import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const WEATHER_API = "https://functions.poehali.dev/f1cb531b-1e57-49a1-a494-e158a960aa31";

type WeatherSpot = {
  city: string;
  temp: string;
  cond: string;
  icon: string;
};

const travelTips = [
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
  {
    icon: "Luggage",
    title: "Проверьте багаж",
    text: "Уточните нормы по весу — доплата на стойке выходит в 2–3 раза дороже.",
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
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(640);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!insuranceOpen) {
      setIframeHeight(640);
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;
    let interval: number | null = null;
    const timers: number[] = [];

    const onLoad = () => {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;

      const measure = () => {
        const body = doc.body;
        const root = doc.documentElement;
        if (!body || !root) return;
        const h = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          root.scrollHeight,
          root.offsetHeight,
        );
        if (h > 100) setIframeHeight(h + 24);
      };

      try {
        if (typeof win.ResizeObserver !== "undefined") {
          observer = new win.ResizeObserver(() => measure());
          observer.observe(doc.body);
        }
        interval = win.setInterval(measure, 800) as unknown as number;
        timers.push(win.setTimeout(measure, 400) as unknown as number);
        timers.push(win.setTimeout(measure, 1500) as unknown as number);
        timers.push(win.setTimeout(measure, 3500) as unknown as number);
        timers.push(win.setTimeout(measure, 6000) as unknown as number);
      } catch {
        // ignore cross-origin errors (won't happen for same-origin /public file)
      }
    };

    iframe.addEventListener("load", onLoad);

    return () => {
      iframe.removeEventListener("load", onLoad);
      if (observer) observer.disconnect();
      const win = iframe.contentWindow;
      try {
        if (win && interval !== null) win.clearInterval(interval);
        if (win) timers.forEach((t) => win.clearTimeout(t));
      } catch {
        // ignore
      }
    };
  }, [insuranceOpen]);

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
      <section className="px-6 pb-12 max-w-6xl mx-auto">
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
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] mb-6 font-['IBM_Plex_Mono']">
          Советы перед поездкой
        </h2>

        {/* Insurance Promo */}
        <button
          type="button"
          onClick={() => setInsuranceOpen(true)}
          className="w-full text-left mb-3 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7B9D52] to-[#5f7d3e] p-6 md:p-7 text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-10 bottom-0 opacity-10">
            <Icon name="ShieldCheck" size={180} />
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Icon name="ShieldCheck" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] tracking-[0.15em] font-['IBM_Plex_Mono'] bg-white/15 px-2 py-1 rounded mb-2">
                СТРАХОВКА · 1 МИНУТА
              </span>
              <h3 className="text-xl md:text-2xl font-bold leading-tight mb-1">
                Застраховался — и в небо со спокойной душой
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Оформите полис прямо сейчас и летите без тревог: врачи,
                багаж и отмена рейса — всё под защитой.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2 bg-white text-[#5f7d3e] font-semibold text-sm px-5 py-3 rounded-xl group-hover:bg-[#f5f5f3] transition-colors">
              Оформить
              <Icon name="ArrowRight" size={16} />
            </div>
          </div>
        </button>

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

      <Dialog open={insuranceOpen} onOpenChange={setInsuranceOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#111]">
              Туристическая страховка
            </DialogTitle>
            <DialogDescription className="text-[#8a8a8a]">
              Подберите полис за минуту — выберите страны, даты и
              получите цены от ведущих страховых.
            </DialogDescription>
          </DialogHeader>
          {insuranceOpen && (
            <iframe
              ref={iframeRef}
              title="Подбор страховки"
              src="/insurance-widget.html"
              className="w-full border-0 mt-2 bg-white block rounded-xl"
              style={{ height: iframeHeight }}
            />
          )}
          <p className="text-xs text-[#8a8a8a] mt-3 text-center">
            Если форма не загрузилась —{" "}
            <a
              href="/insurance-widget.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#7B9D52] underline font-medium"
            >
              открыть в новой вкладке
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}