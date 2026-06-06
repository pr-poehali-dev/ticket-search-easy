import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

export default function Tury() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = "Туры по России и миру | КОМПАС";
  }, []);

  useEffect(() => {
    setReady(false);

    const container = document.getElementById("tours-widget");
    if (container) container.innerHTML = "";

    document
      .querySelectorAll('script[data-tours-widget="1"]')
      .forEach((el) => el.remove());

    const script = document.createElement("script");
    script.src =
      "https://tpemd.com/content?trs=527526&shmarker=727110&locale=ru&origin=ru&powered_by=false&border_radius=15&plain=true&color_background=%23FFFFFFff&color_border=%23dddddd&color_button=%23C1F089&promo_id=5470&campaign_id=26";
    script.async = true;
    script.charset = "utf-8";
    script.setAttribute("data-tours-widget", "1");
    if (container) container.appendChild(script);

    let observer: MutationObserver | null = null;
    if (container) {
      observer = new MutationObserver(() => {
        if (container.children.length > 1) {
          setReady(true);
          observer?.disconnect();
        }
      });
      observer.observe(container, { childList: true, subtree: true });
    }
    const fallback = setTimeout(() => setReady(true), 8000);

    return () => {
      observer?.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#7B9D52]/10 text-[#7B9D52] px-3 py-1.5 rounded-full text-xs font-medium mb-4">
          <Icon name="Map" size={14} />
          Готовые путешествия
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#111] mb-2">
          Туры
        </h1>
        <p className="text-[#8a8a8a] max-w-xl leading-relaxed">
          Подобрали лучшие туры по России и за рубежом — отдых, экскурсии и
          приключения с вылетом из вашего города.
        </p>
      </div>

      {!ready && (
        <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="Map" size={20} className="text-[#c0c0bc]" />
            <div className="h-3 bg-[#ececea] rounded w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-40 bg-[#ececea] rounded-xl" />
                <div className="h-3 bg-[#ececea] rounded w-3/4" />
                <div className="h-3 bg-[#ececea] rounded w-1/2" />
              </div>
            ))}
          </div>
          <p className="text-xs text-[#c0c0bc] font-['IBM_Plex_Mono'] mt-6 tracking-wider">
            ЗАГРУЖАЕМ ТУРЫ…
          </p>
        </div>
      )}
      <div id="tours-widget" className={ready ? "" : "hidden"}></div>
    </div>
  );
}
