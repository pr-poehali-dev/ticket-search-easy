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

  // Меняем подсказку автоматически каждые 12 секунд
  useEffect(() => {
    const t = setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MASCOT_STORIES.length);
        setFlip(false);
      }, 200);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const story = useMemo(() => MASCOT_STORIES[idx], [idx]);

  const fillWidget = () => {
    // Пробуем подставить город в поле "Куда" виджета поиска
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

    // Параллельно копируем в буфер обмена — на случай, если поле не нашлось
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

  const next = () => {
    setFlip(true);
    setTimeout(() => {
      setIdx((i) => (i + 1) % MASCOT_STORIES.length);
      setFlip(false);
    }, 180);
  };

  return (
    <div className="bg-gradient-to-br from-white to-[#f7f7f6] border border-[#e8e8e6] rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-stretch">
        {/* Mascot side */}
        <div className="hidden sm:flex flex-shrink-0 w-28 bg-gradient-to-br from-[#f5efe3] to-[#e8d9b8] items-end justify-center relative">
          <img
            src={MASCOT_IMG}
            alt="Гоша"
            className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md -mb-2 -mt-2"
          />
        </div>

        {/* Tip content */}
        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="sm:hidden w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
              <img
                src={MASCOT_IMG}
                alt="Гоша"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] font-medium">
                Гоша советует
              </p>
              <p className="text-xs text-[#7B9D52] font-semibold">
                {story.tag}
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-200 ${
              flip ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            <h3 className="text-base sm:text-lg font-semibold text-[#111] leading-snug mb-1.5 flex items-center gap-2">
              <span className="text-xl">{story.emoji}</span>
              Полетели в {story.city}?
            </h3>
            <p className="text-sm text-[#444] leading-snug mb-3">
              {story.hint}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fillWidget}
              className="bg-[#111] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#333] transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Icon name="Check" size={12} />
                  Город скопирован
                </>
              ) : (
                <>
                  <Icon name="Plane" size={12} />
                  Хочу туда
                </>
              )}
            </button>
            <button
              onClick={next}
              className="text-xs text-[#8a8a8a] hover:text-[#111] transition-colors px-3 py-2 rounded-xl hover:bg-[#f2f2f0] flex items-center gap-1"
            >
              <Icon name="Shuffle" size={12} />
              Другой вариант
            </button>
            {copied && (
              <span className="text-[10px] text-[#7B9D52] font-['IBM_Plex_Mono']">
                вставь в поле «Куда»
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
