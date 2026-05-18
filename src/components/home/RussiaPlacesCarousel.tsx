import { useEffect, useState } from "react";

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

export default function RussiaPlacesCarousel() {
  const [placeIdx, setPlaceIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setPlaceIdx((i) => (i + 1) % RUSSIA_PLACES.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#ececea] aspect-[16/11] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.25)]">
      {RUSSIA_PLACES.map((place, i) => (
        <img
          key={place.title}
          src={place.image}
          alt={place.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === placeIdx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
        <span className="text-base">🇷🇺</span>
        <span className="text-[#111] text-sm font-semibold">
          Открой свою Россию
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <p className="text-white/70 text-xs uppercase tracking-[0.2em] font-['IBM_Plex_Mono'] mb-2">
          {RUSSIA_PLACES[placeIdx].title}
        </p>
        <h3 className="text-white text-2xl sm:text-3xl font-semibold leading-tight">
          {RUSSIA_PLACES[placeIdx].subtitle}
        </h3>
        <button className="mt-4 inline-flex items-center gap-2 bg-white text-[#111] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition shadow-lg">
          Посмотреть тур
          <span className="text-[#7B9D52] font-semibold">
            {RUSSIA_PLACES[placeIdx].price}
          </span>
        </button>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {RUSSIA_PLACES.map((_, i) => (
          <button
            key={i}
            onClick={() => setPlaceIdx(i)}
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