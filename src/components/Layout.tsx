import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import CookieBanner from "@/components/CookieBanner";
import AirportTicker from "@/components/AirportTicker";
import { useUnreadTickets } from "@/hooks/useUnreadTickets";

const navItems = [
  { path: "/", label: "Поиск", icon: "Search" },
  { path: "/sovety", label: "Советы", icon: "Compass" },
  { path: "/cabinet", label: "Кабинет", icon: "User" },
  { path: "/faq", label: "Помощь", icon: "HelpCircle" },
  { path: "/contacts", label: "Контакты", icon: "MessageSquare" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hasUnread = useUnreadTickets();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const go = (path: string) => {
    setMobileOpen(false);
    if (path === "/") {
      window.location.href = "/";
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e8e8e6]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => go("/")} className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/f0381683-417d-42a0-98e9-148201492b78.png"
              alt="КОМПАС"
              className="h-9 w-auto"
            />
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems
              .filter((item) => item.path !== "/cabinet")
              .map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-[#7B9D52]/10 text-[#7B9D52]"
                      : "text-[#8a8a8a] hover:text-[#111] hover:bg-[#f7f7f6]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            <div className="w-px h-6 bg-[#e8e8e6] mx-2" />
            <a
              href="https://открой-свою-россию.рф"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Журнал «Открой свою Россию»"
              title="Журнал «Открой свою Россию»"
              className="group relative w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[#e8e8e6] hover:border-[#111] transition-all"
            >
              <img
                src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/3b3c2c42-6a2f-4f5c-a578-28499807f324.png"
                alt="Открой свою Россию"
                className="h-5 w-auto"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white border border-[#e8e8e6] flex items-center justify-center text-[8px] text-[#8a8a8a] group-hover:text-[#111] group-hover:border-[#111] transition-colors">
                <Icon name="ArrowUpRight" size={8} />
              </span>
            </a>
            <button
              onClick={() => go("/cabinet")}
              aria-label="Кабинет"
              title={hasUnread ? "Кабинет — новые ответы" : "Кабинет"}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                isActive("/cabinet")
                  ? "bg-[#6b8a47] text-white"
                  : "bg-[#7B9D52] text-white hover:bg-[#6b8a47]"
              }`}
            >
              <Icon name="User" size={18} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#e53935] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          </nav>

          {/* Mobile icons */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="https://открой-свою-россию.рф"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Журнал «Открой свою Россию»"
              className="w-10 h-10 rounded-xl bg-white border border-[#e8e8e6] flex items-center justify-center hover:border-[#111] transition-all"
            >
              <img
                src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/3b3c2c42-6a2f-4f5c-a578-28499807f324.png"
                alt="Открой свою Россию"
                className="h-5 w-auto"
              />
            </a>
            <button
              onClick={() => go("/cabinet")}
              aria-label="Личный кабинет"
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive("/cabinet")
                  ? "bg-[#7B9D52]/10 text-[#7B9D52]"
                  : "text-[#111] hover:bg-[#f7f7f6]"
              }`}
            >
              <Icon name="User" size={20} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#e53935] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Открыть меню"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                mobileOpen
                  ? "bg-[#111] text-white"
                  : "text-[#111] hover:bg-[#f7f7f6]"
              }`}
            >
              <Icon name={mobileOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Airport restrictions ticker */}
      <AirportTicker />

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-white border-b border-[#e8e8e6] shadow-lg animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-[#7B9D52]/10 text-[#7B9D52]"
                      : "text-[#111] hover:bg-[#f7f7f6]"
                  }`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e8e6] bg-gradient-to-b from-white to-[#f7f7f6] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/f0381683-417d-42a0-98e9-148201492b78.png"
                  alt="КОМПАС"
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-sm text-[#8a8a8a] max-w-sm leading-relaxed">
                Сравниваем цены сотен авиакомпаний — находим лучшие билеты и помогаем в пути.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://t.me/DUBBLE_RF"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="w-9 h-9 rounded-xl bg-white border border-[#e8e8e6] flex items-center justify-center text-[#8a8a8a] hover:text-[#111] hover:border-[#111] transition-all"
                >
                  <Icon name="Send" size={16} />
                </a>
                <a
                  href="mailto:business.dabblrus@bk.ru"
                  aria-label="Email"
                  className="w-9 h-9 rounded-xl bg-white border border-[#e8e8e6] flex items-center justify-center text-[#8a8a8a] hover:text-[#111] hover:border-[#111] transition-all"
                >
                  <Icon name="Mail" size={16} />
                </a>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] font-medium">
                Сервис
              </p>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className="block text-sm text-[#444] hover:text-[#111] transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Contacts */}
            <div className="space-y-3">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] font-medium">
                Контакты
              </p>
              <a
                href="mailto:business.dabblrus@bk.ru"
                className="block text-sm text-[#444] hover:text-[#111] transition-colors break-all"
              >
                business.dabblrus@bk.ru
              </a>
              <a
                href="https://t.me/DUBBLE_RF"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[#444] hover:text-[#111] transition-colors"
              >
                @DUBBLE_RF
              </a>
              <p className="text-xs text-[#8a8a8a]">
                Поддержка — круглосуточно
              </p>
            </div>
          </div>

          {/* Parent company logo */}
          <div className="pt-8 border-t border-[#e8e8e6] mb-6 flex justify-center md:justify-start">
            <a
              href="https://t.me/DUBBLE_RF"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              aria-label="Даббл — Департамент коммерческих продуктов"
            >
              <img
                src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/b4a50929-5dd7-4445-86e9-6edf48b1ac23.png"
                alt="Даббл — Департамент коммерческих продуктов"
                className="h-8 w-auto opacity-50 group-hover:opacity-100 transition-opacity"
              />
            </a>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-[#e8e8e6] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-xs text-[#8a8a8a] font-['IBM_Plex_Mono'] leading-relaxed">
              Проект входит в экосистему корпорации «Даббл» — 2026
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
              {[
                { label: "Пользовательское соглашение", path: "/terms" },
                { label: "Политика конфиденциальности", path: "/privacy" },
              ].map((t) => (
                <button
                  key={t.path}
                  onClick={() => go(t.path)}
                  className="text-xs text-[#c0c0bc] hover:text-[#111] transition-colors"
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={() =>
                  window.dispatchEvent(new Event("open-cookie-settings"))
                }
                className="text-xs text-[#c0c0bc] hover:text-[#111] transition-colors inline-flex items-center gap-1.5"
              >
                <span>🍪</span>
                Настройки cookie
              </button>
            </div>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}