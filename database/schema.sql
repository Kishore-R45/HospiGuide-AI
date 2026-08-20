-- PostgreSQL schema for HospiGuide-AI

-- Drop tables if they exist to allow clean recreation
DROP TABLE IF EXISTS navigation_hints CASCADE;
DROP TABLE IF EXISTS symptom_mappings CASCADE;
DROP TABLE IF EXISTS pharmacy_services CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;

-- 1. Blocks Table
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    primary_function VARCHAR(255),
    floors VARCHAR(255),
    key_services TEXT
);

-- 2. Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
    floor VARCHAR(50) NOT NULL,
    room VARCHAR(100),
    location_hint TEXT
);

-- 3. Doctors Table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    specialty VARCHAR(100),
    specialization VARCHAR(100),
    room_number VARCHAR(50),
    timing VARCHAR(100),
    days VARCHAR(100)
);

-- 4. Pharmacy Services Table
CREATE TABLE pharmacy_services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
    floor VARCHAR(50) NOT NULL,
    room_number VARCHAR(50),
    timing VARCHAR(100),
    description TEXT
);

-- 5. Symptom Mappings (Knowledge Base for RAG)
CREATE TABLE symptom_mappings (
    id SERIAL PRIMARY KEY,
    symptom VARCHAR(255) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    doctor_type VARCHAR(100),
    rag_routing_note TEXT
);

-- 6. Navigation and Nearby-Location Metadata
CREATE TABLE navigation_hints (
    id SERIAL PRIMARY KEY,
    landmark_destination VARCHAR(255) NOT NULL,
    purpose VARCHAR(255),
    block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
    nearby_direction_hint TEXT
);
