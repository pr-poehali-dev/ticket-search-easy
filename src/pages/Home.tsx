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
  return (
    <div className="min-h-screen bg-[#e5e5e3]">
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

      {/* Partner Search Widget */}
      <section className="px-6 pb-8 max-w-4xl mx-auto">
        <div id="tpwl-search"></div>
      </section>

      {/* Partner Search Results */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div id="tpwl-tickets"></div>
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