import json
import urllib.request
import urllib.parse


CITIES = [
    {"city": "Дубай", "lat": 25.2048, "lon": 55.2708},
    {"city": "Стамбул", "lat": 41.0082, "lon": 28.9784},
    {"city": "Пхукет", "lat": 7.8804, "lon": 98.3923},
    {"city": "Сочи", "lat": 43.6028, "lon": 39.7342},
]

# Open-Meteo weather codes -> (description, lucide icon)
WEATHER_CODES = {
    0: ("Ясно", "Sun"),
    1: ("В основном ясно", "Sun"),
    2: ("Малооблачно", "CloudSun"),
    3: ("Облачно", "Cloud"),
    45: ("Туман", "CloudFog"),
    48: ("Туман", "CloudFog"),
    51: ("Морось", "CloudDrizzle"),
    53: ("Морось", "CloudDrizzle"),
    55: ("Морось", "CloudDrizzle"),
    61: ("Дождь", "CloudRain"),
    63: ("Дождь", "CloudRain"),
    65: ("Сильный дождь", "CloudRainWizard"),
    71: ("Снег", "CloudSnow"),
    73: ("Снег", "CloudSnow"),
    75: ("Сильный снег", "Snowflake"),
    80: ("Ливень", "CloudRain"),
    81: ("Ливень", "CloudRain"),
    82: ("Сильный ливень", "CloudRain"),
    95: ("Гроза", "CloudLightning"),
    96: ("Гроза", "CloudLightning"),
    99: ("Гроза", "CloudLightning"),
}

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
}


def fetch_weather(lat: float, lon: float, timeout: int = 6):
    params = urllib.parse.urlencode({
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,weather_code",
        "timezone": "auto",
    })
    url = f"https://api.open-meteo.com/v1/forecast?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read())


def handler(event: dict, context) -> dict:
    """
    Возвращает текущую погоду в популярных туристических городах.
    GET /weather -> { spots: [{city, temp, cond, icon}, ...] }
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

    spots = []
    for c in CITIES:
        try:
            data = fetch_weather(c["lat"], c["lon"])
            current = data.get("current", {})
            temp = current.get("temperature_2m")
            code = current.get("weather_code", 0)
            cond, icon = WEATHER_CODES.get(code, ("—", "Cloud"))
            if temp is None:
                continue
            temp_int = int(round(temp))
            temp_str = f"+{temp_int}°" if temp_int > 0 else f"{temp_int}°"
            spots.append({
                "city": c["city"],
                "temp": temp_str,
                "cond": cond,
                "icon": icon,
            })
        except Exception:
            spots.append({
                "city": c["city"],
                "temp": "—",
                "cond": "Нет данных",
                "icon": "Cloud",
            })

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"spots": spots}, ensure_ascii=False),
        "isBase64Encoded": False,
    }
