import json
import os
import re
import urllib.request
import urllib.error
import psycopg2

ADMIN_EMAIL = "centr.mol89@bk.ru"
SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p36523570_ticket_search_easy")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    "Content-Type": "application/json; charset=utf-8",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def safe_str(value, max_len: int = 500) -> str:
    if value is None:
        return ""
    s = str(value).replace("'", "''")
    return s[:max_len]


def get_user(token: str, cur):
    if not token:
        return None
    safe_token = re.sub(r"[^a-zA-Z0-9]", "", token)[:128]
    if not safe_token:
        return None
    cur.execute(
        f"SELECT u.id, u.email, u.first_name, u.last_name, u.phone "
        f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
        f"WHERE s.token = '{safe_token}' AND s.expires_at > NOW()"
    )
    row = cur.fetchone()
    if not row:
        return None
    return {
        "id": row[0],
        "email": row[1] or "",
        "first_name": row[2] or "",
        "last_name": row[3] or "",
        "phone": row[4] or "",
    }


def is_admin(user) -> bool:
    return user and (user.get("email") or "").strip().lower() == ADMIN_EMAIL


def err(status: int, msg: str) -> dict:
    return {
        "statusCode": status,
        "headers": CORS,
        "body": json.dumps({"error": msg}, ensure_ascii=False),
        "isBase64Encoded": False,
    }


def ok(payload) -> dict:
    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps(payload, ensure_ascii=False, default=str),
        "isBase64Encoded": False,
    }


def fetch_ticket(cur, ticket_id: int):
    cur.execute(
        f"SELECT t.id, t.user_id, t.subject, t.department, t.city, "
        f"t.contact_phone, t.contact_email, t.contact_position, t.status, "
        f"t.created_at, t.updated_at, t.closed_at, "
        f"u.email, u.first_name, u.last_name, u.phone "
        f"FROM {SCHEMA}.tickets t JOIN {SCHEMA}.users u ON u.id = t.user_id "
        f"WHERE t.id = {int(ticket_id)}"
    )
    row = cur.fetchone()
    if not row:
        return None
    return {
        "id": row[0],
        "user_id": row[1],
        "subject": row[2],
        "department": row[3],
        "city": row[4] or "",
        "contact_phone": row[5] or "",
        "contact_email": row[6] or "",
        "contact_position": row[7] or "",
        "status": row[8],
        "created_at": row[9].isoformat() if row[9] else None,
        "updated_at": row[10].isoformat() if row[10] else None,
        "closed_at": row[11].isoformat() if row[11] else None,
        "user_email": row[12] or "",
        "user_first_name": row[13] or "",
        "user_last_name": row[14] or "",
        "user_phone": row[15] or "",
    }


def fetch_messages(cur, ticket_id: int):
    cur.execute(
        f"SELECT id, ticket_id, user_id, author_role, body, created_at "
        f"FROM {SCHEMA}.ticket_messages WHERE ticket_id = {int(ticket_id)} "
        f"ORDER BY id ASC"
    )
    rows = cur.fetchall()
    return [
        {
            "id": r[0],
            "ticket_id": r[1],
            "user_id": r[2],
            "author_role": r[3],
            "body": r[4],
            "created_at": r[5].isoformat() if r[5] else None,
        }
        for r in rows
    ]


def list_tickets(cur, user, params):
    admin = is_admin(user)
    scope = ((params or {}).get("scope") or "").lower()
    conditions = []

    if not admin or scope == "mine":
        conditions.append(f"t.user_id = {int(user['id'])}")

    if admin and scope != "mine":
        status_filter = (params or {}).get("status")
        if status_filter in ("open", "closed"):
            conditions.append(f"t.status = '{status_filter}'")

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    cur.execute(
        f"SELECT t.id, t.user_id, t.subject, t.department, t.city, "
        f"t.status, t.created_at, t.updated_at, "
        f"u.email, u.first_name, u.last_name, "
        f"(SELECT COUNT(*) FROM {SCHEMA}.ticket_messages m WHERE m.ticket_id = t.id) "
        f"FROM {SCHEMA}.tickets t JOIN {SCHEMA}.users u ON u.id = t.user_id "
        f"{where} ORDER BY t.updated_at DESC LIMIT 200"
    )
    rows = cur.fetchall()
    return [
        {
            "id": r[0],
            "user_id": r[1],
            "subject": r[2],
            "department": r[3],
            "city": r[4] or "",
            "status": r[5],
            "created_at": r[6].isoformat() if r[6] else None,
            "updated_at": r[7].isoformat() if r[7] else None,
            "user_email": r[8] or "",
            "user_first_name": r[9] or "",
            "user_last_name": r[10] or "",
            "messages_count": r[11],
        }
        for r in rows
    ]


def generate_ai_reply(subject: str, message: str, department: str, city: str, history: list) -> str:
    api_key = os.environ.get("POLZA_AI_API_KEY", "").strip()
    if not api_key:
        return ""

    system_prompt = (
        "Ты — вежливый ассистент техподдержки сервиса по подбору авиабилетов и путешествий. "
        "Отвечай по-русски, кратко (до 6 предложений), по делу. "
        "Если вопрос требует действий администратора (возврат, изменение данных, спор) — "
        "успокой пользователя и сообщи, что специалист подключится в ближайшее время. "
        "Если можешь дать полезный совет (как искать билеты, что такое город, как пользоваться сервисом) — дай его. "
        "Не выдумывай факты о бронированиях пользователя."
    )

    user_intro = (
        f"Тема: {subject}\n"
        f"Раздел: {department}\n"
        + (f"Город: {city}\n" if city else "")
        + f"\nСообщение пользователя:\n{message}"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for h in history:
        role = "assistant" if h.get("author_role") in ("admin", "ai") else "user"
        messages.append({"role": role, "content": h.get("body") or ""})
    messages.append({"role": "user", "content": user_intro})

    payload = json.dumps({
        "model": "openai/gpt-4o-mini",
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 400,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.polza.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return (data.get("choices") or [{}])[0].get("message", {}).get("content", "").strip()
    except Exception:
        return ""


def insert_ai_message(cur, ticket_id: int, text: str) -> None:
    safe = text.replace("'", "''")
    cur.execute(
        f"INSERT INTO {SCHEMA}.ticket_messages (ticket_id, user_id, author_role, body) "
        f"VALUES ({int(ticket_id)}, NULL, 'ai', '{safe}')"
    )
    cur.execute(
        f"UPDATE {SCHEMA}.tickets SET updated_at = NOW() WHERE id = {int(ticket_id)}"
    )


def create_ticket(cur, conn, user, body):
    subject = safe_str(body.get("subject"), 300).strip()
    message = safe_str(body.get("message"), 5000).strip()
    department = safe_str(body.get("department") or "Общие вопросы", 150).strip()
    city = safe_str(body.get("city") or "", 150).strip()
    contact_phone = safe_str(body.get("contact_phone") or user.get("phone") or "", 50).strip()
    contact_email = safe_str(body.get("contact_email") or user.get("email") or "", 255).strip()
    contact_position = safe_str(body.get("contact_position") or "", 150).strip()

    if not subject or not message:
        return err(400, "Тема и текст обращения обязательны")

    cur.execute(
        f"INSERT INTO {SCHEMA}.tickets "
        f"(user_id, subject, department, city, contact_phone, contact_email, contact_position) "
        f"VALUES ({int(user['id'])}, '{subject}', '{department}', '{city}', "
        f"'{contact_phone}', '{contact_email}', '{contact_position}') RETURNING id"
    )
    ticket_id = cur.fetchone()[0]

    safe_msg = message.replace("'", "''")
    cur.execute(
        f"INSERT INTO {SCHEMA}.ticket_messages (ticket_id, user_id, author_role, body) "
        f"VALUES ({int(ticket_id)}, {int(user['id'])}, 'user', '{safe_msg}')"
    )
    conn.commit()

    ai_text = generate_ai_reply(subject, message, department, city, [])
    if ai_text:
        insert_ai_message(cur, ticket_id, ai_text)
        conn.commit()

    ticket = fetch_ticket(cur, ticket_id)
    messages = fetch_messages(cur, ticket_id)
    return ok({"ticket": ticket, "messages": messages})


def post_message(cur, conn, user, ticket_id: int, body):
    ticket = fetch_ticket(cur, ticket_id)
    if not ticket:
        return err(404, "Обращение не найдено")

    admin = is_admin(user)
    if not admin and ticket["user_id"] != user["id"]:
        return err(403, "Нет доступа")

    if ticket["status"] == "closed":
        return err(400, "Обращение закрыто, ответы недоступны")

    text = safe_str(body.get("body"), 5000).strip()
    if not text:
        return err(400, "Сообщение не может быть пустым")

    role = "admin" if admin else "user"
    safe_text = text.replace("'", "''")
    cur.execute(
        f"INSERT INTO {SCHEMA}.ticket_messages (ticket_id, user_id, author_role, body) "
        f"VALUES ({int(ticket_id)}, {int(user['id'])}, '{role}', '{safe_text}')"
    )
    cur.execute(
        f"UPDATE {SCHEMA}.tickets SET updated_at = NOW() WHERE id = {int(ticket_id)}"
    )
    conn.commit()

    if not admin:
        history = fetch_messages(cur, ticket_id)
        ai_text = generate_ai_reply(
            ticket.get("subject") or "",
            text,
            ticket.get("department") or "",
            ticket.get("city") or "",
            history,
        )
        if ai_text:
            insert_ai_message(cur, ticket_id, ai_text)
            conn.commit()

    return ok({
        "ticket": fetch_ticket(cur, ticket_id),
        "messages": fetch_messages(cur, ticket_id),
    })


def close_ticket(cur, conn, user, ticket_id: int):
    if not is_admin(user):
        return err(403, "Только администратор может закрыть обращение")
    ticket = fetch_ticket(cur, ticket_id)
    if not ticket:
        return err(404, "Обращение не найдено")
    cur.execute(
        f"UPDATE {SCHEMA}.tickets SET status = 'closed', closed_at = NOW(), "
        f"updated_at = NOW() WHERE id = {int(ticket_id)}"
    )
    conn.commit()
    return ok({"ticket": fetch_ticket(cur, ticket_id)})


def reopen_ticket(cur, conn, user, ticket_id: int):
    if not is_admin(user):
        return err(403, "Только администратор может переоткрыть обращение")
    ticket = fetch_ticket(cur, ticket_id)
    if not ticket:
        return err(404, "Обращение не найдено")
    cur.execute(
        f"UPDATE {SCHEMA}.tickets SET status = 'open', closed_at = NULL, "
        f"updated_at = NOW() WHERE id = {int(ticket_id)}"
    )
    conn.commit()
    return ok({"ticket": fetch_ticket(cur, ticket_id)})


def get_ticket_full(cur, user, ticket_id: int):
    ticket = fetch_ticket(cur, ticket_id)
    if not ticket:
        return err(404, "Обращение не найдено")
    if not is_admin(user) and ticket["user_id"] != user["id"]:
        return err(403, "Нет доступа")
    messages = fetch_messages(cur, ticket_id)
    return ok({"ticket": ticket, "messages": messages})


def handler(event: dict, context) -> dict:
    """
    API обращений (тикетов).
    GET ?action=list — список обращений (свои или все, если админ).
    GET ?action=get&id=N — обращение + сообщения.
    POST ?action=create — создать обращение (нужна авторизация).
    POST ?action=message&id=N — отправить сообщение в обращение.
    POST ?action=close&id=N — закрыть (только админ).
    POST ?action=reopen&id=N — переоткрыть (только админ).
    """
    method = event.get("httpMethod", "GET")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token") or ""

    params = event.get("queryStringParameters") or {}
    action = (params.get("action") or "").lower()

    raw_body = event.get("body") or "{}"
    try:
        body = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
    except json.JSONDecodeError:
        body = {}

    conn = get_conn()
    try:
        cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            return err(401, "Требуется авторизация")

        if method == "GET" and action == "list":
            return ok({"tickets": list_tickets(cur, user, params)})

        if method == "GET" and action == "get":
            ticket_id = int(params.get("id") or 0)
            if not ticket_id:
                return err(400, "Не указан id")
            return get_ticket_full(cur, user, ticket_id)

        if method == "POST" and action == "create":
            return create_ticket(cur, conn, user, body)

        if method == "POST" and action == "message":
            ticket_id = int(params.get("id") or body.get("ticket_id") or 0)
            if not ticket_id:
                return err(400, "Не указан id")
            return post_message(cur, conn, user, ticket_id, body)

        if method == "POST" and action == "close":
            ticket_id = int(params.get("id") or body.get("ticket_id") or 0)
            if not ticket_id:
                return err(400, "Не указан id")
            return close_ticket(cur, conn, user, ticket_id)

        if method == "POST" and action == "reopen":
            ticket_id = int(params.get("id") or body.get("ticket_id") or 0)
            if not ticket_id:
                return err(400, "Не указан id")
            return reopen_ticket(cur, conn, user, ticket_id)

        return err(400, "Неизвестное действие")
    finally:
        conn.close()