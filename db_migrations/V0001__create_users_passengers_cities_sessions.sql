CREATE TABLE IF NOT EXISTS t_p36523570_ticket_search_easy.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p36523570_ticket_search_easy.passengers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p36523570_ticket_search_easy.users(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(10),
    passport_series VARCHAR(10),
    passport_number VARCHAR(20),
    passport_issued_by TEXT,
    passport_issued_date DATE,
    passport_expires_date DATE,
    citizenship VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p36523570_ticket_search_easy.visited_cities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p36523570_ticket_search_easy.users(id),
    city_name VARCHAR(200) NOT NULL,
    country VARCHAR(200),
    iata_code VARCHAR(10),
    emoji VARCHAR(10),
    visited_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, city_name)
);

CREATE TABLE IF NOT EXISTS t_p36523570_ticket_search_easy.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p36523570_ticket_search_easy.users(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);
