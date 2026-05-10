"""
Регистрация, вход и получение текущего пользователя.
POST /register — создать аккаунт
POST /login — войти, получить токен
GET /me — данные текущего пользователя по токену
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p36523570_ticket_search_easy")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    if method == "POST" and action == "register":
        return register(event)
    elif method == "POST" and action == "login":
        return login(event)
    elif method == "GET" and action == "me":
        return me(event)
    elif method == "POST":
        body = json.loads(event.get("body") or "{}")
        act = body.get("action", "")
        if act == "register":
            return register(event)
        elif act == "login":
            return login(event)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def register(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""
    first_name = (body.get("first_name") or "").strip()
    last_name = (body.get("last_name") or "").strip()

    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = '{email}'")
    if cur.fetchone():
        conn.close()
        return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Пользователь уже существует"})}

    pw_hash = hash_password(password)
    cur.execute(
        f"INSERT INTO {SCHEMA}.users (email, password_hash, first_name, last_name) VALUES ('{email}', '{pw_hash}', '{first_name}', '{last_name}') RETURNING id"
    )
    user_id = cur.fetchone()[0]

    token = secrets.token_hex(32)
    cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES ({user_id}, '{token}')")
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"token": token, "user": {"id": user_id, "email": email, "first_name": first_name, "last_name": last_name}}),
    }


def login(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Email и пароль обязательны"})}

    conn = get_conn()
    cur = conn.cursor()
    pw_hash = hash_password(password)

    cur.execute(f"SELECT id, email, first_name, last_name FROM {SCHEMA}.users WHERE email = '{email}' AND password_hash = '{pw_hash}'")
    row = cur.fetchone()
    if not row:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

    user_id, email, first_name, last_name = row
    token = secrets.token_hex(32)
    cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES ({user_id}, '{token}')")
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"token": token, "user": {"id": user_id, "email": email, "first_name": first_name, "last_name": last_name}}),
    }


def me(event: dict) -> dict:
    token = (event.get("headers") or {}).get("X-Auth-Token") or (event.get("headers") or {}).get("x-auth-token")
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT u.id, u.email, u.first_name, u.last_name, u.phone FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id WHERE s.token = '{token}' AND s.expires_at > NOW()"
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"id": row[0], "email": row[1], "first_name": row[2], "last_name": row[3], "phone": row[4]}),
    }