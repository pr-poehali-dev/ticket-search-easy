import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const faqs = [
  {
    q: "Как найти самые дешёвые билеты?",
    a: "Используйте гибкие даты — смещение на 1–2 дня часто снижает цену на 30–40%. Также бронируйте заранее: за 2–3 месяца до вылета цены обычно ниже.",
  },
  {
    q: "Можно ли отменить или изменить бронирование?",
    a: "Это зависит от тарифа авиакомпании. Возвратные тарифы допускают отмену с частичным возвратом. Невозвратные — как правило, нет. Условия видны при выборе билета.",
  },
  {
    q: "Как работают уведомления о снижении цен?",
    a: "Добавьте маршрут в Избранное в личном кабинете и включите уведомления. Мы следим за ценами и пришлём письмо, когда стоимость снизится.",
  },
  {
    q: "Безопасно ли оплачивать билеты на сайте?",
    a: "Да. Все платежи обрабатываются через сертифицированные платёжные шлюзы с шифрованием SSL. Данные карты мы не храним.",
  },
  {
    q: "Какой багаж входит в стоимость?",
    a: "Нормы багажа устанавливает авиакомпания. Информация о разрешённом весе и габаритах отображается при выборе билета.",
  },
  {
    q: "Что делать, если рейс задержан или отменён?",
    a: "Свяжитесь с авиакомпанией напрямую — они обязаны организовать пересадку или возврат средств. Дополнительно обратитесь в нашу поддержку.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <div className="mb-12 animate-slide-up">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#8a8a8a] mb-4 font-['IBM_Plex_Mono']">
            Поддержка
          </p>
          <h1 className="text-4xl font-semibold text-[#111] leading-tight">
            Часто задаваемые
            <br />
            вопросы
          </h1>
        </div>

        <div className="space-y-2 animate-fade-in">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-[#e8e8e6] rounded-2xl overflow-hidden hover:border-[#ccc] transition-all"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-medium text-[#111] text-sm pr-4">{faq.q}</span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className={`text-[#8a8a8a] flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-[#555] leading-relaxed border-t border-[#f2f2f0] pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7B9D52] via-[#6b8a47] to-[#5f7d3e] text-white shadow-lg">
          {/* декоративные круги */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-black/10 blur-2xl" />

          <div className="relative p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-['IBM_Plex_Mono'] font-medium">
                  Поддержка на связи
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold leading-tight mb-2">
                Не нашли ответ?
                <br />
                <span className="text-white/85">Напишите нам напрямую.</span>
              </h3>
              <p className="text-white/80 text-sm leading-relaxed max-w-md">
                Среднее время первого ответа — 2 часа. Переписка и история
                сохраняются в вашем личном кабинете.
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                <Link
                  to="/contacts"
                  className="inline-flex items-center gap-2 bg-white text-[#5f7d3e] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#f7f7f6] transition-colors shadow-sm"
                >
                  <Icon name="MessageSquarePlus" size={16} />
                  Создать обращение
                </Link>
                <a
                  href="https://t.me/DUBBLE_RF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Icon name="Send" size={16} />
                  Telegram
                </a>
              </div>
            </div>

            <div className="hidden sm:flex w-28 h-28 rounded-3xl bg-white/15 backdrop-blur-sm items-center justify-center border border-white/20">
              <Icon name="Headphones" size={48} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}