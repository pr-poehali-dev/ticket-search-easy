import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime


RSS_FEEDS = [
    ("Путешествия", "https://lenta.ru/rss/news/travel"),
    ("Туризм", "https://tass.ru/turizm/rss.xml"),
    ("Авиация", "https://tass.ru/transport/rss.xml"),
]

STOP_WORDS = [
    "секс", "эротик", "порно", "рабын", "рабов", "рабыня", "проститут",
    "бордел", "интим", "стриптиз", "наркотик", "наркот", "наркоман",
    "казино", "ставк", "букмекер", "гемблинг", "мошенник", "скам",
    "убийств", "теракт", "взрыв", "катастроф", "крушени",
]


def is_clean(title: str, desc: str) -> bool:
    text = (title + " " + desc).lower()
    return not any(w in text for w in STOP_WORDS)


ICON_BY_TAG = {
    "Авиация": "Plane",
    "Туризм": "Globe",
    "Путешествия": "MapPin",
    "Визы": "FileCheck",
    "Аэропорты": "Building2",
}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
}


def fetch_feed(url: str, timeout: int = 6) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; TravelNewsBot/1.0)",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
            "Accept-Language": "ru,en;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def strip_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    text = text.replace("&quot;", '"').replace("&laquo;", '"').replace("&raquo;", '"')
    text = text.replace("&mdash;", "—").replace("&ndash;", "–")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def detect_tag(title: str, default_tag: str) -> str:
    t = title.lower()
    if any(k in t for k in ["виз", "безвиз", "паспорт"]):
        return "Визы"
    if any(k in t for k in ["аэропорт", "терминал", "шереметьев", "внуков", "пулков"]):
        return "Аэропорты"
    if any(k in t for k in ["рейс", "самолёт", "самолет", "авиа", "перелёт", "перелет", "авиакомпан"]):
        return "Авиация"
    if any(k in t for k in ["отель", "курорт", "пляж", "тур ", "туроператор", "путёвк", "путевк"]):
        return "Туризм"
    return default_tag


def parse_rss(xml_bytes: bytes, default_tag: str, limit: int = 4):
    items = []
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return items

    for item in root.iter("item"):
        title_el = item.find("title")
        desc_el = item.find("description")
        link_el = item.find("link")
        date_el = item.find("pubDate")

        title = strip_html(title_el.text if title_el is not None else "")
        desc = strip_html(desc_el.text if desc_el is not None else "")
        link = (link_el.text or "").strip() if link_el is not None else ""

        if not title:
            continue

        if not is_clean(title, desc):
            continue

        if len(desc) > 160:
            desc = desc[:157].rstrip() + "..."

        date_str = ""
        if date_el is not None and date_el.text:
            try:
                dt = parsedate_to_datetime(date_el.text.strip())
                months = [
                    "янв", "фев", "мар", "апр", "мая", "июн",
                    "июл", "авг", "сен", "окт", "ноя", "дек",
                ]
                date_str = f"{dt.day} {months[dt.month - 1]}"
            except (TypeError, ValueError, IndexError):
                date_str = ""

        tag = detect_tag(title, default_tag)
        items.append({
            "tag": tag.upper(),
            "date": date_str,
            "title": title,
            "desc": desc,
            "link": link,
            "icon": ICON_BY_TAG.get(tag, "Newspaper"),
        })
        if len(items) >= limit:
            break

    return items


def handler(event: dict, context) -> dict:
    """
    Свежие новости для путешественников: ТАСС (туризм/транспорт) + Лента.ру (путешествия).
    GET -> { news: [...], updatedAt }
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

    all_news = []
    seen_titles = set()

    for tag, url in RSS_FEEDS:
        try:
            data = fetch_feed(url)
            items = parse_rss(data, tag, limit=8)
            for it in items:
                key = it["title"].lower()[:60]
                if key in seen_titles:
                    continue
                seen_titles.add(key)
                all_news.append(it)
        except Exception:
            continue

    if len(all_news) < 6:
        backup = [
            {
                "tag": "ВИЗЫ",
                "date": "",
                "title": "Таиланд продлил безвизовый въезд для россиян до 60 дней",
                "desc": "Правило действует при наличии обратного билета и подтверждённого жилья.",
                "link": "",
                "icon": "FileCheck",
            },
            {
                "tag": "АВИАЦИЯ",
                "date": "",
                "title": "Расширяются рейсы в Гавану и Варадеро на лето",
                "desc": "Прямые перелёты из Москвы — 3 раза в неделю.",
                "link": "",
                "icon": "Plane",
            },
            {
                "tag": "АЭРОПОРТЫ",
                "date": "",
                "title": "Шереметьево обновило терминал C",
                "desc": "Новые зоны досмотра и автоматические стойки регистрации.",
                "link": "",
                "icon": "Building2",
            },
            {
                "tag": "ТУРИЗМ",
                "date": "",
                "title": "Турция упростила процедуру электронной визы",
                "desc": "Срок оформления e-Visa сократился до нескольких минут.",
                "link": "",
                "icon": "Globe",
            },
            {
                "tag": "ПУТЕШЕСТВИЯ",
                "date": "",
                "title": "ОАЭ запустили новые маршруты в горы Хаджар",
                "desc": "Туристические тропы и кемпинги в эмирате Рас-эль-Хайма.",
                "link": "",
                "icon": "MapPin",
            },
            {
                "tag": "АВИАЦИЯ",
                "date": "",
                "title": "Россия и Индия расширили авиасообщение",
                "desc": "Добавлены рейсы Москва — Гоа и Санкт-Петербург — Дели.",
                "link": "",
                "icon": "Plane",
            },
        ]
        existing = {n["title"].lower()[:60] for n in all_news}
        for b in backup:
            if len(all_news) >= 6:
                break
            if b["title"].lower()[:60] not in existing:
                all_news.append(b)

    body = {
        "news": all_news[:6],
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    }

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, ensure_ascii=False),
        "isBase64Encoded": False,
    }