CREATE TABLE IF NOT EXISTS t_p36523570_ticket_search_easy.tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    subject VARCHAR(300) NOT NULL,
    department VARCHAR(150) NOT NULL DEFAULT 'Общие вопросы',
    city VARCHAR(150),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    contact_position VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id2 ON t_p36523570_ticket_search_easy.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status2 ON t_p36523570_ticket_search_easy.tickets(status);

CREATE TABLE IF NOT EXISTS t_p36523570_ticket_search_easy.ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL,
    user_id INTEGER,
    author_role VARCHAR(20) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id2 ON t_p36523570_ticket_search_easy.ticket_messages(ticket_id);
