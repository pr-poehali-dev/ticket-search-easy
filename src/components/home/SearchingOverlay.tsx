import Icon from "@/components/ui/icon";

export default function SearchingOverlay() {
  return (
    <section className="px-6 pb-6 max-w-6xl mx-auto animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1f17] via-[#222820] to-[#1a1f17] p-6 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.35)]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#7B9D52] opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c97a2b] opacity-15 blur-3xl rounded-full translate-y-1/3 pointer-events-none" />

        <div className="relative flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
              <Icon
                name="Plane"
                size={20}
                className="text-white animate-[bounce_1.4s_ease-in-out_infinite]"
              />
            </div>
            <span className="absolute inset-0 rounded-full border-2 border-[#7B9D52]/40 animate-ping" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-['IBM_Plex_Mono'] font-medium mb-1">
              Поиск запущен
            </p>
            <h3 className="text-white text-base sm:text-lg font-semibold leading-tight">
              Подбираем лучшие предложения…
            </h3>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              Сравниваем сотни авиакомпаний — обычно 5–15 секунд
            </p>
          </div>
        </div>

        <div className="relative mt-4 h-[3px] bg-white/5 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#7B9D52] to-transparent animate-[shimmer_1.6s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}