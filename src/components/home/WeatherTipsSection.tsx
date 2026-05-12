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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!insuranceOpen || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    if (!doc) return;
    const closeTag = "</" + "script>";
    const html =
      '<!DOCTYPE html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      "<style>html,body{margin:0;padding:0;background:transparent;" +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}</style>' +
      "</head><body>" +
      '<script async charset="utf-8" src="https://tpemd.com/content?trs=527526&shmarker=727110&destinations=shengen&color1=%237B9D52ff&color2=%237B9D52ff&powered_by=false&campaign_id=49&promo_id=4319">' +
      closeTag +
      "</body></html>";
    doc.open();
    doc.write(html);
    doc.close();
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#111]">
              Туристическая страховка
            </DialogTitle>
            <DialogDescription className="text-[#8a8a8a]">
              Подберите полис за минуту — выберите страны, даты и
              получите цены от ведущих страховых.
            </DialogDescription>
          </DialogHeader>
          <iframe
            ref={iframeRef}
            title="Подбор страховки"
            className="w-full min-h-[520px] border-0 mt-2 bg-transparent"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}