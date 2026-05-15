import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/hooks/useAuth";
import { isAdminEmail } from "@/hooks/useTickets";
import { markTicketsSeen } from "@/hooks/useUnreadTickets";
import CabinetAuthForm from "@/components/cabinet/CabinetAuthForm";
import CabinetProfileTab from "@/components/cabinet/CabinetProfileTab";
import CabinetPassportTab from "@/components/cabinet/CabinetPassportTab";
import CabinetTicketsTab from "@/components/cabinet/CabinetTicketsTab";
import CabinetAdminTab from "@/components/cabinet/CabinetAdminTab";

type Tab = "profile" | "passport" | "tickets" | "admin";

export default function Cabinet() {
  const { user, loading, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("profile");

  const admin = isAdminEmail(user?.email);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t === "passport" || t === "profile" || (t === "tickets" && !admin) || (t === "admin" && admin)) {
      setTab(t);
    }
  }, [searchParams, admin]);

  const changeTab = (t: Tab) => {
    setTab(t);
    setSearchParams({ tab: t }, { replace: true });
    if (t === "tickets" || t === "admin") markTicketsSeen();
  };

  useEffect(() => {
    if (tab === "tickets" || tab === "admin") markTicketsSeen();
  }, [tab]);

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
        <CabinetAuthForm onSuccess={() => {}} />
      </div>
    );
  }

  const initials =
    `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() ||
    user.email[0].toUpperCase();

  const tabs: [Tab, string, string][] = [
    ["profile", "Профиль пассажира", "User"],
    ["passport", "Паспорт путешественника", "MapPin"],
  ];
  if (!admin) {
    tabs.push(["tickets", "Обращения", "MessageSquare"]);
  }
  if (admin) {
    tabs.push(["admin", "Администрирование", "ShieldCheck"]);
  }

  return (
    <div className="min-h-screen bg-[#e5e5e3]">
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
        <div className="flex gap-1 bg-white/60 rounded-xl p-1 mb-8 border border-[#e8e8e6] overflow-x-auto">
          {tabs.map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => changeTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === key
                  ? key === "admin"
                    ? "bg-[#111] text-white shadow-sm"
                    : "bg-[#7B9D52] text-white shadow-sm"
                  : "text-[#8a8a8a] hover:text-[#111]"
              }`}
            >
              <Icon name={icon} size={14} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">
                {key === "profile"
                  ? "Профиль"
                  : key === "passport"
                  ? "Паспорт"
                  : key === "tickets"
                  ? "Обращения"
                  : "Админ"}
              </span>
            </button>
          ))}
        </div>

        {tab === "profile" && <CabinetProfileTab />}
        {tab === "passport" && <CabinetPassportTab />}
        {tab === "tickets" && !admin && <CabinetTicketsTab />}
        {tab === "admin" && admin && <CabinetAdminTab />}
      </div>
    </div>
  );
}