import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAuth, type City } from "@/hooks/useAuth";

const CITY_SUGGESTIONS = [
  { city_name: "Москва", country: "Россия", iata_code: "SVO", emoji: "🏙️" },
  { city_name: "Санкт-Петербург", country: "Россия", iata_code: "LED", emoji: "🌉" },
  { city_name: "Дубай", country: "ОАЭ", iata_code: "DXB", emoji: "🏙️" },
  { city_name: "Стамбул", country: "Турция", iata_code: "IST", emoji: "🕌" },
  { city_name: "Бали", country: "Индонезия", iata_code: "DPS", emoji: "🌴" },
  { city_name: "Пхукет", country: "Таиланд", iata_code: "HKT", emoji: "🏖️" },
  { city_name: "Бангкок", country: "Таиланд", iata_code: "BKK", emoji: "🛕" },
  { city_name: "Барселона", country: "Испания", iata_code: "BCN", emoji: "⛪" },
  { city_name: "Париж", country: "Франция", iata_code: "CDG", emoji: "🗼" },
  { city_name: "Рим", country: "Италия", iata_code: "FCO", emoji: "🏛️" },
  { city_name: "Амстердам", country: "Нидерланды", iata_code: "AMS", emoji: "🌷" },
  { city_name: "Берлин", country: "Германия", iata_code: "BER", emoji: "🏰" },
  { city_name: "Токио", country: "Япония", iata_code: "NRT", emoji: "🗾" },
  { city_name: "Нью-Йорк", country: "США", iata_code: "JFK", emoji: "🗽" },
  { city_name: "Лондон", country: "Великобритания", iata_code: "LHR", emoji: "🎡" },
  { city_name: "Прага", country: "Чехия", iata_code: "PRG", emoji: "🏯" },
  { city_name: "Вена", country: "Австрия", iata_code: "VIE", emoji: "🎭" },
  { city_name: "Сочи", country: "Россия", iata_code: "AER", emoji: "🏔️" },
  { city_name: "Ереван", country: "Армения", iata_code: "EVN", emoji: "🏔️" },
  { city_name: "Тбилиси", country: "Грузия", iata_code: "TBS", emoji: "🍷" },
];

function AviasalesWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://tpemd.com/content";
    script.async = true;
    script.charset = "utf-8";
    script.setAttribute("data-currency", "usd");
    script.setAttribute("data-trs", "527526");
    script.setAttribute("data-shmarker", "727110.727110");
    script.setAttribute("data-target_host", "www.aviasales.ru/search");
    script.setAttribute("data-locale", "ru");
    script.setAttribute("data-limit", "7");
    script.setAttribute("data-powered_by", "false");
    script.setAttribute("data-primary", "#0085FF");
    script.setAttribute("data-promo_id", "4044");
    script.setAttribute("data-campaign_id", "100");
    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} className="mt-8" />;
}

export default function CabinetPassportTab() {
  const { getCities, addCity, removeCity } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getCities().then(c => { setCities(c); setLoading(false); });
  }, []);

  const visitedNames = new Set(cities.map(c => c.city_name));
  const filtered = CITY_SUGGESTIONS.filter(c =>
    !visitedNames.has(c.city_name) &&
    (search === "" || c.city_name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleAdd(c: typeof CITY_SUGGESTIONS[0]) {
    setAdding(true);
    const result = await addCity(c);
    if (result.id) {
      setCities(prev => [{ ...c, id: result.id, visited_at: new Date().toISOString() }, ...prev]);
    }
    setSearch("");
    setAdding(false);
  }

  async function handleRemove(id: number) {
    await removeCity(id);
    setCities(prev => prev.filter(c => c.id !== id));
  }

  const countryGroups: Record<string, City[]> = {};
  cities.forEach(c => {
    const key = c.country || "Другое";
    if (!countryGroups[key]) countryGroups[key] = [];
    countryGroups[key].push(c);
  });

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero stats */}
      <div className="relative bg-[#111] rounded-3xl p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 text-6xl">✈️</div>
          <div className="absolute bottom-4 right-8 text-5xl">🌍</div>
          <div className="absolute top-8 right-24 text-3xl">⭐</div>
        </div>
        <div className="relative">
          <p className="text-[#7B9D52] text-xs font-medium uppercase tracking-[0.2em] font-['IBM_Plex_Mono'] mb-2">
            Паспорт путешественника
          </p>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <span className="text-5xl font-bold text-white">{cities.length}</span>
              <span className="text-[#8a8a8a] text-lg ml-2">
                {cities.length === 1 ? "город" : cities.length >= 2 && cities.length <= 4 ? "города" : "городов"}
              </span>
            </div>
            <div className="pb-1 text-[#8a8a8a] text-sm">
              в {Object.keys(countryGroups).length} {Object.keys(countryGroups).length === 1 ? "стране" : "странах"}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {["Новичок", "Путешественник", "Исследователь", "Авантюрист", "Легенда"].map((rank, i) => (
              <span
                key={rank}
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  cities.length >= i * 5
                    ? "bg-[#7B9D52] text-white"
                    : "bg-white/10 text-[#8a8a8a]"
                }`}
              >
                {rank}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add city */}
      <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wider font-['IBM_Plex_Mono'] mb-4">
          Добавить город
        </h3>
        <div className="relative mb-3">
          <Icon name="Search" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c0c0bc]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск города..."
            className="w-full border border-[#e8e8e6] rounded-xl pl-10 pr-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
          {filtered.slice(0, 18).map(c => (
            <button
              key={c.city_name}
              onClick={() => handleAdd(c)}
              disabled={adding}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#e8e8e6] hover:border-[#7B9D52] hover:bg-[#7B9D52]/5 transition-all text-left group disabled:opacity-50"
            >
              <span className="text-lg leading-none">{c.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#111] truncate">{c.city_name}</p>
                <p className="text-[10px] text-[#8a8a8a] truncate">{c.country}</p>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-[#8a8a8a] text-center py-4">Все города уже добавлены</p>
        )}
      </div>

      {/* Visited cities */}
      {loading ? (
        <div className="text-center py-8 text-[#8a8a8a]">Загрузка...</div>
      ) : cities.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e8e8e6] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-[#111] font-medium mb-1">Пока нет посещённых городов</p>
          <p className="text-sm text-[#8a8a8a]">Добавьте города, в которых вы уже побывали</p>
        </div>
      ) : (
        Object.entries(countryGroups).map(([country, group]) => (
          <div key={country}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono']">{country}</span>
              <span className="text-xs text-[#c0c0bc]">— {group.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {group.map(city => (
                <div
                  key={city.id}
                  className="bg-white border border-[#e8e8e6] rounded-2xl p-4 group hover:border-[#7B9D52] transition-all relative"
                >
                  <button
                    onClick={() => handleRemove(city.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-[#f2f2f0] hover:bg-red-50 transition-all"
                  >
                    <Icon name="X" size={10} className="text-[#8a8a8a] hover:text-red-500" />
                  </button>
                  <div className="text-3xl mb-2">{city.emoji}</div>
                  <p className="text-sm font-semibold text-[#111]">{city.city_name}</p>
                  {city.iata_code && (
                    <p className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] mt-0.5">{city.iata_code}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <AviasalesWidget />
    </div>
  );
}
