import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/hooks/useAuth";
import CabinetAuthForm from "@/components/cabinet/CabinetAuthForm";
import CabinetProfileTab from "@/components/cabinet/CabinetProfileTab";
import CabinetPassportTab from "@/components/cabinet/CabinetPassportTab";

type Tab = "profile" | "passport";

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
        <CabinetAuthForm onSuccess={() => setRefreshKey(k => k + 1)} />
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

        {tab === "profile" && <CabinetProfileTab />}
        {tab === "passport" && <CabinetPassportTab />}
      </div>
    </div>
  );
}
