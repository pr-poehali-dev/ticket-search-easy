import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

export default function ToursPanel() {
  const [ready, setReady] = useState(false);

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
    <>
      {!ready && (
        <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="Map" size={20} className="text-[#c0c0bc]" />
            <div className="h-3 bg-[#ececea] rounded w-32" />
          </div>
          <div className="space-y-3">
            <div className="h-12 bg-[#ececea] rounded-xl" />
            <div className="h-12 bg-[#ececea] rounded-xl" />
            <div className="h-12 bg-[#ececea] rounded-xl" />
            <div className="h-12 bg-[#111] rounded-xl opacity-20" />
          </div>
          <p className="text-xs text-[#c0c0bc] font-['IBM_Plex_Mono'] mt-5 tracking-wider">
            ЗАГРУЖАЕМ ТУРЫ…
          </p>
        </div>
      )}
      <div id="tours-widget" className={ready ? "" : "hidden"}></div>
    </>
  );
}
