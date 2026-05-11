import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const STORAGE_KEY = "compas_cookie_consent_v1";

type Categories = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CATEGORIES: {
  key: keyof Categories;
  icon: string;
  title: string;
  desc: string;
  locked?: boolean;
}[] = [
  {
    key: "essential",
    icon: "ShieldCheck",
    title: "Обязательные",
    desc: "Нужны для входа, поиска и работы корзины. Без них сайт не полетит.",
    locked: true,
  },
  {
    key: "analytics",
    icon: "BarChart3",
    title: "Аналитика",
    desc: "Помогают понять, какие маршруты популярны, и улучшать сервис.",
  },
  {
    key: "marketing",
    icon: "Sparkles",
    title: "Маркетинг",
    desc: "Персональные подборки направлений и спецпредложения по вашим интересам.",
  },
];

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cats, setCats] = useState<Categories>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.categories) setCats(parsed.categories);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const open = () => {
      setClosing(false);
      setExpanded(true);
      setVisible(true);
    };
    window.addEventListener("open-cookie-settings", open);
    return () => window.removeEventListener("open-cookie-settings", open);
  }, []);

  const save = (categories: Categories) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ categories, at: new Date().toISOString() }),
    );
    setCats(categories);
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      setExpanded(false);
    }, 300);
  };

  const acceptAll = () =>
    save({ essential: true, analytics: true, marketing: true });
  const acceptEssential = () =>
    save({ essential: true, analytics: false, marketing: false });
  const saveCustom = () => save(cats);

  const toggle = (key: keyof Categories) => {
    if (key === "essential") return;
    setCats((c) => ({ ...c, [key]: !c[key] }));
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed z-[60] left-0 right-0 bottom-0 sm:left-auto sm:right-6 sm:bottom-6 ${
        expanded ? "sm:max-w-md" : "sm:max-w-sm"
      } px-4 sm:px-0 pb-4 sm:pb-0 pointer-events-none ${
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
                {expanded ? "Настройки cookie" : "Печенье на борту"}
              </p>
              <h3 className="text-sm font-semibold text-[#111] leading-tight">
                {expanded
                  ? "Выберите, какие cookie разрешить"
                  : "Мы используем cookie, чтобы полёт был мягче"}
              </h3>
            </div>
          </div>

          {!expanded && (
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
          )}

          {expanded && (
            <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto -mx-1 px-1">
              {CATEGORIES.map((c) => {
                const on = cats[c.key];
                return (
                  <div
                    key={c.key}
                    className={`border rounded-xl p-3 transition-all ${
                      on
                        ? "border-[#7B9D52]/40 bg-[#7B9D52]/5"
                        : "border-[#e8e8e6] bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          on ? "bg-[#7B9D52]/15" : "bg-[#f2f2f0]"
                        }`}
                      >
                        <Icon
                          name={c.icon}
                          size={14}
                          className={on ? "text-[#7B9D52]" : "text-[#8a8a8a]"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#111] flex items-center gap-1.5">
                            {c.title}
                            {c.locked && (
                              <Icon
                                name="Lock"
                                size={10}
                                className="text-[#c0c0bc]"
                              />
                            )}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggle(c.key)}
                            disabled={c.locked}
                            aria-pressed={on}
                            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                              on ? "bg-[#7B9D52]" : "bg-[#d4d4d2]"
                            } ${c.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                                on ? "left-[18px]" : "left-0.5"
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-xs text-[#8a8a8a] mt-1 leading-snug">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[11px] text-[#8a8a8a] hover:text-[#111] underline underline-offset-2 mt-2"
              >
                Подробнее в политике конфиденциальности
              </a>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {expanded ? (
              <>
                <button
                  onClick={saveCustom}
                  className="flex-1 bg-[#111] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#333] transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="Check" size={14} />
                  Сохранить выбор
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-[#f7f7f6] text-[#444] text-sm font-medium py-2.5 rounded-xl hover:bg-[#ececea] transition-all"
                >
                  Принять все
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={acceptAll}
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
                  onClick={acceptEssential}
                  className="flex-1 bg-[#f7f7f6] text-[#444] text-sm font-medium py-2.5 rounded-xl hover:bg-[#ececea] transition-all"
                >
                  Только нужное
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full mt-3 text-[11px] text-[#8a8a8a] hover:text-[#111] transition-colors flex items-center justify-center gap-1.5"
          >
            <Icon
              name={expanded ? "ChevronUp" : "Settings2"}
              size={12}
            />
            {expanded ? "Свернуть" : "Настроить категории"}
          </button>
        </div>
      </div>
    </div>
  );
}
