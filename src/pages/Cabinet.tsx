import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useAuth, type PassengerProfile, type City } from "@/hooks/useAuth";

type Tab = "profile" | "passport";
type AuthMode = "login" | "register";

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

function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = mode === "login"
      ? await login(email, password)
      : await register(email, password, firstName, lastName);
    setLoading(false);
    if (result.ok) onSuccess();
    else setError(result.error || "Ошибка");
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="User" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111]">
            {mode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
          </h1>
          <p className="text-[#8a8a8a] mt-1 text-sm">
            {mode === "login" ? "Введите email и пароль" : "Зарегистрируйтесь бесплатно"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e8e6] p-6 shadow-sm">
          <div className="flex gap-1 bg-[#f2f2f0] rounded-xl p-1 mb-6">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "bg-white text-[#111] shadow-sm" : "text-[#8a8a8a]"
                }`}
              >
                {m === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Имя</label>
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Иван"
                    required
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Фамилия</label>
                  <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Иванов"
                    required
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ivanov@mail.ru"
                required
                className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B9D52] text-white py-3.5 rounded-xl font-semibold hover:bg-[#6a8a44] transition-colors text-sm disabled:opacity-60"
            >
              {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { getProfile, saveProfile } = useAuth();
  const [data, setData] = useState<PassengerProfile>({
    first_name: "", last_name: "", middle_name: "", birth_date: "",
    gender: "", passport_series: "", passport_number: "", passport_issued_by: "",
    passport_issued_date: "", passport_expires_date: "", citizenship: "Россия",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile().then(p => {
      if (p && Object.keys(p).length > 0) setData(d => ({ ...d, ...p }));
      setLoading(false);
    });
  }, []);

  function field(key: keyof PassengerProfile, label: string, placeholder = "", type = "text") {
    return (
      <div key={key}>
        <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">{label}</label>
        <input
          type={type}
          value={data[key]}
          onChange={e => setData(d => ({ ...d, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
        />
      </div>
    );
  }

  async function save() {
    setSaving(true);
    await saveProfile(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <div className="text-center py-12 text-[#8a8a8a]">Загрузка...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wider font-['IBM_Plex_Mono']">Личные данные</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("last_name", "Фамилия", "Иванов")}
          {field("first_name", "Имя", "Иван")}
          {field("middle_name", "Отчество", "Иванович")}
          {field("birth_date", "Дата рождения", "1990-01-01", "date")}
        </div>
        <div>
          <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Пол</label>
          <div className="flex gap-2">
            {[["male", "Мужской"], ["female", "Женский"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setData(d => ({ ...d, gender: val }))}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                  data.gender === val
                    ? "bg-[#7B9D52]/10 border-[#7B9D52] text-[#7B9D52]"
                    : "border-[#e8e8e6] text-[#8a8a8a] hover:border-[#111]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {field("citizenship", "Гражданство", "Россия")}
      </div>

      <div className="bg-white border border-[#e8e8e6] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wider font-['IBM_Plex_Mono']">
          Документ
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("passport_series", "Серия паспорта", "1234")}
          {field("passport_number", "Номер паспорта", "567890")}
        </div>
        {field("passport_issued_by", "Кем выдан", "МВД России по г. Москве")}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("passport_issued_date", "Дата выдачи", "", "date")}
          {field("passport_expires_date", "Срок действия", "", "date")}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
          saved
            ? "bg-[#7B9D52] text-white"
            : "bg-[#111] text-white hover:bg-[#333]"
        } disabled:opacity-60`}
      >
        {saving ? "Сохранение..." : saved ? "✓ Сохранено" : "Сохранить данные"}
      </button>
    </div>
  );
}

function PassportTab() {
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
    </div>
  );
}

export default function Cabinet() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e5e5e3] flex items-center justify-center">
        <div className="text-[#8a8a8a]">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#e5e5e3]">
        <AuthForm onSuccess={() => setRefreshKey(k => k + 1)} />
      </div>
    );
  }

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <div key={refreshKey} className="min-h-screen bg-[#e5e5e3]">
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        {/* Header */}
        <div className="mb-8 animate-slide-up flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#7B9D52] flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#111]">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm text-[#8a8a8a]">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#111] transition-colors px-3 py-2 rounded-xl hover:bg-white"
          >
            <Icon name="LogOut" size={14} />
            Выйти
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/60 rounded-xl p-1 w-fit mb-8 border border-[#e8e8e6]">
          {([
            ["profile", "Профиль пассажира", "User"],
            ["passport", "Паспорт путешественника", "MapPin"],
          ] as [Tab, string, string][]).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? "bg-[#7B9D52] text-white shadow-sm"
                  : "text-[#8a8a8a] hover:text-[#111]"
              }`}
            >
              <Icon name={icon} size={14} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{key === "profile" ? "Профиль" : "Паспорт"}</span>
            </button>
          ))}
        </div>

        {tab === "profile" && <ProfileTab />}
        {tab === "passport" && <PassportTab />}

        <AviasalesWidget />
      </div>
    </div>
  );
}

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