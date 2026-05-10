import { useState, useEffect } from "react";
import { useAuth, type PassengerProfile } from "@/hooks/useAuth";

export default function CabinetProfileTab() {
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
