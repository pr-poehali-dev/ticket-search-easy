import json
import os
import urllib.parse
import urllib.request
from datetime import datetime


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
}


def fetch_min_price(origin: str, destination: str, token: str) -> dict | None:
    """
    Минимальная цена в одну сторону за ближайший год.
    Endpoint: prices/cheap (Travelpayouts Data API).
    """
    params = {
        "origin": origin,
        "destination": destination,
        "currency": "rub",
        "token": token,
    }
    url = "https://api.travelpayouts.com/v1/prices/cheap?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "KompasPrices/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None

    if not data.get("success"):
        return None

    dest_data = (data.get("data") or {}).get(destination) or {}
    if not dest_data:
        return None

    cheapest_price = None
    cheapest_dt = None
    for _flight_no, flight in dest_data.items():
        price = flight.get("price")
        depart = flight.get("departure_at", "")
        if price and (cheapest_price is None or price < cheapest_price):
            cheapest_price = price
            cheapest_dt = depart

    if cheapest_price is None:
        return None

    month_str = ""
    if cheapest_dt:
        try:
            dt = datetime.fromisoformat(cheapest_dt.replace("Z", "+00:00"))
            months = [
                "январь", "февраль", "март", "апрель", "май", "июнь",
                "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
            ]
            month_str = months[dt.month - 1]
        except (ValueError, IndexError):
            month_str = ""

    return {"price": int(cheapest_price), "month": month_str}


def handler(event: dict, context) -> dict:
    """
    Минимальные цены на билеты Москва -> города для блока советов.
    GET ?destinations=PKC,KZN,IKT,... -> { prices: { PKC: {price, month}, ... }, updatedAt }
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

    token = os.environ.get("TRAVELPAYOUTS_TOKEN", "")
    if not token:
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"prices": {}, "updatedAt": datetime.utcnow().isoformat() + "Z", "error": "no_token"}),
            "isBase64Encoded": False,
        }

    params = event.get("queryStringParameters") or {}
    origin = (params.get("origin") or "MOW").upper()
    destinations_raw = params.get("destinations") or ""
    destinations = [d.strip().upper() for d in destinations_raw.split(",") if d.strip()]

    if not destinations:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "destinations required"}),
            "isBase64Encoded": False,
        }

    prices: dict = {}
    for dest in destinations[:20]:
        if dest == origin:
            continue
        info = fetch_min_price(origin, dest, token)
        if info:
            prices[dest] = info

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(
            {
                "prices": prices,
                "origin": origin,
                "updatedAt": datetime.utcnow().isoformat() + "Z",
            },
            ensure_ascii=False,
        ),
        "isBase64Encoded": False,
    }
