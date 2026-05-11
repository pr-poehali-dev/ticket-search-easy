import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { MASCOT_STORIES } from "@/data/mascotStories";

const MASCOT_IMG =
  "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/d5ad73a9-40a6-498d-b605-f7b4722a5c01.jpg";

export default function MascotTip() {
  const [idx, setIdx] = useState(() =>
    Math.floor(Math.random() * MASCOT_STORIES.length),
  );
  const [copied, setCopied] = useState(false);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MASCOT_STORIES.length);
        setFlip(false);
      }, 220);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const story = useMemo(() => MASCOT_STORIES[idx], [idx]);

  const fillWidget = () => {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      '#tpwl-search input[type="text"], #tpwl-search input',
    );
    let filled = false;
    inputs.forEach((input) => {
      const ph = (input.placeholder || "").toLowerCase();
      const name = (input.name || "").toLowerCase();
      if (
        !filled &&
        (ph.includes("куда") || name.includes("destination") || name.includes("to"))
      ) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        setter?.call(input, story.city);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.focus();
        filled = true;
      }
    });

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(story.city)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        })
        .catch(() => {});
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }

    if (filled) {
      window.scrollTo({
        top: (document.getElementById("tpwl-search")?.offsetTop || 0) - 80,
        behavior: "smooth",
      });
    }
  };

  const change = (dir: 1 | -1) => {
    setFlip(true);
    setTimeout(() => {
      setIdx((i) => (i + dir + MASCOT_STORIES.length) % MASCOT_STORIES.length);
      setFlip(false);
    }, 180);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1f17] via-[#222820] to-[#1a1f17] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
      {/* Декоративные элементы */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B9D52] opacity-20 blur-3xl rounded-full -translate-y-20 translate-x-20 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#c97a2b] opacity-10 blur-3xl rounded-full translate-y-20 pointer-events-none" />

      {/* Тонкая верхняя линия */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7B9D52]/60 to-transparent" />

      <div className="relative grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-0">
        {/* Маскот */}
        <div className="hidden sm:flex flex-col items-center justify-center px-7 py-7 border-r border-white/5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B9D52] to-[#c97a2b] rounded-full blur-xl opacity-40" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/15 shadow-2xl">
              <img
                src={MASCOT_IMG}
                alt="Гоша"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7B9D52] border-[3px] border-[#1a1f17] flex items-center justify-center">
              <Icon name="Plane" size={11} className="text-white" />
            </span>
          </div>
          <p className="mt-3 text-white text-sm font-semibold">Гоша</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-['IBM_Plex_Mono'] mt-0.5">
            Капитан совет
          </p>
        </div>

        {/* Контент */}
        <div className="p-5 sm:p-7 flex flex-col">
          <div className="flex items-start gap-3 mb-4">
            <div className="sm:hidden w-11 h-11 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
              <img
                src={MASCOT_IMG}
                alt="Гоша"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9D52] animate-pulse" />
                <p className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-['IBM_Plex_Mono'] font-medium">
                  Гоша рекомендует
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/8 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                <Icon name="MapPin" size={11} className="text-[#c97a2b]" />
                <span className="text-[11px] text-white/80 font-medium">
                  {story.tag}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => change(-1)}
                aria-label="Назад"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
              >
                <Icon name="ChevronLeft" size={14} />
              </button>
              <button
                onClick={() => change(1)}
                aria-label="Далее"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all"
              >
                <Icon name="ChevronRight" size={14} />
              </button>
            </div>
          </div>

          <div
            className={`transition-all duration-220 ${
              flip ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}
          >
            <h3 className="text-white text-2xl sm:text-3xl font-semibold leading-tight mb-2 flex items-center gap-3 flex-wrap">
              <span className="text-3xl">{story.emoji}</span>
              <span>{story.city}</span>
            </h3>

            <div className="relative pl-4 mb-5">
              <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#7B9D52] to-transparent rounded-full" />
              <p className="text-sm sm:text-[15px] text-white/75 leading-relaxed italic">
                «{story.hint}»
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-auto">
            <button
              onClick={fillWidget}
              className="group/btn relative bg-white text-[#111] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#f5efe3] transition-all flex items-center gap-2 shadow-lg"
            >
              {copied ? (
                <>
                  <Icon name="Check" size={14} className="text-[#7B9D52]" />
                  Город скопирован
                </>
              ) : (
                <>
                  <Icon
                    name="Plane"
                    size={14}
                    className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                  />
                  Хочу туда
                </>
              )}
            </button>
            <button
              onClick={() => change(1)}
              className="sm:hidden text-xs text-white/60 hover:text-white px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Icon name="Shuffle" size={12} />
              Другой
            </button>
            <span className="ml-auto text-[10px] text-white/30 font-['IBM_Plex_Mono'] tracking-wider">
              {String(idx + 1).padStart(2, "0")} /{" "}
              {String(MASCOT_STORIES.length).padStart(2, "0")}
            </span>
          </div>

          {/* Прогресс-полоса */}
          <div className="mt-4 h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7B9D52] to-[#c97a2b] transition-all duration-300"
              style={{
                width: `${((idx + 1) / MASCOT_STORIES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
