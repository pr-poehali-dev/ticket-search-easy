import json
import os
import re
import urllib.request
from datetime import datetime, timezone, timedelta

import psycopg2


ADMIN_EMAIL = "centr.mol89@bk.ru"

# Источники Росавиации (официальный сайт, без Telegram)
SOURCES = [
    "https://favt.gov.ru/novosti-novosti/",
    "https://favt.gov.ru/glavnaya/",
]

# Аэропорт -> (Город, ключевые слова в нижнем регистре)
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
    "ограничен", "ограничения",
    "временно закрыт", "временно закрыто",
    "приостановлен", "приостановлены",
    "не принима",
]

RESUME_KEYWORDS = [
    "сняты", "снято",
    "возобновлен", "возобновлён",
    "вновь принимает",
    "штатно", "штатном режиме",
]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Email",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
}


def fetch_html(url: str, timeout: int = 7) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; KompasBot/1.0)",
            "Accept-Language": "ru,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def strip_html(text: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&quot;", '"', text)
    text = re.sub(r"&laquo;|&raquo;", '"', text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_favt(html: str):
    """Парсим новости с favt.gov.ru — берём заголовки и даты."""
    items = []
    # Каждая новость на favt оформлена блоком со ссылкой и датой формата DD.MM.YYYY
    block_pattern = re.compile(
        r'<a[^>]+href="(/novosti-novosti/[^"]+)"[^>]*>(.*?)</a>',
        re.DOTALL | re.IGNORECASE,
    )
    date_pattern = re.compile(r"(\d{2})\.(\d{2})\.(\d{4})")

    for m in block_pattern.finditer(html):
        title = strip_html(m.group(2))
        if not title or len(title) < 10:
            continue
        # Ищем дату в ближайшем окружении (до 400 символов после)
        tail = html[m.end():m.end() + 400]
        dm = date_pattern.search(tail)
        iso = ""
        if dm:
            try:
                dt = datetime(int(dm.group(3)), int(dm.group(2)), int(dm.group(1)), 12, 0, tzinfo=timezone.utc)
                iso = dt.isoformat()
            except ValueError:
                iso = ""
        items.append({"text": title, "datetime": iso})
    return items


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
        months = ["янв", "фев", "мар", "апр", "мая", "июн",
                  "июл", "авг", "сен", "окт", "ноя", "дек"]
        return {
            "text": f"{msk.day} {months[msk.month - 1]}, {msk.strftime('%H:%M')}",
            "iso": dt.isoformat(),
        }
    except (ValueError, IndexError):
        return {"text": "", "iso": ""}


def db_connect():
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        return None
    try:
        return psycopg2.connect(dsn)
    except Exception:
        return None


def load_overrides():
    """Возвращает (forced_add: dict, forced_remove: set).
    Для каждого аэропорта берём самую свежую запись."""
    conn = db_connect()
    if conn is None:
        return {}, set()
    forced_add = {}
    forced_remove = set()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT ON (airport)
                  airport, city, action, restricted_at, created_at
                FROM airport_overrides
                ORDER BY airport, created_at DESC
            """)
            for row in cur.fetchall():
                airport, city, action, restricted_at, created_at = row
                if action == "add":
                    iso = (restricted_at or created_at).isoformat()
                    forced_add[airport] = {
                        "airport": airport,
                        "city": city,
                        "restrictedAt": format_dt(iso)["text"],
                        "restrictedAtIso": iso,
                        "resumedAt": None,
                        "resumedAtIso": None,
                    }
                elif action == "remove":
                    forced_remove.add(airport)
    finally:
        conn.close()
    return forced_add, forced_remove


def list_overrides_raw():
    conn = db_connect()
    if conn is None:
        return []
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, airport, city, action, restricted_at, note, created_by, created_at
                FROM airport_overrides
                ORDER BY created_at DESC
                LIMIT 200
            """)
            rows = cur.fetchall()
        return [{
            "id": r[0],
            "airport": r[1],
            "city": r[2],
            "action": r[3],
            "restrictedAt": r[4].isoformat() if r[4] else None,
            "note": r[5] or "",
            "createdBy": r[6] or "",
            "createdAt": r[7].isoformat(),
        } for r in rows]
    finally:
        conn.close()


def add_override(airport: str, city: str, action: str, note: str, email: str):
    conn = db_connect()
    if conn is None:
        return False
    try:
        with conn.cursor() as cur:
            airport_safe = airport.replace("'", "''")
            city_safe = city.replace("'", "''")
            action_safe = action.replace("'", "''")
            note_safe = (note or "").replace("'", "''")
            email_safe = (email or "").replace("'", "''")
            cur.execute(f"""
                INSERT INTO airport_overrides (airport, city, action, restricted_at, note, created_by)
                VALUES ('{airport_safe}', '{city_safe}', '{action_safe}', NOW(), '{note_safe}', '{email_safe}')
            """)
        conn.commit()
        return True
    finally:
        conn.close()


def delete_override(override_id: int):
    conn = db_connect()
    if conn is None:
        return False
    try:
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM airport_overrides WHERE id = {int(override_id)}")
        conn.commit()
        return True
    finally:
        conn.close()


def collect_auto_state():
    """Парсим favt.gov.ru и собираем словарь state."""
    state = {}
    for src in SOURCES:
        try:
            html = fetch_html(src)
            posts = parse_favt(html)
        except Exception:
            continue

        for post in posts:
            text = post["text"]
            if not text:
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
                    if not entry["resumedAtIso"] or (dt_info["iso"] and dt_info["iso"] > entry["resumedAtIso"]):
                        entry["resumedAt"] = dt_info["text"]
                        entry["resumedAtIso"] = dt_info["iso"]
                elif restriction:
                    if not entry["restrictedAtIso"] or (dt_info["iso"] and dt_info["iso"] > entry["restrictedAtIso"]):
                        entry["restrictedAt"] = dt_info["text"]
                        entry["restrictedAtIso"] = dt_info["iso"]
                        if entry["resumedAtIso"] and entry["resumedAtIso"] < dt_info["iso"]:
                            entry["resumedAt"] = None
                            entry["resumedAtIso"] = None
                state[ap_name] = entry
    return state


def build_items():
    state = collect_auto_state()
    forced_add, forced_remove = load_overrides()

    # Применяем ручные правки
    for name, entry in forced_add.items():
        existing = state.get(name)
        if existing:
            # Перебиваем ручной отметкой — считаем что закрыт
            existing["restrictedAt"] = entry["restrictedAt"]
            existing["restrictedAtIso"] = entry["restrictedAtIso"]
            existing["resumedAt"] = None
            existing["resumedAtIso"] = None
        else:
            state[name] = entry

    for name in forced_remove:
        state.pop(name, None)

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
            "sortIso": sort_iso or "",
        })

    items.sort(key=lambda x: (
        x["status"] != "restriction",
        x["sortIso"],
    ), reverse=False)

    for it in items:
        it.pop("sortIso", None)

    return items


def is_admin(event: dict) -> bool:
    headers = event.get("headers") or {}
    email = (headers.get("X-User-Email") or headers.get("x-user-email") or "").strip().lower()
    return email == ADMIN_EMAIL


def handler(event: dict, context) -> dict:
    """
    Статусы аэропортов России на основе favt.gov.ru + ручные правки админа.
    GET            -> { items, updatedAt }
    GET ?admin=1   -> { items, overrides } (только для админа)
    POST add       -> { ok: true }
    POST remove    -> { ok: true }
    POST delete    -> { ok: true }
    """
    method = event.get("httpMethod", "GET")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    if method == "GET":
        qs = event.get("queryStringParameters") or {}
        items = build_items()
        result = {"items": items, "updatedAt": datetime.utcnow().isoformat() + "Z"}
        if qs.get("admin") == "1" and is_admin(event):
            result["overrides"] = list_overrides_raw()
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(result, ensure_ascii=False),
            "isBase64Encoded": False,
        }

    if method == "POST":
        if not is_admin(event):
            return {
                "statusCode": 403,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Доступ только для администратора"}),
                "isBase64Encoded": False,
            }
        try:
            body = json.loads(event.get("body") or "{}")
        except Exception:
            body = {}
        op = body.get("op")
        headers = event.get("headers") or {}
        admin_email = (headers.get("X-User-Email") or headers.get("x-user-email") or "").strip()

        if op == "add":
            airport = (body.get("airport") or "").strip()
            city = (body.get("city") or "").strip()
            note = (body.get("note") or "").strip()
            if not airport or not city:
                return {"statusCode": 400, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "airport и city обязательны"}),
                        "isBase64Encoded": False}
            add_override(airport, city, "add", note, admin_email)
            return {"statusCode": 200, "headers": CORS_HEADERS,
                    "body": json.dumps({"ok": True}), "isBase64Encoded": False}

        if op == "remove":
            airport = (body.get("airport") or "").strip()
            city = (body.get("city") or "").strip()
            note = (body.get("note") or "").strip()
            if not airport:
                return {"statusCode": 400, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "airport обязателен"}),
                        "isBase64Encoded": False}
            add_override(airport, city or "", "remove", note, admin_email)
            return {"statusCode": 200, "headers": CORS_HEADERS,
                    "body": json.dumps({"ok": True}), "isBase64Encoded": False}

        if op == "delete":
            override_id = body.get("id")
            if not override_id:
                return {"statusCode": 400, "headers": CORS_HEADERS,
                        "body": json.dumps({"error": "id обязателен"}),
                        "isBase64Encoded": False}
            delete_override(int(override_id))
            return {"statusCode": 200, "headers": CORS_HEADERS,
                    "body": json.dumps({"ok": True}), "isBase64Encoded": False}

        return {"statusCode": 400, "headers": CORS_HEADERS,
                "body": json.dumps({"error": "unknown op"}),
                "isBase64Encoded": False}

    return {
        "statusCode": 405,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": "Method not allowed"}),
        "isBase64Encoded": False,
    }
