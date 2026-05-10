import { useState } from "react";
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
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [passengers, setPassengers] = useState(1);

  const swap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto animate-slide-up">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8a8a8a] mb-4 font-['IBM_Plex_Mono']">
          Поиск авиабилетов
        </p>
        <h1 className="text-5xl font-semibold text-[#111] leading-tight mb-2">
          Летите туда,
          <br />
          куда хочется.
        </h1>
        <p className="text-[#8a8a8a] mt-4 text-lg">
          Сравниваем цены сотен авиакомпаний — мгновенно.
        </p>
      </section>

      {/* Search Form */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#e8e8e6] shadow-sm p-6 animate-fade-in">
          {/* Trip type toggle */}
          <div className="flex gap-1 mb-6 bg-[#f2f2f0] rounded-xl p-1 w-fit">
            <button
              onClick={() => setTripType("roundtrip")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tripType === "roundtrip"
                  ? "bg-white text-[#111] shadow-sm"
                  : "text-[#8a8a8a] hover:text-[#111]"
              }`}
            >
              Туда-обратно
            </button>
            <button
              onClick={() => setTripType("oneway")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tripType === "oneway"
                  ? "bg-white text-[#111] shadow-sm"
                  : "text-[#8a8a8a] hover:text-[#111]"
              }`}
            >
              В одну сторону
            </button>
          </div>

          {/* Route row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-xs text-[#8a8a8a] mb-1.5 block font-medium uppercase tracking-wider font-['IBM_Plex_Mono']">
                Откуда
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Город или аэропорт"
                className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors text-sm"
              />
            </div>

            <button
              onClick={swap}
              className="mt-6 w-10 h-10 flex items-center justify-center rounded-full border border-[#e8e8e6] bg-white hover:bg-[#f2f2f0] transition-colors flex-shrink-0"
            >
              <Icon name="ArrowLeftRight" size={14} />
            </button>

            <div className="flex-1">
              <label className="text-xs text-[#8a8a8a] mb-1.5 block font-medium uppercase tracking-wider font-['IBM_Plex_Mono']">
                Куда
              </label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Город или аэропорт"
                className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors text-sm"
              />
            </div>
          </div>

          {/* Dates + passengers row */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="text-xs text-[#8a8a8a] mb-1.5 block font-medium uppercase tracking-wider font-['IBM_Plex_Mono']">
                Туда
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-[#111] focus:outline-none focus:border-[#111] transition-colors text-sm"
              />
            </div>

            {tripType === "roundtrip" && (
              <div className="flex-1">
                <label className="text-xs text-[#8a8a8a] mb-1.5 block font-medium uppercase tracking-wider font-['IBM_Plex_Mono']">
                  Обратно
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-[#111] focus:outline-none focus:border-[#111] transition-colors text-sm"
                />
              </div>
            )}

            <div className="w-36">
              <label className="text-xs text-[#8a8a8a] mb-1.5 block font-medium uppercase tracking-wider font-['IBM_Plex_Mono']">
                Пассажиры
              </label>
              <div className="flex items-center border border-[#e8e8e6] rounded-xl overflow-hidden">
                <button
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="px-3 py-3 hover:bg-[#f2f2f0] transition-colors text-[#111]"
                >
                  <Icon name="Minus" size={14} />
                </button>
                <span className="flex-1 text-center text-sm font-medium text-[#111]">{passengers}</span>
                <button
                  onClick={() => setPassengers(Math.min(9, passengers + 1))}
                  className="px-3 py-3 hover:bg-[#f2f2f0] transition-colors text-[#111]"
                >
                  <Icon name="Plus" size={14} />
                </button>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#111] text-white py-3.5 rounded-xl font-semibold hover:bg-[#333] transition-colors flex items-center justify-center gap-2 text-sm">
            <Icon name="Search" size={16} />
            Найти билеты
          </button>
        </div>
      </section>

      {/* Popular Routes */}
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
