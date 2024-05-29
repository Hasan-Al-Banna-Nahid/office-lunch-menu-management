CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    office VARCHAR(255) NOT NULL,
    nid_number VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255) UNIQUE NOT NULL,
    photo VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6),
    otp_expiry TIMESTAMP
);
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    items JSONB
);
CREATE TABLE employee_choices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  menu_id INTEGER NOT NULL,
  choices JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, menu_id)
);
