import { useState } from "react";
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

        <div className="mt-12 bg-[#111] text-white rounded-2xl p-8 text-center">
          <p className="text-sm text-[#aaa] mb-2 font-['IBM_Plex_Mono'] uppercase tracking-wider">Не нашли ответ?</p>
          <h3 className="text-xl font-semibold mb-4">Напишите нам</h3>
          <p className="text-[#aaa] text-sm mb-6">Ответим в течение нескольких часов</p>
          <a
            href="mailto:support@flights.ru"
            className="inline-block bg-white text-[#111] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#f2f2f0] transition-colors"
          >
            Написать в поддержку
          </a>
        </div>
      </div>
    </div>
  );
}
