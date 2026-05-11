import json
import re
import urllib.request
from datetime import datetime, timezone, timedelta


SOURCES = [
    "https://t.me/s/rosaviatsia_official",
    "https://t.me/s/aviatorshina",
]

# Аэропорт -> (Город, ключевые слова)
AIRPORTS = {
    "Шереметьево": ("Москва", ["шереметьев"]),
    "Внуково": ("Москва", ["внуков"]),
    "Домодедово": ("Москва", ["домодедов"]),
    "Жуковский": ("Москва", ["жуковск"]),
    "Пулково": ("Санкт-Петербург", ["пулков"]),
    "Сочи": ("Сочи", ["сочи", "адлер"]),
    "Казань": ("Казань", ["казан"]),
    "Уфа": ("Уфа", ["уфа", "уфы", "уфу"]),
    "Курумоч": ("Самара", ["курумоч", "самар"]),
    "Гумрак": ("Волгоград", ["волгоград", "гумрак"]),
    "Гагарин": ("Саратов", ["саратов", "гагарин"]),
    "Грабцево": ("Калуга", ["калуг", "грабцев"]),
    "Стригино": ("Нижний Новгород", ["стригино", "нижн"]),
    "Пашковский": ("Краснодар", ["краснодар", "пашковск"]),
    "Шпаковское": ("Ставрополь", ["ставропол", "шпаковск"]),
    "Минеральные Воды": ("Минеральные Воды", ["минераль"]),
    "Грозный": ("Грозный", ["грозн"]),
    "Уйташ": ("Махачкала", ["махачкал", "уйташ"]),
    "Беслан": ("Владикавказ", ["владикавказ", "беслан"]),
    "Анапа": ("Анапа", ["анап"]),
    "Геленджик": ("Геленджик", ["геленджик"]),
    "Платов": ("Ростов-на-Дону", ["ростов", "платов"]),
    "Туношна": ("Ярославль", ["ярослав", "туношна"]),
    "Ижевск": ("Ижевск", ["ижевск"]),
    "Тамбов": ("Тамбов", ["тамбов"]),
    "Пенза": ("Пенза", ["пенз"]),
    "Псков": ("Псков", ["псков"]),
    "Брянск": ("Брянск", ["брянск"]),
    "Белгород": ("Белгород", ["белгород"]),
    "Курск": ("Курск", ["курск"]),
    "Чертовицкое": ("Воронеж", ["воронеж", "чертовиц"]),
    "Липецк": ("Липецк", ["липецк"]),
    "Южный": ("Орёл", ["орёл", "орел"]),
    "Элиста": ("Элиста", ["элист"]),
}

RESTRICT_KEYWORDS = [
    "ограничен",
    "ограничения",
    "временно закрыт",
    "временно закрыто",
    "приостановлен",
    "приостановлены",
    "не принима",
    "план «ковёр»",
    "план ковёр",
    "план ковер",
]

RESUME_KEYWORDS = [
    "сняты",
    "снято",
    "возобновлен",
    "возобновлён",
    "вновь принимает",
    "штатно",
]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
}


def fetch_html(url: str, timeout: int = 7) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; AirportStatusBot/1.0)",
            "Accept-Language": "ru,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def strip_html(text: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&quot;", '"', text)
    text = re.sub(r"&laquo;|&raquo;", '"', text)
    return text.strip()


def parse_telegram(html: str):
    posts = []
    text_pattern = re.compile(
        r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>',
        re.DOTALL,
    )
    time_pattern = re.compile(r'<time class="time"[^>]*datetime="([^"]+)"')

    texts = text_pattern.findall(html)
    times = time_pattern.findall(html)

    for i, raw_text in enumerate(texts):
        clean = strip_html(raw_text)
        if not clean:
            continue
        ts = times[i] if i < len(times) else ""
        posts.append({"text": clean, "datetime": ts})

    return posts


def detect_airports(text: str):
    found = []
    text_lower = text.lower()
    for name, (city, keywords) in AIRPORTS.items():
        for kw in keywords:
            if kw in text_lower:
                found.append((name, city))
                break
    return found


def is_restriction(text: str) -> bool:
    return any(kw in text.lower() for kw in RESTRICT_KEYWORDS)


def is_resume(text: str) -> bool:
    return any(kw in text.lower() for kw in RESUME_KEYWORDS)


def format_dt(iso_str: str) -> dict:
    if not iso_str:
        return {"text": "", "iso": ""}
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        msk = dt.astimezone(timezone(timedelta(hours=3)))
        months = [
            "янв", "фев", "мар", "апр", "мая", "июн",
            "июл", "авг", "сен", "окт", "ноя", "дек",
        ]
        return {
            "text": f"{msk.day} {months[msk.month - 1]}, {msk.strftime('%H:%M')}",
            "iso": dt.isoformat(),
        }
    except (ValueError, IndexError):
        return {"text": "", "iso": ""}


def handler(event: dict, context) -> dict:
    """
    Статусы аэропортов России: введение и снятие ограничений.
    GET -> { items: [{airport, city, status, restrictedAt, resumedAt}], updatedAt }
    """
    method = event.get("httpMethod", "GET")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    if method != "GET":
        return {
            "statusCode": 405,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Method not allowed"}),
            "isBase64Encoded": False,
        }

    state = {}

    for src in SOURCES:
        try:
            html = fetch_html(src)
            posts = parse_telegram(html)
        except Exception:
            continue

        for post in posts:
            text = post["text"]
            if not text or len(text) < 20:
                continue

            airports = detect_airports(text)
            restriction = is_restriction(text)
            resume = is_resume(text)

            if not airports or (not restriction and not resume):
                continue

            dt_info = format_dt(post["datetime"])

            for ap_name, city in airports:
                entry = state.get(ap_name, {
                    "airport": ap_name,
                    "city": city,
                    "restrictedAt": None,
                    "resumedAt": None,
                    "restrictedAtIso": None,
                    "resumedAtIso": None,
                })

                if resume and not restriction:
                    if not entry["resumedAtIso"] or dt_info["iso"] > entry["resumedAtIso"]:
                        entry["resumedAt"] = dt_info["text"]
                        entry["resumedAtIso"] = dt_info["iso"]
                elif restriction:
                    if not entry["restrictedAtIso"] or dt_info["iso"] > entry["restrictedAtIso"]:
                        entry["restrictedAt"] = dt_info["text"]
                        entry["restrictedAtIso"] = dt_info["iso"]
                        if entry["resumedAtIso"] and entry["resumedAtIso"] < dt_info["iso"]:
                            entry["resumedAt"] = None
                            entry["resumedAtIso"] = None

                state[ap_name] = entry

    items = []
    for entry in state.values():
        r_iso = entry["restrictedAtIso"]
        s_iso = entry["resumedAtIso"]

        if r_iso and (not s_iso or s_iso < r_iso):
            status = "restriction"
            sort_iso = r_iso
        elif s_iso:
            status = "resume"
            sort_iso = s_iso
        else:
            continue

        items.append({
            "airport": entry["airport"],
            "city": entry["city"],
            "status": status,
            "restrictedAt": entry["restrictedAt"] or "",
            "resumedAt": entry["resumedAt"] or "",
            "sortIso": sort_iso,
        })

    items.sort(
        key=lambda x: (
            x["status"] != "restriction",
            -datetime.fromisoformat(x["sortIso"]).timestamp(),
        )
    )

    for it in items:
        it.pop("sortIso", None)

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(
            {"items": items, "updatedAt": datetime.utcnow().isoformat() + "Z"},
            ensure_ascii=False,
        ),
        "isBase64Encoded": False,
    }
