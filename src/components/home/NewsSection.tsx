import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const NEWS_API = "https://functions.poehali.dev/4646c7cb-dd1b-424c-ab23-10d543cfc8c4";

type NewsItem = {
  tag: string;
  date: string;
  title: string;
  desc: string;
  icon: string;
  link?: string;
};

const fallbackNews: NewsItem[] = [
  {
    tag: "ВИЗЫ",
    date: "",
    title: "Таиланд продлил безвизовый въезд для россиян до 60 дней",
    desc: "Правило действует при наличии обратного билета и подтверждённого жилья.",
    icon: "FileCheck",
  },
  {
    tag: "АВИАЦИЯ",
    date: "",
    title: "Аэрофлот добавил рейсы в Гавану и Варадеро на лето",
    desc: "Прямые перелёты из Москвы — 3 раза в неделю с 1 июня.",
    icon: "Plane",
  },
  {
    tag: "АЭРОПОРТЫ",
    date: "",
    title: "Шереметьево открыло обновлённый терминал C",
    desc: "Новые зоны досмотра и автоматические стойки регистрации сократили очереди.",
    icon: "Building2",
  },
  {
    tag: "ТУРИЗМ",
    date: "",
    title: "Турция упростила процедуру электронной визы",
    desc: "Срок оформления e-Visa сократился до нескольких минут, оплата картой РФ.",
    icon: "Globe",
  },
  {
    tag: "ПУТЕШЕСТВИЯ",
    date: "",
    title: "ОАЭ запустили новые маршруты в горы Хаджар",
    desc: "Туристические тропы и кемпинги в эмирате Рас-эль-Хайма.",
    icon: "MapPin",
  },
  {
    tag: "АВИАЦИЯ",
    date: "",
    title: "Россия и Индия расширили авиасообщение",
    desc: "Добавлены рейсы Москва — Гоа и Санкт-Петербург — Дели.",
    icon: "Plane",
  },
];

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadNews = () => {
      fetch(`${NEWS_API}?t=${Date.now()}`)
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (Array.isArray(data?.news) && data.news.length > 0) {
            setNews(data.news);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setNewsLoading(false);
        });
    };
    loadNews();
    const newsTimer = setInterval(loadNews, 3600000);

    return () => {
      cancelled = true;
      clearInterval(newsTimer);
    };
  }, []);

  return (
    <section className="px-6 pb-12 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-sm font-medium tracking-[0.15em] uppercase text-[#8a8a8a] font-['IBM_Plex_Mono']">
          Новости для путешественников
        </h2>
        <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono'] flex items-center gap-1.5">
          {newsLoading ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#c0c0bc] animate-pulse" />
              ОБНОВЛЯЕМ…
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7B9D52]" />
              АКТУАЛЬНО
            </>
          )}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {news.slice(0, 6).map((item) => {
          const Wrap = item.link ? "a" : "article";
          const wrapProps = item.link
            ? { href: item.link, target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <Wrap
              key={item.title}
              {...wrapProps}
              className="bg-white border border-[#e8e8e6] rounded-2xl p-4 hover:border-[#111] transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] tracking-[0.15em] font-['IBM_Plex_Mono'] text-[#7B9D52] bg-[#7B9D52]/10 px-2 py-1 rounded">
                  {item.tag}
                </span>
                <Icon
                  name={item.icon}
                  size={14}
                  className="text-[#c0c0bc] group-hover:text-[#111] transition-colors"
                />
              </div>
              <h3 className="text-sm font-semibold text-[#111] leading-snug mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-[#8a8a8a] flex-1 leading-relaxed">
                {item.desc}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f0f0ee]">
                <span className="text-[10px] text-[#c0c0bc] font-['IBM_Plex_Mono']">
                  {item.date}
                </span>
                {item.link && (
                  <span className="text-xs text-[#7B9D52] font-medium ml-auto group-hover:underline">
                    Читать
                  </span>
                )}
              </div>
            </Wrap>
          );
        })}
      </div>
    </section>
  );
}