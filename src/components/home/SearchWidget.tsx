import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import MascotTip from "@/components/MascotTip";

type Tab = "flights" | "hotels";

export default function SearchWidget() {
  const [tab, setTab] = useState<Tab>("flights");
  const [widgetReady, setWidgetReady] = useState(false);
  const [hotelsReady, setHotelsReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (tab !== "hotels") return;
    setHotelsReady(false);

    const container = document.getElementById("hotels-widget");
    if (container) container.innerHTML = "";

    document
      .querySelectorAll('script[data-hotels-widget="1"]')
      .forEach((el) => el.remove());

    const script = document.createElement("script");
    script.src =
      "https://tpemd.com/content?trs=527526&shmarker=727110&theme=light&powered_by=false&campaign_id=193&promo_id=8581";
    script.async = true;
    script.charset = "utf-8";
    script.setAttribute("data-hotels-widget", "1");
    if (container) container.appendChild(script);

    let observer: MutationObserver | null = null;
    if (container) {
      observer = new MutationObserver(() => {
        if (container.children.length > 1) {
          setHotelsReady(true);
          observer?.disconnect();
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }
    const fallback = setTimeout(() => setHotelsReady(true), 8000);

    return () => {
      observer?.disconnect();
      clearTimeout(fallback);
    };
  }, [tab]);

  useEffect(() => {
    if (tab !== "flights") return;
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

    const scrollToResults = () => {
      const el = document.getElementById("tpwl-tickets");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top - 80;
      window.scrollTo({ top, behavior: "smooth" });
    };

    const startSearchingUX = () => {
      setSearching(true);
      if (searchingTimer.current) clearTimeout(searchingTimer.current);
      searchingTimer.current = window.setTimeout(
        () => setSearching(false),
        30000,
      );
      setTimeout(scrollToResults, 100);
      setTimeout(scrollToResults, 1000);
      setTimeout(scrollToResults, 2500);
    };

    // 1) Перехват fetch — основной способ ловли запроса поиска
    const origFetch = window.fetch;
    // Главный поисковый запрос виджета TPWL.
    // Реальный «Найти билеты» = запрос на prices/graphql/query, и в теле есть
    // признаки настоящего поиска (passengers/segments/trip_class и т.п.).
    // Календарь цен / автокомплит / валюта в эти признаки НЕ попадают.
    const isSearchUrl = (url: string) =>
      /prices\/graphql\/query/i.test(url);

    let lastFiredAt = 0;
    const noteSearchHit = (body?: string) => {
      // Антидребезг: не чаще одного срабатывания в 3 секунды
      const now = Date.now();
      if (now - lastFiredAt < 3000) return;

      // Проверка тела: ищем явные признаки реального поиска билетов
      if (body) {
        const looksLikeRealSearch =
          /passengers|segments|trip_class|tripClass|adults/i.test(body);
        if (!looksLikeRealSearch) return;
      }

      lastFiredAt = now;
      startSearchingUX();
    };

    window.fetch = function (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> {
      try {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : (input as Request).url;
        if (url && isSearchUrl(url)) {
          const body =
            typeof init?.body === "string" ? init.body : undefined;
          noteSearchHit(body);
        }
      } catch {
        /* noop */
      }
      return origFetch.call(this, input as RequestInfo, init);
    };

    // 2) Перехват XHR — на всякий случай
    const origXhrOpen = XMLHttpRequest.prototype.open;
    const origXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      ...rest: unknown[]
    ) {
      try {
        const u = typeof url === "string" ? url : url.toString();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any).__tpwlSearchUrl = u && isSearchUrl(u);
      } catch {
        /* noop */
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return origXhrOpen.apply(this, [method, url, ...rest] as any);
    };
    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((this as any).__tpwlSearchUrl) {
          const b = typeof body === "string" ? body : undefined;
          noteSearchHit(b);
        }
      } catch {
        /* noop */
      }
      return origXhrSend.call(this, body as Document);
    };

    // 3) Снимаем плашку, когда в #tpwl-tickets появился контент
    const ticketsEl = document.getElementById("tpwl-tickets");
    let ticketsObserver: MutationObserver | null = null;
    if (ticketsEl) {
      ticketsObserver = new MutationObserver(() => {
        const hasContent =
          ticketsEl.children.length > 0 &&
          (ticketsEl.textContent || "").trim().length > 5;
        if (hasContent) {
          setSearching(false);
          if (searchingTimer.current) clearTimeout(searchingTimer.current);
          scrollToResults();
        }
      });
      ticketsObserver.observe(ticketsEl, { childList: true, subtree: true });
    }

    return () => {
      script.remove();
      observer?.disconnect();
      ticketsObserver?.disconnect();
      window.fetch = origFetch;
      XMLHttpRequest.prototype.open = origXhrOpen;
      XMLHttpRequest.prototype.send = origXhrSend;
      if (searchingTimer.current) clearTimeout(searchingTimer.current);
      clearTimeout(fallback);
    };
  }, [tab]);

  return (
    <>
      <section className="px-6 pt-20 pb-10 max-w-4xl mx-auto animate-slide-up">
        <h1 className="text-5xl font-semibold text-[#111] leading-tight mb-2">
          {tab === "flights"
            ? "Летите туда, куда хотите!"
            : "Найдём отель в любой точке мира"}
        </h1>
        <p className="text-[#8a8a8a] mt-4 text-lg">
          {tab === "flights"
            ? "Сравниваем цены сотен авиакомпаний — мгновенно."
            : "Сравниваем цены сотен сайтов бронирования — экономьте до 60%."}
        </p>
      </section>

      <section className="px-6 pb-4 max-w-4xl mx-auto">
        <div className="inline-flex bg-white border border-[#e8e8e6] rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setTab("flights")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "flights"
                ? "bg-[#111] text-white shadow-sm"
                : "text-[#8a8a8a] hover:text-[#111]"
            }`}
          >
            <Icon name="Plane" size={16} />
            Авиабилеты
          </button>
          <button
            onClick={() => setTab("hotels")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "hotels"
                ? "bg-[#111] text-white shadow-sm"
                : "text-[#8a8a8a] hover:text-[#111]"
            }`}
          >
            <Icon name="BedDouble" size={16} />
            Отели
          </button>
        </div>
      </section>

      {tab === "flights" && (
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
      )}

      {tab === "hotels" && (
        <section className="px-6 pb-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
            <div className="relative rounded-2xl overflow-hidden bg-[#ececea] aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[420px]">
              <img
                src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/1fe9278f-88ae-41fb-90a6-8dcc7d634c44.png"
                alt="Карелия"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h3 className="text-white text-2xl sm:text-3xl font-semibold leading-tight">
                  Захотелось переключиться
                </h3>
                <p className="text-white/80 mt-2 text-sm sm:text-base">
                  Исследуем Ленинградскую область
                </p>
                <button className="mt-4 inline-flex items-center gap-2 bg-white text-[#111] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition">
                  Выбрать отель
                  <span className="text-[#7B9D52] font-semibold">от 7000 ₽</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {!hotelsReady && (
                <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-6">
                    <Icon name="BedDouble" size={20} className="text-[#c0c0bc]" />
                    <div className="h-3 bg-[#ececea] rounded w-32" />
                  </div>
                  <div className="space-y-3">
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
              <div
                id="hotels-widget"
                className={hotelsReady ? "" : "hidden"}
              ></div>

              <div className="bg-white border border-[#e8e8e6] rounded-2xl divide-y divide-[#f0f0ee]">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-[#111] font-medium text-sm">
                      Большой выбор отелей
                    </p>
                    <p className="text-[#8a8a8a] text-xs mt-0.5">
                      2 миллиона объектов по всему миру
                    </p>
                  </div>
                  <Icon name="Building2" size={20} className="text-[#c0c0bc]" />
                </div>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-[#111] font-medium text-sm">
                      Оплата российской картой
                    </p>
                    <p className="text-[#8a8a8a] text-xs mt-0.5">
                      Любого зарубежного отеля
                    </p>
                  </div>
                  <Icon name="Wallet" size={20} className="text-[#c0c0bc]" />
                </div>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-[#111] font-medium text-sm">
                      Поддержка 24/7
                    </p>
                    <p className="text-[#8a8a8a] text-xs mt-0.5">
                      В онлайн-чате, по телефону и почте
                    </p>
                  </div>
                  <Icon name="Heart" size={20} className="text-[#c0c0bc]" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === "flights" && widgetReady && (
        <section className="px-6 pb-8 max-w-4xl mx-auto animate-slide-up">
          <MascotTip />
        </section>
      )}

      {searching && (
        <section className="px-6 pb-6 max-w-4xl mx-auto animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f17] via-[#222820] to-[#1a1f17] p-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.35)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#7B9D52] opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c97a2b] opacity-15 blur-3xl rounded-full translate-y-1/3 pointer-events-none" />

            <div className="relative flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                  <Icon
                    name="Plane"
                    size={20}
                    className="text-white animate-[bounce_1.4s_ease-in-out_infinite]"
                  />
                </div>
                <span className="absolute inset-0 rounded-full border-2 border-[#7B9D52]/40 animate-ping" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-['IBM_Plex_Mono'] font-medium mb-1">
                  Поиск запущен
                </p>
                <h3 className="text-white text-base sm:text-lg font-semibold leading-tight">
                  Подбираем лучшие предложения…
                </h3>
                <p className="text-white/60 text-xs sm:text-sm mt-1">
                  Сравниваем сотни авиакомпаний — обычно 5–15 секунд
                </p>
              </div>
            </div>

            <div className="relative mt-4 h-[3px] bg-white/5 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#7B9D52] to-transparent animate-[shimmer_1.6s_ease-in-out_infinite]" />
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div id="tpwl-tickets"></div>
      </section>
    </>
  );
}