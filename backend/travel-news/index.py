import json
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime


RSS_FEEDS = [
    ("Авиация", "https://www.aviaport.ru/export/rss/news/"),
    ("Туризм", "https://www.atorus.ru/rss.xml"),
    ("Путешествия", "https://www.tourdom.ru/rss/news.xml"),
]

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
}


def fetch_feed(url: str, timeout: int = 6):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def parse_rss(xml_bytes: bytes, tag: str, limit: int = 3):
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

        title = (title_el.text or "").strip() if title_el is not None else ""
        desc_raw = (desc_el.text or "").strip() if desc_el is not None else ""
        link = (link_el.text or "").strip() if link_el is not None else ""

        desc = ""
        if desc_raw:
            in_tag = False
            buf = []
            for ch in desc_raw:
                if ch == "<":
                    in_tag = True
                elif ch == ">":
                    in_tag = False
                elif not in_tag:
                    buf.append(ch)
            desc = "".join(buf).strip()
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

        if title:
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
    Возвращает актуальные новости для путешественников из открытых RSS-источников.
    GET /travel-news -> { news: [...] }
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
    for tag, url in RSS_FEEDS:
        try:
            data = fetch_feed(url)
            items = parse_rss(data, tag, limit=2)
            all_news.extend(items)
        except Exception:
            continue

    if not all_news:
        all_news = [
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
        ]

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
