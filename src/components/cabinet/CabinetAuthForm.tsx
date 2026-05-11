import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "register";

export default function CabinetAuthForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register" && !agree) {
      setError("Необходимо согласиться с условиями");
      return;
    }
    setLoading(true);
    const result = mode === "login"
      ? await login(email, password)
      : await register(email, password, firstName, lastName);
    setLoading(false);
    if (result.ok) onSuccess();
    else setError(result.error || "Ошибка");
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="User" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#111]">
            {mode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
          </h1>
          <p className="text-[#8a8a8a] mt-1 text-sm">
            {mode === "login" ? "Введите email и пароль" : "Зарегистрируйтесь бесплатно"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e8e6] p-6 shadow-sm">
          <div className="flex gap-1 bg-[#f2f2f0] rounded-xl p-1 mb-6">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m ? "bg-white text-[#111] shadow-sm" : "text-[#8a8a8a]"
                }`}
              >
                {m === "login" ? "Вход" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Имя</label>
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Иван"
                    required
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Фамилия</label>
                  <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Иванов"
                    required
                    className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ivanov@mail.ru"
                required
                className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#8a8a8a] uppercase tracking-wider font-['IBM_Plex_Mono'] font-medium mb-1.5 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="w-full border border-[#e8e8e6] rounded-xl px-4 py-3 text-sm text-[#111] focus:outline-none focus:border-[#111] transition-colors"
              />
            </div>

            {mode === "register" && (
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <span className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      agree
                        ? "bg-[#7B9D52] border-[#7B9D52]"
                        : "border-[#d4d4d2] group-hover:border-[#111]"
                    }`}
                  >
                    {agree && (
                      <Icon name="Check" size={13} className="text-white" strokeWidth={3} />
                    )}
                  </span>
                </span>
                <span className="text-xs text-[#8a8a8a] leading-relaxed">
                  Я согласен с{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#111] underline underline-offset-2 hover:text-[#7B9D52]"
                  >
                    пользовательским соглашением
                  </a>{" "}
                  и{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[#111] underline underline-offset-2 hover:text-[#7B9D52]"
                  >
                    политикой конфиденциальности
                  </a>
                  .
                </span>
              </label>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || (mode === "register" && !agree)}
              className="w-full bg-[#7B9D52] text-white py-3.5 rounded-xl font-semibold hover:bg-[#6a8a44] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}