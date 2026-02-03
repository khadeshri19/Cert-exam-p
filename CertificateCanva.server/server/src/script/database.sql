-- Sarvarth Certificate Platform - Updated Database Schema
-- Matches prompt requirements for canvas_sessions and authorizations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (for clean setup)
-- ============================================
DROP TABLE IF EXISTS certificate_authorizations CASCADE;
DROP TABLE IF EXISTS verification_links CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;
DROP TABLE IF EXISTS canvas_sessions CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS images CASCADE;
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

-- images table (global/user assets)
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name CHARACTER VARYING(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type CHARACTER VARYING(50) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- canvas_sessions table (Matches Prompt Rule 5)
CREATE TABLE canvas_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title CHARACTER VARYING(150),
  canvas_data JSONB,
  certificate_id CHARACTER VARYING(100) UNIQUE,
  holder_name CHARACTER VARYING(150),
  certificate_title CHARACTER VARYING(150),
  issue_date DATE,
  organization_name CHARACTER VARYING(150),
  is_authorized BOOLEAN DEFAULT false,
  width INTEGER DEFAULT 800, -- Added for canvas dimensions
  height INTEGER DEFAULT 600, -- Added for canvas dimensions
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- certificate_authorizations table (Matches Prompt Rule 5)
CREATE TABLE certificate_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID NOT NULL REFERENCES canvas_sessions(id) ON DELETE CASCADE,
  authorized_by UUID NOT NULL REFERENCES users(id),
  authorized_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- uploaded_files table (Per session assets)
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_session_id UUID NOT NULL REFERENCES canvas_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name CHARACTER VARYING(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type CHARACTER VARYING(50) NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- refresh_tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_canvas_sessions_certificate_id ON canvas_sessions(certificate_id);
CREATE INDEX idx_canvas_sessions_user_id ON canvas_sessions(user_id);
CREATE INDEX idx_images_user_id ON images(user_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (role_name) VALUES ('admin'), ('user') ON CONFLICT (role_name) DO NOTHING;
