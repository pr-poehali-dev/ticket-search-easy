import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  active: boolean;
  onSearchingChange: (searching: boolean) => void;
}

export default function FlightsPanel({ active, onSearchingChange }: Props) {
  const [widgetReady, setWidgetReady] = useState(false);
  const searchingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
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
      onSearchingChange(true);
      if (searchingTimer.current) clearTimeout(searchingTimer.current);
      searchingTimer.current = window.setTimeout(
        () => onSearchingChange(false),
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
    XMLHttpRequest.prototype.send = function (
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
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
          onSearchingChange(false);
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
  }, [active, onSearchingChange]);

  return (
    <>
      {!widgetReady && (
        <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="Plane" size={20} className="text-[#c0c0bc]" />
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
      <div id="tpwl-search" className={widgetReady ? "" : "hidden"}></div>

      <div className="bg-white border border-[#e8e8e6] rounded-2xl divide-y divide-[#f0f0ee]">
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1">
            <p className="text-[#111] font-medium text-sm">
              Сотни авиакомпаний
            </p>
            <p className="text-[#8a8a8a] text-xs mt-0.5">
              Сравниваем цены за секунды
            </p>
          </div>
          <Icon name="Plane" size={20} className="text-[#c0c0bc]" />
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1">
            <p className="text-[#111] font-medium text-sm">
              Оплата российской картой
            </p>
            <p className="text-[#8a8a8a] text-xs mt-0.5">
              Любого зарубежного рейса
            </p>
          </div>
          <Icon name="Wallet" size={20} className="text-[#c0c0bc]" />
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex-1">
            <p className="text-[#111] font-medium text-sm">Поддержка 24/7</p>
            <p className="text-[#8a8a8a] text-xs mt-0.5">
              В онлайн-чате, по телефону и почте
            </p>
          </div>
          <Icon name="Heart" size={20} className="text-[#c0c0bc]" />
        </div>
      </div>
    </>
  );
}
