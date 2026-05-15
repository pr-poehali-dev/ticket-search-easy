import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/d59d455f-da30-4c36-b8cc-878db1ba737a";

type AirportItem = {
  airport: string;
  city: string;
  status: "restriction" | "resume";
  restrictedAt: string;
  resumedAt: string;
};

type Override = {
  id: number;
  airport: string;
  city: string;
  action: "add" | "remove";
  note: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
};

const EXPIRY_PRESETS: { label: string; hours: number | null }[] = [
  { label: "Без срока", hours: null },
  { label: "6 часов", hours: 6 },
  { label: "12 часов", hours: 12 },
  { label: "Сутки", hours: 24 },
  { label: "3 дня", hours: 72 },
];

function hoursToIso(hours: number | null): string {
  if (!hours) return "";
  const d = new Date(Date.now() + hours * 3600 * 1000);
  return d.toISOString();
}

function formatExpiry(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CabinetAirportControl({ email }: { email: string }) {
  const [items, setItems] = useState<AirportItem[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [airport, setAirport] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [expiryHours, setExpiryHours] = useState<number | null>(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await fetch(`${API}?admin=1&t=${Date.now()}`, {
        headers: { "X-User-Email": email },
      });
      const data = await r.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
      setOverrides(Array.isArray(data?.overrides) ? data.overrides : []);
    } catch {
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (
    op: "add" | "remove",
    a: string,
    c: string,
    n: string,
    expiresAt: string = "",
  ) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": email,
        },
        body: JSON.stringify({ op, airport: a, city: c, note: n, expiresAt }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d?.error || "Ошибка");
      }
      setAirport("");
      setCity("");
      setNote("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  const removeOverride = async (id: number) => {
    setBusy(true);
    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Email": email },
        body: JSON.stringify({ op: "delete", id }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const restricted = items.filter((i) => i.status === "restriction");

  return (
    <div className="bg-white border border-[#e8e8e6] rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#fff3c4] rounded-xl flex items-center justify-center">
          <Icon name="TriangleAlert" size={16} className="text-[#7a5a00]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#111] uppercase tracking-wider font-['IBM_Plex_Mono']">
            Аэропорты с ограничениями
          </h3>
          <p className="text-xs text-[#8a8a8a] mt-0.5">
            Автоматически с favt.gov.ru + ручные правки
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-[#8a8a8a]">Загрузка…</div>
      ) : (
        <>
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] mb-2">
              Сейчас в строке
            </p>
            {restricted.length === 0 ? (
              <p className="text-sm text-[#8a8a8a]">Нет активных ограничений.</p>
            ) : (
              <div className="space-y-1.5">
                {restricted.map((i) => (
                  <div
                    key={i.airport}
                    className="flex items-center justify-between gap-2 bg-[#fff7e6] border border-[#f0d97a] rounded-xl px-3 py-2"
                  >
                    <div className="text-sm">
                      <span className="font-semibold text-[#111]">{i.airport}</span>
                      <span className="text-[#8a8a8a]"> · {i.city}</span>
                      {i.restrictedAt && (
                        <span className="text-xs text-[#8a8a8a] ml-2">с {i.restrictedAt}</span>
                      )}
                    </div>
                    <button
                      disabled={busy}
                      onClick={() => send("remove", i.airport, i.city, "Снято вручную")}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-[#e8e8e6] hover:border-[#111] text-[#111] disabled:opacity-50"
                    >
                      Снять
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#e8e8e6] space-y-2">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono']">
              Добавить вручную
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={airport}
                onChange={(e) => setAirport(e.target.value)}
                placeholder="Аэропорт (например Шереметьево)"
                className="border border-[#e8e8e6] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#111]"
              />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Город"
                className="border border-[#e8e8e6] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#111]"
              />
            </div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Комментарий (опционально)"
              className="w-full border border-[#e8e8e6] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#111]"
            />
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] mb-1.5">
                Срок действия
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EXPIRY_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setExpiryHours(p.hours)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      expiryHours === p.hours
                        ? "bg-[#7B9D52] border-[#7B9D52] text-white"
                        : "bg-white border-[#e8e8e6] text-[#444] hover:border-[#111]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {expiryHours && (
                <p className="text-[11px] text-[#8a8a8a] mt-1.5">
                  Запись автоматически снимется {formatExpiry(hoursToIso(expiryHours))}
                </p>
              )}
            </div>
            <button
              disabled={busy || !airport.trim() || !city.trim()}
              onClick={() =>
                send(
                  "add",
                  airport.trim(),
                  city.trim(),
                  note.trim(),
                  hoursToIso(expiryHours),
                )
              }
              className="w-full bg-[#111] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#333] disabled:opacity-50"
            >
              Добавить в бегущую строку
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          {overrides.length > 0 && (
            <div className="pt-3 border-t border-[#e8e8e6]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#c0c0bc] font-['IBM_Plex_Mono'] mb-2">
                Журнал ручных правок
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {overrides.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-2 text-xs bg-[#f7f7f6] rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                          o.action === "add" ? "bg-[#e53935]" : "bg-[#7B9D52]"
                        }`}
                      />
                      <span className="font-semibold text-[#111]">
                        {o.action === "add" ? "Добавлен" : "Снят"}
                      </span>{" "}
                      <span className="text-[#444]">{o.airport}</span>
                      {o.city ? <span className="text-[#8a8a8a]"> · {o.city}</span> : null}
                      {o.note && <span className="text-[#8a8a8a]"> — {o.note}</span>}
                      {o.expiresAt && (
                        <span className="text-[#7a5a00] ml-1">
                          · до {formatExpiry(o.expiresAt)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeOverride(o.id)}
                      disabled={busy}
                      className="text-[#8a8a8a] hover:text-[#111] disabled:opacity-50"
                      title="Удалить запись"
                    >
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}