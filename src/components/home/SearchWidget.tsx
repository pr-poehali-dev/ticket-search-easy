import { useCallback, useState } from "react";
import Icon from "@/components/ui/icon";
import PromoCard from "@/components/home/PromoCard";
import FlightsPanel from "@/components/home/FlightsPanel";
import HotelsPanel from "@/components/home/HotelsPanel";
import SearchingOverlay from "@/components/home/SearchingOverlay";

type Tab = "flights" | "hotels";

export default function SearchWidget() {
  const [tab, setTab] = useState<Tab>("flights");
  const [searching, setSearching] = useState(false);

  const handleSearchingChange = useCallback((value: boolean) => {
    setSearching(value);
  }, []);

  return (
    <>
      <section className="px-6 pt-16 pb-6 max-w-6xl mx-auto animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setTab("flights")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
              tab === "flights"
                ? "bg-[#111] text-white shadow-md"
                : "bg-white text-[#8a8a8a] border border-[#e8e8e6] hover:text-[#111]"
            }`}
          >
            <Icon name="Plane" size={16} />
            Авиабилеты
          </button>
          <button
            onClick={() => setTab("hotels")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
              tab === "hotels"
                ? "bg-[#111] text-white shadow-md"
                : "bg-white text-[#8a8a8a] border border-[#e8e8e6] hover:text-[#111]"
            }`}
          >
            <Icon name="BedDouble" size={16} />
            Отели
          </button>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold text-[#111] leading-tight text-center mb-3">
          {tab === "flights"
            ? "Летите туда, куда хотите!"
            : "Найдём отель в любой точке мира"}
        </h1>
        <p className="text-[#8a8a8a] text-lg text-center">
          {tab === "flights"
            ? "Сравниваем цены сотен авиакомпаний — мгновенно."
            : "Сравниваем цены сотен сайтов бронирования — экономьте до 60%."}
        </p>
      </section>

      <section className="px-6 pb-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          <div className="hidden lg:block">
            <PromoCard />
          </div>

          <div className="space-y-4">
            <div className={tab === "flights" ? "space-y-4" : "hidden"}>
              <FlightsPanel onSearchingChange={handleSearchingChange} />
            </div>
            <div className={tab === "hotels" ? "space-y-4" : "hidden"}>
              <HotelsPanel />
            </div>
          </div>
        </div>
      </section>

      {searching && <SearchingOverlay />}

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div id="tpwl-tickets"></div>
      </section>
    </>
  );
}