"""
Профиль пассажира: личные данные + паспорт.
GET / — получить профиль
PUT / — сохранить профиль
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p36523570_ticket_search_easy")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_id(token: str, cur) -> int | None:
    cur.execute(
        f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = '{token}' AND expires_at > NOW()"
    )
    row = cur.fetchone()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = (event.get("headers") or {}).get("X-Auth-Token") or (event.get("headers") or {}).get("x-auth-token")
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    method = event.get("httpMethod", "GET")
    conn = get_conn()
    cur = conn.cursor()
    user_id = get_user_id(token, cur)

    if not user_id:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    if method == "GET":
        cur.execute(
            f"SELECT first_name, last_name, middle_name, birth_date, gender, passport_series, passport_number, passport_issued_by, passport_issued_date, passport_expires_date, citizenship FROM {SCHEMA}.passengers WHERE user_id = {user_id}"
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({})}
        keys = ["first_name", "last_name", "middle_name", "birth_date", "gender", "passport_series", "passport_number", "passport_issued_by", "passport_issued_date", "passport_expires_date", "citizenship"]
        data = {}
        for i, k in enumerate(keys):
            v = row[i]
            data[k] = str(v) if v is not None else ""
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}

    elif method == "PUT":
        body = json.loads(event.get("body") or "{}")

        def s(val):
            return val.replace("'", "''") if val else ""

        fields = {
            "first_name": s(body.get("first_name", "")),
            "last_name": s(body.get("last_name", "")),
            "middle_name": s(body.get("middle_name", "")),
            "birth_date": s(body.get("birth_date", "")),
            "gender": s(body.get("gender", "")),
            "passport_series": s(body.get("passport_series", "")),
            "passport_number": s(body.get("passport_number", "")),
            "passport_issued_by": s(body.get("passport_issued_by", "")),
            "passport_issued_date": s(body.get("passport_issued_date", "")),
            "passport_expires_date": s(body.get("passport_expires_date", "")),
            "citizenship": s(body.get("citizenship", "")),
        }

        def val(v):
            return f"NULL" if not v else f"'{v}'"

        cur.execute(f"SELECT id FROM {SCHEMA}.passengers WHERE user_id = {user_id}")
        exists = cur.fetchone()

        if exists:
            set_clause = ", ".join([f"{k} = {val(v)}" for k, v in fields.items()])
            cur.execute(f"UPDATE {SCHEMA}.passengers SET {set_clause}, updated_at = NOW() WHERE user_id = {user_id}")
        else:
            cols = ", ".join(["user_id"] + list(fields.keys()))
            vals = ", ".join([str(user_id)] + [val(v) for v in fields.values()])
            cur.execute(f"INSERT INTO {SCHEMA}.passengers ({cols}) VALUES ({vals})")

        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
