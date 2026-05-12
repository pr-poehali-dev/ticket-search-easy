import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/hooks/useAuth";
import { ticketsApi } from "@/hooks/useTickets";

const DEPARTMENTS = [
  "Общие вопросы",
  "Бронирование и билеты",
  "Возврат и обмен",
  "Страхование",
  "Технические проблемы",
  "Сотрудничество",
  "Жалобы и предложения",
];

export default function Contacts() {
  const { user, loading } = useAuth();
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await ticketsApi.create({
        subject,
        message,
        department,
        city,
        contact_phone: phone || user.phone || "",
        contact_email: user.email,
        contact_position: position,
      });
      setCreatedId(res.ticket.id);
      setSubject("");
      setCity("");
      setPhone("");
      setPosition("");
      setMessage("");
      setDepartment(DEPARTMENTS[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f6] flex items-center justify-center">
        <div className="text-[#8a8a8a]">Загрузка…</div>
      </div>
    );
  }

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
            {!user ? (
              <div className="bg-white border border-[#e8e8e6] rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-[#fff7e6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Lock" size={24} className="text-[#b07b00]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111] mb-2">
                  Войдите, чтобы отправить обращение
                </h3>
                <p className="text-sm text-[#8a8a8a] mb-5">
                  Так мы сможем сохранить переписку у вас в личном кабинете
                  и отправить ответ.
                </p>
                <Link
                  to="/cabinet"
                  className="inline-flex items-center gap-2 bg-[#7B9D52] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#6b8a47] transition-colors"
                >
                  <Icon name="LogIn" size={16} />
                  Войти или зарегистрироваться
                </Link>
              </div>
            ) : createdId ? (
              <div className="bg-white border border-[#e8e8e6] rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Check" size={24} className="text-[#2e7d32]" />
                </div>
                <h3 className="text-lg font-semibold text-[#111] mb-2">
                  Обращение №{createdId} принято
                </h3>
                <p className="text-sm text-[#8a8a8a] mb-5">
                  Переписку и ответ вы найдёте в личном кабинете во вкладке
                  «Обращения».
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    to="/cabinet?tab=tickets"
                    className="inline-flex items-center gap-2 bg-[#111] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors"
                  >
                    <Icon name="Inbox" size={16} />
                    Открыть мои обращения
                  </Link>
                  <button
                    onClick={() => setCreatedId(null)}
                    className="text-sm font-medium text-[#111] underline underline-offset-4"
                  >
                    Отправить ещё одно
                  </button>
                </div>
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
                    Подразделение
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] bg-white focus:outline-none focus:border-[#111] transition-colors"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium block mb-1.5">
                    Тема обращения
                  </label>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Кратко суть"
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium block mb-1.5">
                      Город
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Москва"
                      className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium block mb-1.5">
                      Телефон
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 999 000-00-00"
                      className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] placeholder:text-[#c0c0bc] focus:outline-none focus:border-[#111] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium block mb-1.5">
                    Должность / пост (опционально)
                  </label>
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Например, директор по продажам"
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

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#111] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Отправляем…" : "Отправить обращение"}
                </button>

                <p className="text-xs text-[#8a8a8a] text-center">
                  Вы войдёте как <span className="font-medium text-[#111]">{user.email}</span>.
                  Ответ придёт в личный кабинет.
                </p>
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
