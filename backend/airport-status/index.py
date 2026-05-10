import json
import re
import urllib.request
from datetime import datetime, timezone, timedelta


# Источники мониторинга закрытий аэропортов
SOURCES = [
    "https://t.me/s/rosaviatsia_official",
    "https://t.me/s/aviatorshina",
]

# Аэропорты России — для распознавания упоминаний в тексте
AIRPORTS = {
    "Шереметьево": ["Шереметьев"],
    "Внуково": ["Внуков"],
    "Домодедово": ["Домодедов"],
    "Жуковский": ["Жуковск"],
    "Пулково": ["Пулков"],
    "Сочи": ["Сочи", "Адлер"],
    "Казань": ["Казан"],
    "Уфа": ["Уфа", "Уфы"],
    "Самара": ["Самар", "Курумоч"],
    "Волгоград": ["Волгоград"],
    "Саратов": ["Саратов", "Гагарин"],
    "Калуга": ["Калуг", "Грабцев"],
    "Нижний Новгород": ["Нижн", "Стригино"],
    "Краснодар": ["Краснодар", "Пашковск"],
    "Ставрополь": ["Ставропол"],
    "Минеральные Воды": ["Минераль"],
    "Грозный": ["Грозн"],
    "Махачкала": ["Махачкал", "Уйташ"],
    "Владикавказ": ["Владикавказ", "Беслан"],
    "Анапа": ["Анап"],
    "Геленджик": ["Геленджик"],
    "Ростов-на-Дону": ["Ростов", "Платов"],
    "Ярославль": ["Ярослав", "Туношна"],
    "Ижевск": ["Ижевск"],
    "Тамбов": ["Тамбов"],
    "Пенза": ["Пенз"],
    "Псков": ["Псков"],
    "Брянск": ["Брянск"],
    "Белгород": ["Белгород"],
    "Курск": ["Курск"],
    "Воронеж": ["Воронеж", "Чертовицк"],
    "Липецк": ["Липецк"],
    "Орёл": ["Орёл", "Орел", "Южный"],
    "Элиста": ["Элист"],
}

# Слова, указывающие на ограничения
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

# Слова, указывающие на снятие ограничений
RESUME_KEYWORDS = [
    "сняты",
    "снято",
    "возобновлен",
    "возобновлён",
    "вновь принимает",
    "открыт",
    "штатно",
]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
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
    """Парсит публичную страницу t.me/s/<channel>."""
    posts = []

    # Каждый пост идёт в блоке tgme_widget_message_text
    text_pattern = re.compile(
        r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>',
        re.DOTALL,
    )
    time_pattern = re.compile(
        r'<time class="time"[^>]*datetime="([^"]+)"',
    )

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
    for name, keywords in AIRPORTS.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                found.append(name)
                break
    return found


def is_restriction(text: str) -> bool:
    text_lower = text.lower()
    return any(kw in text_lower for kw in RESTRICT_KEYWORDS)


def is_resume(text: str) -> bool:
    text_lower = text.lower()
    return any(kw in text_lower for kw in RESUME_KEYWORDS)


def format_date(iso_str: str) -> str:
    if not iso_str:
        return ""
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        msk = dt.astimezone(timezone(timedelta(hours=3)))
        months = [
            "янв", "фев", "мар", "апр", "мая", "июн",
            "июл", "авг", "сен", "окт", "ноя", "дек",
        ]
        return f"{msk.day} {months[msk.month - 1]}, {msk.strftime('%H:%M')}"
    except (ValueError, IndexError):
        return ""


def shorten(text: str, limit: int = 220) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def handler(event: dict, context) -> dict:
    """
    Возвращает свежие сообщения о закрытиях/ограничениях работы аэропортов России.
    GET /airport-status -> { alerts: [...], updatedAt }
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

    seen_texts = set()
    alerts = []

    for src in SOURCES:
        try:
            html = fetch_html(src)
            posts = parse_telegram(html)
        except Exception:
            continue

        # Свежие посты идут последними — берём с конца
        for post in reversed(posts):
            text = post["text"]
            if not text or len(text) < 20:
                continue

            # Дедупликация по началу текста
            sig = text[:80]
            if sig in seen_texts:
                continue

            airports = detect_airports(text)
            restriction = is_restriction(text)
            resume = is_resume(text)

            if not airports or (not restriction and not resume):
                continue

            seen_texts.add(sig)

            status = "resume" if resume and not restriction else "restriction"
            alerts.append({
                "status": status,
                "airports": airports,
                "title": (
                    "Ограничения сняты"
                    if status == "resume"
                    else "Введены ограничения"
                ),
                "text": shorten(text, 240),
                "date": format_date(post["datetime"]),
                "source": src,
            })

            if len(alerts) >= 8:
                break

        if len(alerts) >= 8:
            break

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(
            {"alerts": alerts, "updatedAt": datetime.utcnow().isoformat() + "Z"},
            ensure_ascii=False,
        ),
        "isBase64Encoded": False,
    }
