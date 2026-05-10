import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

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

type AirportAlert = {
  status: "restriction" | "resume";
  airports: string[];
  title: string;
  text: string;
  date: string;
  source: string;
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
  const [alerts, setAlerts] = useState<AirportAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAlerts = () => {
      fetch(AIRPORT_STATUS_API)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data?.alerts)) setAlerts(data.alerts);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setAlertsLoading(false);
        });
    };
    loadAlerts();
    // Обновляем статусы аэропортов каждые 2 минуты
    const alertsTimer = setInterval(loadAlerts, 120000);
    fetch(NEWS_API)
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
      clearInterval(alertsTimer);
    };
  }, []);

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
        <h1 className="text-5xl font-semibold text-[#111] leading-tight mb-2">
          Летите туда,
          <br />
          куда хочется.
        </h1>
        <p className="text-[#8a8a8a] mt-4 text-lg">
          Сравниваем цены сотен авиакомпаний — мгновенно.
        </p>
      </section>

      {/* Airport alerts */}
      {(alerts.length > 0 || alertsLoading) && (
        <section className="px-6 pb-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon name="TriangleAlert" size={16} className="text-[#c97a2b]" />
              <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] font-['IBM_Plex_Mono']">
                Статус аэропортов России
              </h2>
            </div>
            <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  alertsLoading ? "bg-[#c0c0bc] animate-pulse" : "bg-[#7B9D52]"
                }`}
              />
              {alertsLoading ? "ПРОВЕРЯЕМ…" : "ОБНОВЛЯЕТСЯ"}
            </span>
          </div>

          {alertsLoading && alerts.length === 0 ? (
            <div className="bg-white border border-[#e8e8e6] rounded-2xl p-5 animate-pulse">
              <div className="h-3 bg-[#ececea] rounded w-2/3 mb-3" />
              <div className="h-3 bg-[#ececea] rounded w-1/2" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white border border-[#e8e8e6] rounded-2xl p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#7B9D52]/10 flex items-center justify-center">
                <Icon name="Check" size={16} className="text-[#7B9D52]" />
              </div>
              <p className="text-sm text-[#111]">
                Сейчас нет действующих ограничений — все аэропорты работают штатно.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 4).map((a, idx) => {
                const isResume = a.status === "resume";
                return (
                  <a
                    key={idx}
                    href={a.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block bg-white border rounded-2xl p-4 hover:border-[#111] transition-all ${
                      isResume ? "border-[#7B9D52]/30" : "border-[#c97a2b]/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                          isResume ? "bg-[#7B9D52]/10" : "bg-[#c97a2b]/10"
                        }`}
                      >
                        <Icon
                          name={isResume ? "CircleCheck" : "TriangleAlert"}
                          size={18}
                          className={isResume ? "text-[#7B9D52]" : "text-[#c97a2b]"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[10px] tracking-[0.15em] font-['IBM_Plex_Mono'] px-2 py-0.5 rounded ${
                              isResume
                                ? "text-[#7B9D52] bg-[#7B9D52]/10"
                                : "text-[#c97a2b] bg-[#c97a2b]/10"
                            }`}
                          >
                            {a.title.toUpperCase()}
                          </span>
                          {a.airports.slice(0, 3).map((ap) => (
                            <span
                              key={ap}
                              className="text-[11px] font-medium text-[#111] bg-[#f3f3f1] px-2 py-0.5 rounded"
                            >
                              {ap}
                            </span>
                          ))}
                          {a.airports.length > 3 && (
                            <span className="text-[11px] text-[#8a8a8a]">
                              +{a.airports.length - 3}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#444] leading-snug">
                          {a.text}
                        </p>
                        {a.date && (
                          <p className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] mt-2">
                            {a.date} МСК
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      )}

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

      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div id="tpwl-tickets"></div>
      </section>

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