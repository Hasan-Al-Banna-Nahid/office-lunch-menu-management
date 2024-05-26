CREATE TABLE users (
    id SERIAL PRIMARY KEY ,
    username VARCHAR(255) UNIQUE  NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    office VARCHAR(255),
    nid_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    photo VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
    is_verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6)
);
