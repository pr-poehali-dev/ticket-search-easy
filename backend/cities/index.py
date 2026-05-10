"""
Посещённые города пользователя (Паспорт путешественника).
GET / — список посещённых городов
POST / — добавить город
DELETE /{id} — убрать город (soft delete через is_active=false)
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p36523570_ticket_search_easy")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_id(token: str, cur) -> int | None:
    cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = '{token}' AND expires_at > NOW()")
    row = cur.fetchone()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = (event.get("headers") or {}).get("X-Auth-Token") or (event.get("headers") or {}).get("x-auth-token")
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user_id(token, cur)

    if not user_id:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    if method == "GET":
        cur.execute(
            f"SELECT id, city_name, country, iata_code, emoji, visited_at FROM {SCHEMA}.visited_cities WHERE user_id = {user_id} AND is_active = TRUE ORDER BY visited_at DESC"
        )
        rows = cur.fetchall()
        conn.close()
        cities = [{"id": r[0], "city_name": r[1], "country": r[2] or "", "iata_code": r[3] or "", "emoji": r[4] or "✈️", "visited_at": str(r[5])} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"cities": cities})}

    elif method == "POST":
        body = json.loads(event.get("body") or "{}")
        city_name = (body.get("city_name") or "").strip().replace("'", "''")
        country = (body.get("country") or "").strip().replace("'", "''")
        iata_code = (body.get("iata_code") or "").strip().upper().replace("'", "''")
        emoji = (body.get("emoji") or "✈️").strip()

        if not city_name:
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Название города обязательно"})}

        cur.execute(
            f"SELECT id, is_active FROM {SCHEMA}.visited_cities WHERE user_id = {user_id} AND city_name = '{city_name}'"
        )
        existing = cur.fetchone()

        if existing:
            if existing[1]:
                conn.close()
                return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Город уже добавлен"})}
            else:
                cur.execute(f"UPDATE {SCHEMA}.visited_cities SET is_active = TRUE, visited_at = NOW() WHERE id = {existing[0]}")
                conn.commit()
                conn.close()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": existing[0], "city_name": city_name})}

        cur.execute(
            f"INSERT INTO {SCHEMA}.visited_cities (user_id, city_name, country, iata_code, emoji) VALUES ({user_id}, '{city_name}', '{country}', '{iata_code}', '{emoji}') RETURNING id"
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": row[0], "city_name": city_name})}

    elif method == "DELETE":
        parts = path.rstrip("/").split("/")
        city_id = parts[-1] if parts else None
        if not city_id or not city_id.isdigit():
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажите id города"})}

        cur.execute(
            f"SELECT id FROM {SCHEMA}.visited_cities WHERE id = {city_id} AND user_id = {user_id} AND is_active = TRUE"
        )
        if not cur.fetchone():
            conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Город не найден"})}

        cur.execute(f"UPDATE {SCHEMA}.visited_cities SET is_active = FALSE WHERE id = {city_id} AND user_id = {user_id}")
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}