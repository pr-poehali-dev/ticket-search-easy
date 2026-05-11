import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "compas_cookie_consent_v1";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const open = () => {
      setClosing(false);
      setVisible(true);
    };
    window.addEventListener("open-cookie-settings", open);
    return () => window.removeEventListener("open-cookie-settings", open);
  }, []);

  const close = (choice: "all" | "essential") => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, at: new Date().toISOString() }),
    );
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed z-[60] left-0 right-0 bottom-0 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm px-4 sm:px-0 pb-4 sm:pb-0 pointer-events-none ${
        closing ? "animate-fade-out" : "animate-slide-up"
      }`}
    >
      <div className="pointer-events-auto relative bg-white border border-[#e8e8e6] rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7B9D52] via-[#c97a2b] to-[#7B9D52]" />

        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f5efe3] to-[#e8d9b8] flex items-center justify-center">
                <span className="text-2xl leading-none">🍪</span>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#7B9D52] border-2 border-white animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] font-medium mb-0.5">
                Печенье на борту
              </p>
              <h3 className="text-sm font-semibold text-[#111] leading-tight">
                Мы используем cookie, чтобы полёт был мягче
              </h3>
            </div>
          </div>

          <p className="text-xs text-[#8a8a8a] leading-relaxed mb-4">
            Cookie помогают запоминать ваши маршруты, ускорять поиск билетов
            и улучшать сервис. Никакого спама и продажи данных —{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#111] underline underline-offset-2 hover:text-[#7B9D52]"
            >
              как мы храним данные
            </a>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => close("all")}
              className="flex-1 bg-[#111] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#333] transition-all flex items-center justify-center gap-1.5 group"
            >
              <Icon
                name="Check"
                size={14}
                className="transition-transform group-hover:scale-110"
              />
              Принять все
            </button>
            <button
              onClick={() => close("essential")}
              className="flex-1 bg-[#f7f7f6] text-[#444] text-sm font-medium py-2.5 rounded-xl hover:bg-[#ececea] transition-all"
            >
              Только нужное
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}