import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import MascotTip from "@/components/MascotTip";

const NEWS_API = "https://functions.poehali.dev/4646c7cb-dd1b-424c-ab23-10d543cfc8c4";
const WEATHER_API = "https://functions.poehali.dev/f1cb531b-1e57-49a1-a494-e158a960aa31";
const AIRPORT_STATUS_API = "https://functions.poehali.dev/d59d455f-da30-4c36-b8cc-878db1ba737a";

type NewsItem = {
  tag: string;
  date: string;
  title: string;
  desc: string;
  icon: string;
  link?: string;
};

type WeatherSpot = {
  city: string;
  temp: string;
  cond: string;
  icon: string;
};

type AirportStatus = {
  airport: string;
  city: string;
  status: "restriction" | "resume";
  restrictedAt: string;
  resumedAt: string;
};

const fallbackNews: NewsItem[] = [
  {
    tag: "ВИЗЫ",
    date: "",
    title: "Таиланд продлил безвизовый въезд для россиян до 60 дней",
    desc: "Правило действует при наличии обратного билета и подтверждённого жилья.",
    icon: "FileCheck",
  },
  {
    tag: "АВИАЦИЯ",
    date: "",
    title: "Аэрофлот добавил рейсы в Гавану и Варадеро на лето",
    desc: "Прямые перелёты из Москвы — 3 раза в неделю с 1 июня.",
    icon: "Plane",
  },
  {
    tag: "АЭРОПОРТЫ",
    date: "",
    title: "Шереметьево открыло обновлённый терминал C",
    desc: "Новые зоны досмотра и автоматические стойки регистрации сократили очереди.",
    icon: "Building2",
  },
];

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

export default function Home() {
  const [widgetReady, setWidgetReady] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [newsLoading, setNewsLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherSpot[]>(fallbackWeather);
  const [weatherLoading, setWeatherLoading] = useState(true);
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

    const loadNews = () => {
      fetch(`${NEWS_API}?t=${Date.now()}`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data?.news) && data.news.length > 0) {
            setNews(data.news);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setNewsLoading(false);
        });
    };
    loadNews();
    const newsTimer = setInterval(loadNews, 3600000);

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
      clearInterval(statusTimer);
      clearInterval(newsTimer);
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

  useEffect(() => {
    setWidgetReady(false);

    document
      .querySelectorAll('script[data-tpwl-widget="1"]')
      .forEach((el) => el.remove());
    document
      .querySelectorAll('script[src*="tpemd.com/wl_web/main.js"]')
      .forEach((el) => el.remove());

    const search = document.getElementById("tpwl-search");
    const tickets = document.getElementById("tpwl-tickets");
    if (search) search.innerHTML = "";
    if (tickets) tickets.innerHTML = "";

    const bust = Date.now();
    const script = document.createElement("script");
    script.src = `https://tpemd.com/wl_web/main.js?wl_id=17282&_=${bust}`;
    script.async = true;
    script.type = "module";
    script.setAttribute("data-tpwl-widget", "1");
    document.head.appendChild(script);

    const target = document.getElementById("tpwl-search");
    let observer: MutationObserver | null = null;
    if (target) {
      observer = new MutationObserver(() => {
        if (target.children.length > 0) {
          setWidgetReady(true);
          observer?.disconnect();
        }
      });
      observer.observe(target, { childList: true, subtree: true });
    }

    const fallback = setTimeout(() => setWidgetReady(true), 10000);

    return () => {
      script.remove();
      observer?.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#e5e5e3]">
      <section className="px-6 pt-20 pb-10 max-w-4xl mx-auto animate-slide-up">
        <h1 className="text-5xl font-semibold text-[#111] leading-tight mb-2">Летите туда, куда хотите!</h1>
        <p className="text-[#8a8a8a] mt-4 text-lg">
          Сравниваем цены сотен авиакомпаний — мгновенно.
        </p>
      </section>

      <section className="px-6 pb-8 max-w-4xl mx-auto">
        {!widgetReady && (
          <div className="bg-white border border-[#e8e8e6] rounded-2xl p-8 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="Plane" size={20} className="text-[#c0c0bc]" />
              <div className="h-3 bg-[#ececea] rounded w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="h-12 bg-[#ececea] rounded-xl" />
              <div className="h-12 bg-[#ececea] rounded-xl" />
              <div className="h-12 bg-[#ececea] rounded-xl" />
              <div className="h-12 bg-[#111] rounded-xl opacity-20" />
            </div>
            <p className="text-xs text-[#c0c0bc] font-['IBM_Plex_Mono'] mt-5 tracking-wider">
              ЗАГРУЖАЕМ ПОИСК…
            </p>
          </div>
        )}
        <div id="tpwl-search" className={widgetReady ? "" : "hidden"}></div>
      </section>

      {widgetReady && (
        <section className="px-6 pb-8 max-w-4xl mx-auto animate-slide-up">
          <MascotTip />
        </section>
      )}

      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div id="tpwl-tickets"></div>
      </section>

      {/* Статусы аэропортов */}
      {(airportItems.length > 0 || airportLoading) && (
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
      )}

      {/* News */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] font-['IBM_Plex_Mono']">
            Новости для путешественников
          </h2>
          <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] flex items-center gap-1.5">
            {newsLoading ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c0c0bc] animate-pulse" />
                ОБНОВЛЯЕМ…
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9D52]" />
                АКТУАЛЬНО
              </>
            )}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {news.slice(0, 6).map((item) => {
            const Wrap = item.link ? "a" : "article";
            const wrapProps = item.link
              ? { href: item.link, target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <Wrap
                key={item.title}
                {...wrapProps}
                className="bg-white border border-[#e8e8e6] rounded-2xl p-5 hover:border-[#111] transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-[0.15em] font-['IBM_Plex_Mono'] text-[#7B9D52] bg-[#7B9D52]/10 px-2 py-1 rounded">
                    {item.tag}
                  </span>
                  <Icon
                    name={item.icon}
                    size={16}
                    className="text-[#c0c0bc] group-hover:text-[#111] transition-colors"
                  />
                </div>
                <h3 className="text-base font-semibold text-[#111] leading-snug mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#8a8a8a] flex-1">{item.desc}</p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#f0f0ee]">
                  <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono']">
                    {item.date}
                  </span>
                  {item.link && (
                    <span className="text-xs text-[#7B9D52] font-medium ml-auto group-hover:underline">
                      Читать
                    </span>
                  )}
                </div>
              </Wrap>
            );
          })}
        </div>
      </section>

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
    </div>
  );
}