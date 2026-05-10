import { useState } from "react";
import Icon from "@/components/ui/icon";

const bookings = [
  {
    id: "AV-2840",
    route: "Москва → Дубай",
    date: "14 июня 2025",
    returnDate: "21 июня 2025",
    status: "confirmed",
    price: "24 800 ₽",
    airline: "Emirates",
  },
  {
    id: "AV-1923",
    route: "Москва → Стамбул",
    date: "3 апреля 2025",
    returnDate: "10 апреля 2025",
    status: "completed",
    price: "11 400 ₽",
    airline: "Turkish Airlines",
  },
  {
    id: "AV-0711",
    route: "СПб → Ереван",
    date: "15 января 2025",
    returnDate: null,
    status: "completed",
    price: "8 200 ₽",
    airline: "Flydubai",
  },
];

const favorites = [
  { from: "Москва", to: "Бали", code: "MOW–DPS", lastPrice: "34 100 ₽", change: -2400 },
  { from: "Москва", to: "Пхукет", code: "MOW–HKT", lastPrice: "28 700 ₽", change: +1200 },
  { from: "Казань", to: "Сочи", code: "KZN–AER", lastPrice: "4 300 ₽", change: -600 },
];

type Tab = "bookings" | "favorites" | "profile";

const statusLabel: Record<string, string> = {
  confirmed: "Подтверждён",
  completed: "Завершён",
  cancelled: "Отменён",
};

const statusStyle: Record<string, string> = {
  confirmed: "bg-[#e8f5e9] text-[#2e7d32]",
  completed: "bg-[#f2f2f0] text-[#8a8a8a]",
  cancelled: "bg-[#fdecea] text-[#c62828]",
};

export default function Cabinet() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8a8a8a] mb-4 font-['IBM_Plex_Mono']">
            Личный кабинет
          </p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center text-white font-semibold text-lg">
              АИ
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#111]">Александр Иванов</h1>
              <p className="text-sm text-[#8a8a8a]">a.ivanov@mail.ru</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#f2f2f0] rounded-xl p-1 w-fit mb-8">
          {([
            ["bookings", "Бронирования"],
            ["favorites", "Избранное"],
            ["profile", "Профиль"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? "bg-white text-[#111] shadow-sm"
                  : "text-[#8a8a8a] hover:text-[#111]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {tab === "bookings" && (
          <div className="space-y-3 animate-fade-in">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-[#e8e8e6] rounded-2xl p-6 hover:border-[#ccc] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#c0c0bc] font-medium">{b.id}</span>
                    <h3 className="text-base font-semibold text-[#111] mt-0.5">{b.route}</h3>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusStyle[b.status]}`}>
                    {statusLabel[b.status]}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-[#8a8a8a]">
                  <span className="flex items-center gap-1.5">
                    <Icon name="Calendar" size={13} />
                    {b.date}
                    {b.returnDate && ` — ${b.returnDate}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon name="Plane" size={13} />
                    {b.airline}
                  </span>
                  <span className="ml-auto font-semibold text-[#111]">{b.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Favorites */}
        {tab === "favorites" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#8a8a8a]">Уведомления о снижении цен</p>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications ? "bg-[#111]" : "bg-[#d0d0ce]"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {favorites.map((f) => (
              <div
                key={f.code}
                className="bg-white border border-[#e8e8e6] rounded-2xl p-6 hover:border-[#ccc] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#c0c0bc] font-medium">{f.code}</span>
                    <h3 className="text-base font-semibold text-[#111] mt-0.5">
                      {f.from} → {f.to}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-[#111]">{f.lastPrice}</p>
                    <p
                      className={`text-xs font-medium ${
                        f.change < 0 ? "text-[#2e7d32]" : "text-[#c62828]"
                      }`}
                    >
                      {f.change < 0 ? "▼" : "▲"} {Math.abs(f.change).toLocaleString()} ₽
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 border border-[#e8e8e6] rounded-xl py-2 text-sm font-medium text-[#111] hover:bg-[#f2f2f0] transition-colors">
                    Найти билеты
                  </button>
                  <button className="w-10 h-9 flex items-center justify-center border border-[#e8e8e6] rounded-xl hover:bg-[#fdecea] hover:border-[#f5c6c6] transition-colors">
                    <Icon name="Trash2" size={14} className="text-[#8a8a8a]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        {tab === "profile" && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wider font-['IBM_Plex_Mono']">
                Личные данные
              </h3>
              {[
                { label: "Имя", value: "Александр" },
                { label: "Фамилия", value: "Иванов" },
                { label: "Email", value: "a.ivanov@mail.ru" },
                { label: "Телефон", value: "+7 (999) 123-45-67" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium">
                    {field.label}
                  </label>
                  <input
                    defaultValue={field.value}
                    className="mt-1.5 w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
              ))}
              <button className="bg-[#111] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#333] transition-colors">
                Сохранить
              </button>
            </div>

            <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wider font-['IBM_Plex_Mono'] mb-4">
                Уведомления
              </h3>
              {[
                { label: "Снижение цен на избранные маршруты", key: "price" },
                { label: "Статус бронирования", key: "booking" },
                { label: "Специальные предложения", key: "offers" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#f2f2f0] last:border-0">
                  <span className="text-sm text-[#111]">{item.label}</span>
                  <button className="relative w-11 h-6 rounded-full bg-[#111]">
                    <span className="absolute top-1 translate-x-6 w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
