-- Install POSTGIS-extention
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop tables if they exist
DROP TABLE IF EXISTS marked_true;
DROP TABLE IF EXISTS marked_false;
DROP TABLE IF EXISTS roles_users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS blokkages;
DROP TABLE IF EXISTS users;


-- Create 'users' table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN
    );

-- Create 'blokkages' table
CREATE TABLE blokkages (
    id SERIAL PRIMARY KEY,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Create 'roles' table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) UNIQUE
);

-- Create association table between 'roles' and 'users'
CREATE TABLE roles_users (
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Create 'marked_false' table
CREATE TABLE marked_false (
    id SERIAL PRIMARY KEY,
    blokkage_id INTEGER REFERENCES blokkages(id),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Create 'marked_true' table
CREATE TABLE marked_true (
    id SERIAL PRIMARY KEY,
    blokkage_id INTEGER REFERENCES blokkages(id),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);