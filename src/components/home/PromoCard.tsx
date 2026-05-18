import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { MASCOT_STORIES } from "@/data/mascotStories";

const RUSSIA_PLACES = [
  {
    title: "Карелия",
    subtitle: "Сказочные озёра и северные леса",
    price: "от 7 000 ₽",
    image:
      "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/c1ae18fc-a231-45cf-b996-ad86f6e00123.jpg",
  },
  {
    title: "Камчатка",
    subtitle: "Вулканы, гейзеры и Тихий океан",
    price: "от 18 500 ₽",
    image:
      "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/82195427-9fa4-42a1-ae78-490be6bcf080.jpg",
  },
  {
    title: "Алтай",
    subtitle: "Горные реки и бирюзовые озёра",
    price: "от 9 200 ₽",
    image:
      "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/0e6dbf50-3100-4377-9c35-e00284ed5662.jpg",
  },
  {
    title: "Байкал",
    subtitle: "Самое глубокое озеро планеты",
    price: "от 12 000 ₽",
    image:
      "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/89de5751-2ccb-4d8e-a187-634acbb29504.jpg",
  },
  {
    title: "Сочи",
    subtitle: "Море, горы и субтропики круглый год",
    price: "от 5 500 ₽",
    image:
      "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/c2cfbbd8-2765-4554-9ed9-7fcb992d3b15.jpg",
  },
];

type Mode = "russia" | "tip";

export default function PromoCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("russia");
  const [placeIdx, setPlaceIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(() =>
    Math.floor(Math.random() * MASCOT_STORIES.length),
  );
  const [fading, setFading] = useState(false);
  const [copied, setCopied] = useState(false);

  const story = useMemo(() => MASCOT_STORIES[tipIdx], [tipIdx]);
  const place = RUSSIA_PLACES[placeIdx];

  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        if (mode === "russia") {
          setMode("tip");
        } else {
          setMode("russia");
          setPlaceIdx((i) => (i + 1) % RUSSIA_PLACES.length);
          setTipIdx((i) => (i + 1) % MASCOT_STORIES.length);
        }
        setFading(false);
      }, 350);
    }, 7000);
    return () => clearInterval(t);
  }, [mode]);

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
        (ph.includes("куда") ||
          name.includes("destination") ||
          name.includes("to"))
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
    }

    if (filled) {
      window.scrollTo({
        top: (document.getElementById("tpwl-search")?.offsetTop || 0) - 80,
        behavior: "smooth",
      });
    }
  };

  const goToMode = (m: Mode) => {
    if (m === mode) return;
    setFading(true);
    setTimeout(() => {
      setMode(m);
      setFading(false);
    }, 300);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#1a1f17] aspect-[16/11] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.25)]">
      {/* Фон: фото Россия */}
      {RUSSIA_PLACES.map((p, i) => (
        <img
          key={p.title}
          src={p.image}
          alt={p.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            mode === "russia" && i === placeIdx && !fading
              ? "opacity-100"
              : "opacity-0"
          }`}
        />
      ))}
      {/* Фон: фото совета */}
      {MASCOT_STORIES.map((s, i) => (
        <div
          key={s.bg}
          aria-hidden
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            mode === "tip" && i === tipIdx && !fading
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${s.bg})` }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Плашка-заголовок сверху */}
      <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
        {mode === "russia" ? (
          <>
            <span className="text-base">🇷🇺</span>
            <span className="text-[#111] text-sm font-semibold">
              Открой свою Россию
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B9D52] animate-pulse" />
            <span className="text-[#111] text-sm font-semibold">
              Совет дня
            </span>
          </>
        )}
      </div>

      {/* Переключатель режимов */}
      <div className="absolute top-5 right-5 flex gap-1">
        <button
          onClick={() => goToMode("russia")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            mode === "russia"
              ? "bg-white text-[#111]"
              : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
          }`}
        >
          Россия
        </button>
        <button
          onClick={() => goToMode("tip")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            mode === "tip"
              ? "bg-white text-[#111]"
              : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
          }`}
        >
          Совет
        </button>
      </div>

      {/* Контент */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 sm:p-8 transition-all duration-300 ${
          fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        {mode === "russia" ? (
          <>
            <p className="text-white/70 text-xs uppercase tracking-[0.2em] font-['IBM_Plex_Mono'] mb-2">
              {place.title}
            </p>
            <h3 className="text-white text-2xl sm:text-3xl font-semibold leading-tight">
              {place.subtitle}
            </h3>
            <button className="mt-4 inline-flex items-center gap-2 bg-white text-[#111] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition shadow-lg">
              Посмотреть тур
              <span className="text-[#7B9D52] font-semibold">
                {place.price}
              </span>
            </button>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15 mb-3">
              <Icon name="MapPin" size={11} className="text-[#c97a2b]" />
              <span className="text-[11px] text-white font-medium">
                {story.tag}
              </span>
            </div>
            <h3 className="text-white text-2xl sm:text-3xl font-semibold leading-tight mb-2 flex items-center gap-2 flex-wrap">
              <span className="text-3xl">{story.emoji}</span>
              <span>{story.city}</span>
            </h3>
            <p className="text-white/80 text-sm leading-relaxed italic mb-4 line-clamp-2">
              «{story.hint}»
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={fillWidget}
                className="bg-white text-[#111] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition flex items-center gap-2 shadow-lg"
              >
                {copied ? (
                  <>
                    <Icon name="Check" size={14} className="text-[#7B9D52]" />
                    Скопировано
                  </>
                ) : (
                  <>
                    <Icon name="Plane" size={14} />
                    Хочу туда
                  </>
                )}
              </button>
              <button
                onClick={() => navigate("/sovety")}
                className="text-xs text-white px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 transition flex items-center gap-1.5 backdrop-blur-sm"
              >
                <Icon name="BookOpen" size={12} />
                Все советы
              </button>
            </div>
          </>
        )}
      </div>

      {/* Точки-индикаторы */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {mode === "russia" &&
          RUSSIA_PLACES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFading(true);
                setTimeout(() => {
                  setPlaceIdx(i);
                  setFading(false);
                }, 200);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === placeIdx ? "w-5 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
      </div>
    </div>
  );
}
