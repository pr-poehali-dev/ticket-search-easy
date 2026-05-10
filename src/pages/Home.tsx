import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const news = [
  {
    tag: "ВИЗЫ",
    date: "8 мая",
    title: "Таиланд продлил безвизовый въезд для россиян до 60 дней",
    desc: "Правило действует при наличии обратного билета и подтверждённого жилья.",
    icon: "FileCheck",
  },
  {
    tag: "АВИАЦИЯ",
    date: "5 мая",
    title: "Аэрофлот добавил рейсы в Гавану и Варадеро на лето",
    desc: "Прямые перелёты из Москвы — 3 раза в неделю с 1 июня.",
    icon: "Plane",
  },
  {
    tag: "АЭРОПОРТЫ",
    date: "3 мая",
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

const weatherSpots = [
  { city: "Дубай", temp: "+34°", cond: "Солнечно", icon: "Sun" },
  { city: "Стамбул", temp: "+22°", cond: "Малооблачно", icon: "CloudSun" },
  { city: "Пхукет", temp: "+31°", cond: "Дожди", icon: "CloudRain" },
  { city: "Сочи", temp: "+19°", cond: "Облачно", icon: "Cloud" },
];

export default function Home() {
  const [widgetReady, setWidgetReady] = useState(false);

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
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto animate-slide-up">
        <h1 className="text-5xl font-semibold text-[#111] leading-tight mb-2">
          Летите туда,
          <br />
          куда хочется.
        </h1>
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

      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div id="tpwl-tickets"></div>
      </section>

      {/* News */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] font-['IBM_Plex_Mono']">
            Новости для путешественников
          </h2>
          <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono']">
            ОБНОВЛЕНО СЕГОДНЯ
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {news.map((item) => (
            <article
              key={item.title}
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
                <span className="text-xs text-[#7B9D52] font-medium ml-auto group-hover:underline">
                  Читать
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Weather */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] mb-6 font-['IBM_Plex_Mono']">
          Погода в популярных направлениях
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {weatherSpots.map((w) => (
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
