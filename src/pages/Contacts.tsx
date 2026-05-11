import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function Contacts() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        <div className="mb-12 animate-slide-up">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8a8a8a] mb-4 font-['IBM_Plex_Mono']">
            Контакты
          </p>
          <h1 className="text-4xl font-semibold text-[#111] leading-tight">
            Всегда на связи
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-white border border-[#e8e8e6] rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Check" size={24} className="text-[#2e7d32]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111] mb-2">Сообщение отправлено</h3>
                <p className="text-sm text-[#8a8a8a]">Мы ответим вам в течение нескольких часов</p>
                <button
                  onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
                  className="mt-6 text-sm font-medium text-[#111] underline underline-offset-4"
                >
                  Отправить ещё одно
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-[#e8e8e6] rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wider font-['IBM_Plex_Mono'] mb-2">
                  Обратная связь
                </h3>
                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium block mb-1.5">
                    Ваше имя
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Иван Петров"
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium block mb-1.5">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@mail.ru"
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium block mb-1.5">
                    Сообщение
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Опишите ваш вопрос..."
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#111] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors"
                >
                  Отправить
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: "Mail",
                label: "Email поддержки",
                value: "business.dabblrus@bk.ru",
                sub: "Ответим за несколько часов",
              },
              {
                icon: "Phone",
                label: "Телефон",
                value: "+7 (800) 123-45-67",
                sub: "Пн–Пт, 9:00–21:00",
              },
              {
                icon: "MessageCircle",
                label: "Telegram-бот",
                value: "@DUBBLE_RF",
                sub: "Круглосуточно",
              },
            ].map((item) => (
              <div
                key={item.icon}
                className="bg-white border border-[#e8e8e6] rounded-2xl p-5 hover:border-[#ccc] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-[#f2f2f0] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={16} className="text-[#111]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8a8a8a] mb-0.5">{item.label}</p>
                    <p className="text-sm font-semibold text-[#111]">{item.value}</p>
                    <p className="text-xs text-[#aaa] mt-0.5">{item.sub}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-[#f2f2f0] rounded-2xl p-5">
              <p className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-2">
                Время ответа
              </p>
              <p className="text-sm text-[#555]">
                Среднее время первого ответа — <span className="font-semibold text-[#111]">2 часа</span>. В выходные — до 6 часов.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}