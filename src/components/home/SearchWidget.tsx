import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import MascotTip from "@/components/MascotTip";

const setNativeValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const fillSearchFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  const month = params.get("month");
  if (!to && !month) return false;

  const root = document.getElementById("tpwl-search");
  if (!root) return false;
  const inputs = root.querySelectorAll<HTMLInputElement>("input");
  if (inputs.length === 0) return false;

  let filledTo = !to;
  let filledDate = !month;

  inputs.forEach((input) => {
    const ph = (input.placeholder || "").toLowerCase();
    const name = (input.name || "").toLowerCase();
    const aria = (input.getAttribute("aria-label") || "").toLowerCase();
    const all = `${ph} ${name} ${aria}`;

    if (
      to &&
      !filledTo &&
      (all.includes("куда") || all.includes("destination") || all.includes(" to"))
    ) {
      setNativeValue(input, to);
      input.focus();
      input.blur();
      filledTo = true;
    }

    if (
      month &&
      !filledDate &&
      (all.includes("туда") ||
        all.includes("когда") ||
        all.includes("departure") ||
        all.includes("depart") ||
        input.type === "date")
    ) {
      const now = new Date();
      const targetMonth = parseInt(month, 10);
      const year =
        targetMonth >= now.getMonth() + 1
          ? now.getFullYear()
          : now.getFullYear() + 1;
      const day = "15";
      const mm = String(targetMonth).padStart(2, "0");
      const isoDate = `${year}-${mm}-${day}`;
      setNativeValue(input, isoDate);
      filledDate = true;
    }
  });

  return filledTo && filledDate;
};

export default function SearchWidget() {
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

    // Автозаполнение из URL (?to=...&month=...) после прогрузки виджета
    const params = new URLSearchParams(window.location.search);
    if (params.get("to") || params.get("month")) {
      let attempts = 0;
      const maxAttempts = 30;
      const tryFill = () => {
        attempts += 1;
        const ok = fillSearchFromQuery();
        if (ok) {
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
          // очистим query, чтобы не мешал при дальнейшей навигации
          window.history.replaceState({}, "", window.location.pathname);
        } else if (attempts < maxAttempts) {
          setTimeout(tryFill, 400);
        }
      };
      setTimeout(tryFill, 1200);
    }

    return () => {
      script.remove();
      observer?.disconnect();
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

      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div id="tpwl-tickets"></div>
      </section>
    </>
  );
}