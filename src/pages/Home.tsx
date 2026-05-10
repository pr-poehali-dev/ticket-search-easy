import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const popularRoutes = [
  { from: "Москва", to: "Дубай", price: "от 18 400 ₽", code: "MOW–DXB" },
  { from: "Москва", to: "Стамбул", price: "от 9 200 ₽", code: "MOW–IST" },
  { from: "Москва", to: "Бали", price: "от 34 100 ₽", code: "MOW–DPS" },
  { from: "Санкт-Петербург", to: "Пхукет", price: "от 28 700 ₽", code: "LED–HKT" },
  { from: "Москва", to: "Ереван", price: "от 6 800 ₽", code: "MOW–EVN" },
  { from: "Казань", to: "Сочи", price: "от 4 300 ₽", code: "KZN–AER" },
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

      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] mb-6 font-['IBM_Plex_Mono']">
          Популярные направления
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {popularRoutes.map((route) => (
            <div
              key={route.code}
              className="bg-white border border-[#e8e8e6] rounded-2xl p-5 hover:border-[#111] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] font-medium">{route.code}</span>
                <Icon name="Heart" size={14} className="text-[#e0e0de] group-hover:text-[#111] transition-colors" />
              </div>
              <p className="text-sm text-[#8a8a8a] mb-0.5">{route.from}</p>
              <p className="text-base font-semibold text-[#111] mb-3">{route.to}</p>
              <p className="text-sm font-medium text-[#111]">{route.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
