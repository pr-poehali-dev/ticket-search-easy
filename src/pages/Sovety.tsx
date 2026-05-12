import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { MASCOT_STORIES } from "@/data/mascotStories";

const MASCOT_IMG =
  "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/d5ad73a9-40a6-498d-b605-f7b4722a5c01.jpg";

const PRICES_URL =
  "https://functions.poehali.dev/6f273ff8-63ba-4314-9b24-8b61b3901f87";

type PriceInfo = { price: number; month: string };
type Filter = "all" | string;

const formatPrice = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";

export default function Sovety() {
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [copiedCity, setCopiedCity] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({});
  const [pricesLoading, setPricesLoading] = useState(true);

  const tags = useMemo(() => {
    const set = new Set(MASCOT_STORIES.map((s) => s.tag));
    return Array.from(set);
  }, []);

  const visible = useMemo(
    () =>
      filter === "all"
        ? MASCOT_STORIES
        : MASCOT_STORIES.filter((s) => s.tag === filter),
    [filter],
  );

  useEffect(() => {
    document.title = "Советы Гоши — путешествия по России | КОМПАС";
  }, []);

  useEffect(() => {
    const iatas = Array.from(
      new Set(
        MASCOT_STORIES.map((s) => s.iata).filter((x): x is string => Boolean(x)),
      ),
    );
    if (iatas.length === 0) return;

    fetch(`${PRICES_URL}?destinations=${iatas.join(",")}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.prices) setPrices(d.prices);
      })
      .catch(() => {})
      .finally(() => setPricesLoading(false));
  }, []);

  const goSearch = (city: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(city).catch(() => {});
    }
    setCopiedCity(city);
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#e5e5e3]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1a1f17]">
        {/* фоновый коллаж */}
        <div className="absolute inset-0 grid grid-cols-5 opacity-30">
          {MASCOT_STORIES.slice(0, 5).map((s) => (
            <div
              key={s.bg}
              className="bg-cover bg-center"
              style={{ backgroundImage: `url(${s.bg})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d100b]/95 via-[#1a1f17]/85 to-[#0d100b]/95" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7B9D52] opacity-20 blur-[140px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#c97a2b] opacity-15 blur-[120px] rounded-full translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs tracking-[0.2em] uppercase font-['IBM_Plex_Mono'] mb-10 transition-colors"
          >
            <Icon name="ArrowLeft" size={14} />
            На главную
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-8">
            {/* аватар Гоши */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7B9D52] to-[#c97a2b] rounded-full blur-2xl opacity-50 scale-110" />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-[3px] border-white/20 shadow-2xl">
                <img
                  src={MASCOT_IMG}
                  alt="Гоша"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#7B9D52] border-[3px] border-[#1a1f17] flex items-center justify-center shadow-lg">
                <Icon name="Plane" size={16} className="text-white" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/15 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9D52] animate-pulse" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-white/80 font-['IBM_Plex_Mono'] font-medium">
                  Бортовой журнал Гоши
                </span>
              </div>
              <h1 className="text-white text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight">
                Советы для тех,<br />
                кто <span className="italic text-[#c97a2b]">в пути</span>
              </h1>
              <p className="mt-5 text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed">
                {MASCOT_STORIES.length} историй о самых красивых местах России — от вулканов Камчатки
                до готики Калининграда. Куда лететь, когда брать билеты и что не упустить.
              </p>

              {/* мини-стата */}
              <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
                <Stat value={MASCOT_STORIES.length} label="Направлений" />
                <Stat value={tags.length} label="Регионов" />
                <Stat value="11" label="Часовых поясов" />
                {(() => {
                  const list = Object.values(prices);
                  if (list.length === 0) return null;
                  const min = Math.min(...list.map((p) => p.price));
                  return (
                    <Stat
                      value={`от ${formatPrice(min)}`}
                      label="Билет в одну сторону"
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* волна снизу */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-12 text-[#e5e5e3]"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,70 1440,60 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* ФИЛЬТРЫ */}
      <section className="sticky top-16 z-30 bg-[#e5e5e3]/90 backdrop-blur-md border-b border-[#d8d8d4]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="Все"
              icon="Sparkles"
              count={MASCOT_STORIES.length}
            />
            {tags.map((tag) => {
              const count = MASCOT_STORIES.filter((s) => s.tag === tag).length;
              return (
                <FilterChip
                  key={tag}
                  active={filter === tag}
                  onClick={() => setFilter(tag)}
                  label={tag}
                  count={count}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* КАРТОЧКИ */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((story, i) => {
            const id = MASCOT_STORIES.indexOf(story);
            const isOpen = openId === id;
            const price = story.iata ? prices[story.iata] : undefined;
            return (
              <article
                key={story.tag + i}
                className="group relative overflow-hidden rounded-3xl bg-[#1a1f17] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)] hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1"
              >
                {/* фон */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${story.bg})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d100b] via-[#0d100b]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#7B9D52]/0 via-transparent to-[#c97a2b]/0 group-hover:from-[#7B9D52]/15 group-hover:to-[#c97a2b]/15 transition-all duration-500" />

                {/* номер */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-['IBM_Plex_Mono'] font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                    №{String(id + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* IATA */}
                {story.iata && (
                  <div className="absolute top-5 right-5 z-10">
                    <span className="text-[11px] font-bold text-white bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 font-['IBM_Plex_Mono']">
                      {story.iata}
                    </span>
                  </div>
                )}

                {/* Ценник — кликабельный */}
                {price && (
                  <button
                    onClick={() => goSearch(story.city)}
                    aria-label={`Найти билеты от ${formatPrice(price.price)}`}
                    className="absolute top-14 right-5 z-10 animate-fade-in group/price"
                  >
                    <div className="bg-gradient-to-br from-[#c97a2b] to-[#a8631f] text-white rounded-2xl px-3 py-2 shadow-2xl border border-white/20 backdrop-blur-sm transition-transform group-hover/price:scale-105 group-hover/price:-rotate-2">
                      <div className="text-[8px] tracking-[0.2em] uppercase text-white/70 font-['IBM_Plex_Mono'] leading-none mb-0.5">
                        от
                      </div>
                      <div className="text-base font-bold leading-none whitespace-nowrap">
                        {formatPrice(price.price)}
                      </div>
                      {price.month && (
                        <div className="text-[9px] text-white/80 mt-0.5 capitalize leading-none">
                          {price.month}
                        </div>
                      )}
                    </div>
                  </button>
                )}
                {!price && story.iata && pricesLoading && (
                  <div className="absolute top-14 right-5 z-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-2 border border-white/15">
                      <div className="w-12 h-3 bg-white/20 rounded animate-pulse" />
                    </div>
                  </div>
                )}

                <div className="relative p-6 pt-44 sm:pt-56 flex flex-col min-h-[420px]">
                  {/* эмоджи */}
                  <div className="absolute top-20 right-6 text-6xl opacity-90 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    {story.emoji}
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15 self-start mb-3">
                    <Icon name="MapPin" size={11} className="text-[#c97a2b]" />
                    <span className="text-[11px] text-white/85 font-medium">
                      {story.tag}
                    </span>
                  </div>

                  <h3 className="text-white text-2xl font-semibold leading-tight mb-1">
                    {story.city}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">{story.title}</p>

                  <p
                    className={`text-white/75 text-sm leading-relaxed mb-4 ${
                      isOpen ? "" : "line-clamp-3"
                    }`}
                  >
                    {story.text}
                  </p>

                  {/* подсказка */}
                  <div className="relative pl-3 mb-5">
                    <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-[#7B9D52] to-[#c97a2b] rounded-full" />
                    <p className="text-[13px] text-[#c97a2b] italic leading-snug">
                      «{story.hint}»
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => goSearch(story.city)}
                      className="bg-white text-[#111] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#f5efe3] transition-all flex items-center gap-1.5 shadow-lg"
                    >
                      {copiedCity === story.city ? (
                        <>
                          <Icon name="Check" size={13} className="text-[#7B9D52]" />
                          Открываю поиск
                        </>
                      ) : price ? (
                        <>
                          <Icon name="Plane" size={13} />
                          От {formatPrice(price.price)}
                        </>
                      ) : (
                        <>
                          <Icon name="Plane" size={13} />
                          Искать билеты
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setOpenId(isOpen ? null : id)}
                      className="text-xs text-white/70 hover:text-white px-3 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 transition-all flex items-center gap-1.5"
                    >
                      <Icon name={isOpen ? "Minus" : "Plus"} size={12} />
                      {isOpen ? "Свернуть" : "Подробнее"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA снизу */}
        <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7B9D52] to-[#5d7a3e] p-8 sm:p-12">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#c97a2b] opacity-30 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-5xl sm:text-6xl">🧭</div>
            <div className="flex-1">
              <h3 className="text-white text-2xl sm:text-3xl font-semibold mb-2 leading-tight">
                Не знаешь, куда полететь?
              </h3>
              <p className="text-white/85 text-sm sm:text-base">
                Возвращайся на главную — поможем подобрать билеты по бюджету и датам.
              </p>
            </div>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="bg-white text-[#1a1f17] font-semibold px-6 py-3 rounded-full hover:bg-[#f5efe3] transition-all flex items-center gap-2 shadow-xl shrink-0"
            >
              <Icon name="Search" size={16} />
              К поиску билетов
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-white text-2xl sm:text-3xl font-semibold leading-none">
        {value}
      </div>
      <div className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-['IBM_Plex_Mono'] mt-1">
        {label}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-[#1a1f17] text-white shadow-md"
          : "bg-white text-[#444] hover:bg-[#f5efe3] border border-[#d8d8d4]"
      }`}
    >
      {icon && <Icon name={icon} size={13} />}
      {label}
      <span
        className={`text-[10px] font-['IBM_Plex_Mono'] px-1.5 py-0.5 rounded-full ${
          active ? "bg-white/15 text-white/80" : "bg-[#f0efeb] text-[#888]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}