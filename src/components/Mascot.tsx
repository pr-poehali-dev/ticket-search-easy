import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { MASCOT_STORIES as STORIES_DATA } from "@/data/mascotStories";

const MASCOT_IMG =
  "https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/files/d5ad73a9-40a6-498d-b605-f7b4722a5c01.jpg";

const STORIES = STORIES_DATA;

export default function Mascot() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * STORIES.length));
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const bubbleTimer = useRef<number | null>(null);

  // Первый автопоказ облачка через 8 секунд после загрузки
  useEffect(() => {
    const t = setTimeout(() => {
      if (!open) {
        setBubbleVisible(true);
        bubbleTimer.current = window.setTimeout(
          () => setBubbleVisible(false),
          7000,
        );
      }
    }, 8000);
    return () => {
      clearTimeout(t);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    };
  }, []);

  const next = () => setIdx((i) => (i + 1) % STORIES.length);
  const prev = () => setIdx((i) => (i - 1 + STORIES.length) % STORIES.length);

  const openCard = () => {
    setBubbleVisible(false);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setOpen(true);
  };

  const story = STORIES[idx];

  return (
    <div className="fixed z-40 bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-end gap-3">
      {/* Floating tip bubble */}
      {bubbleVisible && !open && (
        <div className="hidden sm:block animate-slide-up max-w-[220px] bg-white border border-[#e8e8e6] rounded-2xl rounded-bl-sm shadow-lg px-4 py-3 mb-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] font-medium mb-1">
            Привет!
          </p>
          <p className="text-xs text-[#444] leading-snug">
            Я Гоша. Знаю классные места в России — нажми, расскажу 👇
          </p>
          <button
            onClick={() => setBubbleVisible(false)}
            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full hover:bg-[#f2f2f0] flex items-center justify-center text-[#c0c0bc]"
            aria-label="Скрыть"
          >
            <Icon name="X" size={10} />
          </button>
        </div>
      )}

      {/* Mascot button */}
      <div className="relative">
        <button
          onClick={() => (open ? setOpen(false) : openCard())}
          aria-label="Маскот Гоша"
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#f5efe3] to-[#e8d9b8] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.25)] border-2 border-white overflow-hidden hover:scale-105 active:scale-95 transition-transform"
        >
          <img
            src={MASCOT_IMG}
            alt="Гоша — голубь-пилот"
            className="w-full h-full object-cover"
          />
          {!open && (
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#7B9D52] border-2 border-white animate-pulse" />
          )}
        </button>

        {/* Story card */}
        {open && (
          <div className="absolute bottom-full left-0 mb-3 w-[300px] sm:w-[340px] animate-slide-up">
            <div className="relative bg-white border border-[#e8e8e6] rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.22)] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#7B9D52] via-[#c97a2b] to-[#7B9D52]" />

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{story.emoji}</span>
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] font-medium">
                        Гоша рассказывает
                      </p>
                      <p className="text-xs font-semibold text-[#7B9D52]">
                        {story.tag}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Закрыть"
                    className="w-7 h-7 rounded-lg hover:bg-[#f2f2f0] flex items-center justify-center text-[#8a8a8a] flex-shrink-0"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>

                <h3 className="text-base font-semibold text-[#111] leading-tight mb-2">
                  {story.title}
                </h3>
                <p className="text-sm text-[#444] leading-relaxed mb-4">
                  {story.text}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#f0f0ee]">
                  <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono']">
                    {idx + 1} / {STORIES.length}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={prev}
                      aria-label="Предыдущая"
                      className="w-8 h-8 rounded-lg border border-[#e8e8e6] hover:border-[#111] flex items-center justify-center text-[#444] transition-all"
                    >
                      <Icon name="ChevronLeft" size={14} />
                    </button>
                    <button
                      onClick={next}
                      className="h-8 px-3 rounded-lg bg-[#111] text-white text-xs font-semibold hover:bg-[#333] flex items-center gap-1.5 transition-all"
                    >
                      Ещё история
                      <Icon name="ChevronRight" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}