-- Certificate Canvas Database Schema
-- Database: Canva
-- PostgreSQL schema matching the strict requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (for clean setup)
-- ============================================
DROP TABLE IF EXISTS authorized_canvases CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS canvas_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================
-- TABLES
-- ============================================

-- roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  role_name CHARACTER VARYING(50) UNIQUE NOT NULL
);

-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name CHARACTER VARYING(100) NOT NULL,
  username CHARACTER VARYING(50) UNIQUE NOT NULL,
  email CHARACTER VARYING(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name CHARACTER VARYING(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type CHARACTER VARYING(50) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- canvas_sessions table
CREATE TABLE canvas_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title CHARACTER VARYING(150) NOT NULL,
  is_authorized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- refresh_tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- authorized_canvases table
CREATE TABLE authorized_canvases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_session_id UUID UNIQUE NOT NULL REFERENCES canvas_sessions(id) ON DELETE CASCADE,
  author_name CHARACTER VARYING(100) NOT NULL,
  title CHARACTER VARYING(150) NOT NULL,
  authorized_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_canvas_sessions_user_id ON canvas_sessions(user_id);
CREATE INDEX idx_canvas_sessions_is_authorized ON canvas_sessions(is_authorized);
CREATE INDEX idx_authorized_canvases_canvas_session_id ON authorized_canvases(canvas_session_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for canvas_sessions table
CREATE TRIGGER update_canvas_sessions_updated_at
    BEFORE UPDATE ON canvas_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (role_name) VALUES ('admin'), ('user');

-- ============================================
-- VERIFICATION
-- ============================================

SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
