import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import MascotTip from "@/components/MascotTip";

export default function SearchWidget() {
  const [widgetReady, setWidgetReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchingTimer = useRef<number | null>(null);

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

    const ticketsEl = document.getElementById("tpwl-tickets");
    const searchEl = document.getElementById("tpwl-search");

    const scrollToResults = () => {
      const el = document.getElementById("tpwl-tickets");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const top = window.scrollY + rect.top - 80;
      window.scrollTo({ top, behavior: "smooth" });
    };

    // Перехват клика «Найти билеты» в форме виджета
    const onSearchClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest(
        'button, [role="button"], a',
      ) as HTMLElement | null;
      if (!btn) return;
      const text = (btn.textContent || "").toLowerCase().trim();
      const aria = (btn.getAttribute("aria-label") || "").toLowerCase();
      const isSearchBtn =
        text.includes("найти") ||
        text.includes("поиск") ||
        text.includes("search") ||
        aria.includes("найти") ||
        aria.includes("search") ||
        btn.getAttribute("type") === "submit";
      if (!isSearchBtn) return;

      setSearching(true);
      if (searchingTimer.current) clearTimeout(searchingTimer.current);
      // Плашка висит до момента появления результатов, но не больше 30 сек
      searchingTimer.current = window.setTimeout(
        () => setSearching(false),
        30000,
      );

      // Скроллим к зоне результатов сразу + повторяем после рендера виджетом
      setTimeout(scrollToResults, 100);
      setTimeout(scrollToResults, 800);
      setTimeout(scrollToResults, 1800);
    };

    searchEl?.addEventListener("click", onSearchClick, true);

    // Наблюдаем за появлением результатов — снимаем плашку и снова прокручиваем
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
      searchEl?.removeEventListener("click", onSearchClick, true);
      if (searchingTimer.current) clearTimeout(searchingTimer.current);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <>
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