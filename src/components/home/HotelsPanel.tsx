import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

export default function HotelsPanel() {
  const [hotelsReady, setHotelsReady] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <>
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
      <div id="hotels-widget" className={hotelsReady ? "" : "hidden"}></div>

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